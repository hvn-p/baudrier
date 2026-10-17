import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../plugins/baudrier/skills/harness-setup/modules/test-first/scripts/guard-tests.mjs',
);
const { main } = await import(SCRIPT);

function repo(files) {
  const dir = mkdtempSync(join(tmpdir(), 'guard-tests-'));
  spawnSync('git', ['init', '-q'], { cwd: dir });
  for (const [path, content] of Object.entries(files)) write(dir, path, content);
  return dir;
}

function write(dir, path, content) {
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), content);
}

// In-process, so mutation testing can see the code run.
function guard(dir, ...args) {
  return main(args, dir);
}

const BASE = {
  'src/sum.js': 'export const sum = (a, b) => a + b;\n',
  'tests/sum.test.js': 'assert.equal(sum(1, 1), 2);\n',
};

test('check without a snapshot fails and says to take one', () => {
  const dir = repo(BASE);
  const r = guard(dir, 'check');
  assert.equal(r.code, 2);
  assert.match(r.err, /no snapshot\. Take one with `snapshot`/);
  rmSync(dir, { recursive: true });
});

test('check passes when no test changed', () => {
  const dir = repo(BASE);
  assert.equal(guard(dir, 'snapshot').code, 0);
  const r = guard(dir, 'check');
  assert.equal(r.code, 0);
  assert.match(r.out, /no test changed/);
  rmSync(dir, { recursive: true });
});

test('a change outside the tests does not trip the guard', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  write(dir, 'src/sum.js', 'export const sum = (a, b) => b + a;\n');
  assert.equal(guard(dir, 'check').code, 0);
  rmSync(dir, { recursive: true });
});

test('a modified test without a reason fails, naming the file and both ways out', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  write(dir, 'tests/sum.test.js', 'assert.equal(sum(1, 1), 3);\n');
  const r = guard(dir, 'check');
  assert.equal(r.code, 1);
  assert.match(r.err, /modified\s+tests\/sum\.test\.js/);
  assert.match(r.err, /undo/i);
  assert.match(r.err, /--reason tests\/sum\.test\.js=/);
  rmSync(dir, { recursive: true });
});

test('an added test file is detected, even untracked', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  write(dir, 'tests/extra.test.js', 'assert.ok(true);\n');
  const r = guard(dir, 'check');
  assert.equal(r.code, 1);
  assert.match(r.err, /added\s+tests\/extra\.test\.js/);
  rmSync(dir, { recursive: true });
});

test('a removed test file is detected', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  rmSync(join(dir, 'tests/sum.test.js'));
  const r = guard(dir, 'check');
  assert.equal(r.code, 1);
  assert.match(r.err, /removed\s+tests\/sum\.test\.js/);
  rmSync(dir, { recursive: true });
});

test('a reason per changed file passes and prints the table for the report', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  write(dir, 'tests/sum.test.js', 'assert.equal(sum(1, 1), 3);\n');
  const r = guard(dir, 'check', '--reason', 'tests/sum.test.js=the plan says 1+1 is 3');
  assert.equal(r.code, 0);
  assert.equal(
    r.out,
    '| File | Change | Reason |\n' +
      '|---|---|---|\n' +
      '| tests/sum.test.js | modified | the plan says 1+1 is 3 |\n',
  );
  rmSync(dir, { recursive: true });
});

test('one reason does not cover two changed files', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  write(dir, 'tests/sum.test.js', 'assert.equal(sum(1, 1), 3);\n');
  write(dir, 'tests/extra.test.js', 'assert.ok(true);\n');
  const r = guard(dir, 'check', '--reason', 'tests/sum.test.js=wrong expectation');
  assert.equal(r.code, 1);
  assert.match(r.err, /tests\/extra\.test\.js/);
  assert.doesNotMatch(r.err, /modified\s+tests\/sum\.test\.js/);
  rmSync(dir, { recursive: true });
});

test('an empty reason is refused', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  write(dir, 'tests/sum.test.js', 'assert.equal(sum(1, 1), 3);\n');
  const r = guard(dir, 'check', '--reason', 'tests/sum.test.js=  ');
  assert.equal(r.code, 1);
  assert.match(r.err, /empty reason/);
  rmSync(dir, { recursive: true });
});

test('a reason for a file that did not change is refused', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  const r = guard(dir, 'check', '--reason', 'tests/sum.test.js=nothing to justify');
  assert.equal(r.code, 1);
  assert.match(r.err, /did not change/);
  rmSync(dir, { recursive: true });
});

test('the check works from a subdirectory, with paths from the repository root', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  write(dir, 'tests/sum.test.js', 'assert.equal(sum(1, 1), 3);\n');
  const r = guard(join(dir, 'src'), 'check', '--reason', 'tests/sum.test.js=wrong expectation');
  assert.equal(r.code, 0);
  assert.equal(
    r.out,
    '| File | Change | Reason |\n' + '|---|---|---|\n' + '| tests/sum.test.js | modified | wrong expectation |\n',
  );
  rmSync(dir, { recursive: true });
});

test('the snapshot lives in the git directory, so the working tree stays clean', () => {
  const dir = repo(BASE);
  assert.equal(guard(dir, 'snapshot').code, 0);
  assert.equal(guard(dir, 'check').code, 0);
  const status = spawnSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' }).stdout;
  assert.doesNotMatch(status, /guard/);
  rmSync(dir, { recursive: true });
});

test('an unknown command prints the usage', () => {
  const dir = repo(BASE);
  const r = guard(dir, 'frobnicate');
  assert.equal(r.code, 2);
  assert.match(r.err, /snapshot/);
  assert.match(r.err, /check/);
  rmSync(dir, { recursive: true });
});

test('run from the command line, it prints its output and sets the exit code', () => {
  const dir = repo(BASE);
  const run = (...args) =>
    spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
  assert.equal(run('snapshot').status, 0);
  write(dir, 'tests/sum.test.js', 'assert.equal(sum(1, 1), 3);\n');
  const r = run('check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /modified\s+tests\/sum\.test\.js/);
  assert.equal(r.stdout, '');
  rmSync(dir, { recursive: true });
});

test('run from the command line, a justified change prints the whole table on stdout', () => {
  const dir = repo(BASE);
  const run = (...args) =>
    spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
  run('snapshot');
  write(dir, 'tests/sum.test.js', 'assert.equal(sum(1, 1), 3);\n');
  const r = run('check', '--reason', 'tests/sum.test.js=the plan says 1+1 is 3');
  assert.equal(r.status, 0);
  assert.equal(
    r.stdout,
    '| File | Change | Reason |\n' +
      '|---|---|---|\n' +
      '| tests/sum.test.js | modified | the plan says 1+1 is 3 |\n',
  );
  assert.equal(r.stderr, '');
  rmSync(dir, { recursive: true });
});

test('the guard protects its own copy, without the project listing it', () => {
  const dir = repo({ ...BASE, 'scripts/guard-tests.mjs': readFileSync(SCRIPT) });
  const run = (...args) =>
    spawnSync(process.execPath, ['scripts/guard-tests.mjs', ...args], { cwd: dir, encoding: 'utf8' });
  assert.equal(run('snapshot').status, 0);
  assert.equal(run('check').status, 0);
  writeFileSync(join(dir, 'scripts/guard-tests.mjs'), '// neutralised\n', { flag: 'a' });
  const r = run('check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /modified\s+scripts\/guard-tests\.mjs/);
  rmSync(dir, { recursive: true });
});

test('the way out names the guard by its path from where it was run', () => {
  const dir = repo({ ...BASE, 'scripts/guard-tests.mjs': readFileSync(SCRIPT) });
  const run = (cwd, script, ...args) =>
    spawnSync(process.execPath, [script, ...args], { cwd: join(dir, cwd), encoding: 'utf8' });
  assert.equal(run('.', 'scripts/guard-tests.mjs', 'snapshot').status, 0);
  write(dir, 'tests/sum.test.js', 'assert.equal(sum(1, 1), 3);\n');
  let r = run('.', 'scripts/guard-tests.mjs', 'check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^  node scripts\/guard-tests\.mjs check --reason tests\/sum\.test\.js="<why>"$/m);
  r = run('src', '../scripts/guard-tests.mjs', 'check');
  assert.match(r.stderr, /^  node \.\.\/scripts\/guard-tests\.mjs check --reason tests\/sum\.test\.js="<why>"$/m);
  r = guard(join(dir, 'src'), 'check');
  assert.ok(r.err.includes(`  node ${relative(join(dir, 'src'), SCRIPT)} check --reason`), r.err);
  rmSync(dir, { recursive: true });
});

test('a corrupted snapshot fails with a clear message', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  const gitDir = spawnSync('git', ['rev-parse', '--absolute-git-dir'], { cwd: dir, encoding: 'utf8' });
  const path = join(gitDir.stdout.trim(), 'baudrier-guard-tests.json');
  assert.ok(readFileSync(path, 'utf8'));
  for (const content of ['{"tests/sum.test.js": "ab', 'null', '5']) {
    writeFileSync(path, content);
    const r = guard(dir, 'check');
    assert.equal(r.code, 2);
    assert.match(r.err, /snapshot.*corrupted/);
  }
  rmSync(dir, { recursive: true });
});

test('protected files: test directories at any depth, and test or spec files', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  const protectedFiles = [
    'test/helpers.js',
    'src/__tests__/a.js',
    'src/a.spec.ts',
    'src/b.test.mts',
    'src/c.test.tsx',
    'src/d.test.cjs',
  ];
  const others = ['src/testing.js', 'src/contest/x.js', 'src/e.test.js.bak', 'src/f.test.py'];
  for (const file of [...protectedFiles, ...others]) write(dir, file, 'x\n');
  const r = guard(dir, 'check');
  assert.equal(r.code, 1);
  for (const file of protectedFiles) assert.match(r.err, new RegExp(`added\\s+${file.replace('.', '\\.')}`));
  for (const file of others) assert.doesNotMatch(r.err, new RegExp(file.replace('.', '\\.')));
  rmSync(dir, { recursive: true });
});

test('a tracked test file deleted from disk is reported as removed', () => {
  const dir = repo(BASE);
  spawnSync('git', ['add', '.'], { cwd: dir });
  guard(dir, 'snapshot');
  rmSync(join(dir, 'tests/sum.test.js'));
  const r = guard(dir, 'check');
  assert.equal(r.code, 1);
  assert.match(r.err, /removed\s+tests\/sum\.test\.js/);
  rmSync(dir, { recursive: true });
});

test('changes are listed in path order, whatever their kind', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  rmSync(join(dir, 'tests/sum.test.js'));
  write(dir, 'tests/z.test.js', 'x\n');
  const r = guard(dir, 'check');
  assert.ok(r.err.indexOf('tests/sum.test.js') < r.err.indexOf('tests/z.test.js'));
  rmSync(dir, { recursive: true });
});

test('a malformed argument is refused with a message saying what is expected', () => {
  const dir = repo(BASE);
  guard(dir, 'snapshot');
  let r = guard(dir, 'check', '--why', 'x');
  assert.equal(r.code, 2);
  assert.match(r.err, /unknown argument: --why/);
  r = guard(dir, 'check', '--reason', 'no-equal-sign');
  assert.equal(r.code, 2);
  assert.match(r.err, /expects <file>=<reason>, got: no-equal-sign/);
  r = guard(dir, 'check', '--reason', '=no file');
  assert.equal(r.code, 2);
  r = guard(dir, 'check', '--reason');
  assert.equal(r.code, 2);
  assert.match(r.err, /expects <file>=<reason>, got: $/m);
  rmSync(dir, { recursive: true });
});

test('outside a git repository, it fails and says why', () => {
  const dir = mkdtempSync(join(tmpdir(), 'guard-tests-'));
  const r = guard(dir, 'snapshot');
  assert.equal(r.code, 2);
  assert.match(r.err, /git repository/);
  rmSync(dir, { recursive: true });
});

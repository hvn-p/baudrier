import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../plugins/baudrier/skills/editing-agents-md/scripts/check-agents-md.mjs',
);
const { main } = await import(SCRIPT);

function repo(files) {
  const dir = mkdtempSync(join(tmpdir(), 'check-agents-md-'));
  spawnSync('git', ['init', '-q'], { cwd: dir });
  for (const [path, content] of Object.entries(files)) write(dir, path, content);
  return dir;
}

function write(dir, path, content) {
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), content);
}

function commit(dir) {
  spawnSync('git', ['add', '-A'], { cwd: dir });
  spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'base'], { cwd: dir });
}

// In-process, so mutation testing can see the code run.
function check(dir, ...args) {
  return main(args, dir);
}

const lines = (n, text = 'Run one test with `node --test <file>`.') =>
  Array.from({ length: n }, () => text).join('\n') + '\n';
const item = (length) => `- ${'x'.repeat(length - 2)}`;

const GOOD = '# Agents\n\n- Run one test with `node --test <file>`.\n- Data lives in `data/`.\n';

test('a repository without AGENTS.md or CLAUDE.md passes and says so', () => {
  const dir = repo({ 'README.md': '# x\n' });
  const r = check(dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /no AGENTS\.md or CLAUDE\.md/);
  rmSync(dir, { recursive: true });
});

test('clean files pass, root and nested, and the count is reported', () => {
  const dir = repo({ 'AGENTS.md': GOOD, 'data/x.json': '{}', 'src/CLAUDE.md': '- Keep handlers pure.\n' });
  const r = check(dir);
  assert.equal(r.code, 0);
  assert.equal(r.err, '');
  assert.match(r.out, /2 files checked, no violation/);
  rmSync(dir, { recursive: true });
});

test('violations name the file, the rule and point to the skill', () => {
  const dir = repo({ 'AGENTS.md': '- Previously we used yarn.\n' });
  const r = check(dir);
  assert.equal(r.code, 1);
  assert.equal(r.out, '');
  assert.match(r.err, /^AGENTS\.md:1: history: /m);
  assert.match(r.err, /editing-agents-md skill/);
  rmSync(dir, { recursive: true });
});

// Pair rule

test('pair: two different CLAUDE.md and AGENTS.md in one directory fail', () => {
  const dir = repo({ 'AGENTS.md': GOOD, 'CLAUDE.md': '- Other rules.\n', 'data/x': '' });
  const r = check(dir);
  assert.equal(r.code, 1);
  assert.match(r.err, /^CLAUDE\.md: pair: CLAUDE\.md and AGENTS\.md are two different files/m);
  assert.match(r.err, /Make one a symlink to the other, or reduce one to an import/);
  rmSync(dir, { recursive: true });
});

test('pair: the rule applies to nested directories too, naming them', () => {
  const dir = repo({ 'pkg/AGENTS.md': '- One.\n', 'pkg/CLAUDE.md': '- Two.\n' });
  const r = check(dir);
  assert.equal(r.code, 1);
  assert.match(r.err, /^pkg\/CLAUDE\.md: pair: pkg\/CLAUDE\.md and pkg\/AGENTS\.md/m);
  rmSync(dir, { recursive: true });
});

test('pair: a symlink from one to the other passes, and its content is checked once', () => {
  const dir = repo({ 'AGENTS.md': lines(151) });
  symlinkSync('AGENTS.md', join(dir, 'CLAUDE.md'));
  const r = check(dir);
  assert.equal(r.code, 1);
  assert.doesNotMatch(r.err, /pair/);
  assert.match(r.err, /^AGENTS\.md: size/m);
  assert.doesNotMatch(r.err, /CLAUDE\.md: size/);
  rmSync(dir, { recursive: true });
});

test('pair: the symlink is skipped whichever name it has', () => {
  const dir = repo({ 'CLAUDE.md': lines(151) });
  symlinkSync('CLAUDE.md', join(dir, 'AGENTS.md'));
  const r = check(dir);
  assert.match(r.err, /^CLAUDE\.md: size/m);
  assert.doesNotMatch(r.err, /AGENTS\.md: size/);
  rmSync(dir, { recursive: true });
});

test('pair: a file that only imports the other passes, in each accepted form', () => {
  for (const [name, content, other] of [
    ['CLAUDE.md', '@AGENTS.md\n', 'AGENTS.md'],
    ['CLAUDE.md', '\n  @./AGENTS.md  \n\n', 'AGENTS.md'],
    ['AGENTS.md', '@CLAUDE.md\n', 'CLAUDE.md'],
    ['AGENTS.md', '@./CLAUDE.md', 'CLAUDE.md'],
  ]) {
    const dir = repo({ [other]: '- A rule.\n', [name]: content });
    const r = check(dir);
    assert.equal(r.code, 0, `${name}: ${JSON.stringify(content)}\n${r.err}`);
    rmSync(dir, { recursive: true });
  }
});

test('pair: an import plus anything else is two different files', () => {
  for (const content of ['@AGENTS.md\n- Also this.\n', '@AGENTS.md @README.md\n', '@CLAUDE.md\n']) {
    const dir = repo({ 'AGENTS.md': '- A rule.\n', 'CLAUDE.md': content, 'README.md': '' });
    const r = check(dir);
    assert.equal(r.code, 1, JSON.stringify(content));
    assert.match(r.err, /pair/);
    rmSync(dir, { recursive: true });
  }
});

test('pair: files of each name in different directories are not a pair', () => {
  const dir = repo({ 'AGENTS.md': '- A rule.\n', 'src/CLAUDE.md': '- Another.\n' });
  assert.equal(check(dir).code, 0);
  rmSync(dir, { recursive: true });
});

// Size

test('size: a root file of 150 lines passes, 151 fails with the count and the limit', () => {
  let dir = repo({ 'AGENTS.md': lines(150) });
  assert.equal(check(dir).code, 0);
  rmSync(dir, { recursive: true });
  dir = repo({ 'CLAUDE.md': lines(151) });
  const r = check(dir);
  assert.equal(r.code, 1);
  assert.match(r.err, /^CLAUDE\.md: size: 151 lines \(limit 150\)\. Move what only some tasks need/m);
  rmSync(dir, { recursive: true });
});

test('size: the line budget applies to the root file only', () => {
  const dir = repo({ 'src/AGENTS.md': lines(200) });
  assert.equal(check(dir).code, 0);
  rmSync(dir, { recursive: true });
});

// History

const HISTORY = [
  '- Deployed on 2026-10-17.',
  '<!-- Sync Impact Report: 1.0 -> 1.1 -->',
  '## Changelog',
  '- We added a cache layer.',
  '- The cron job was removed.',
  '- Previously the API used REST.',
  '- As of v2, use pnpm.',
];

test('history: each default marker is reported with its line', () => {
  const dir = repo({ 'AGENTS.md': HISTORY.join('\n') + '\n' });
  const r = check(dir);
  assert.equal(r.code, 1);
  HISTORY.forEach((_, i) => assert.match(r.err, new RegExp(`^AGENTS\\.md:${i + 1}: history: `, 'm')));
  assert.match(r.err, /"2026-10-17"/);
  assert.match(r.err, /"was removed" is history\. Keep it where the project keeps history/);
  rmSync(dir, { recursive: true });
});

test('history: nested files are checked too', () => {
  const dir = repo({ 'a/b/CLAUDE.md': '- ok\n- Previously, X.\n' });
  const r = check(dir);
  assert.match(r.err, /^a\/b\/CLAUDE\.md:2: history: /m);
  rmSync(dir, { recursive: true });
});

test('history: pointers to history, inline code and code blocks are not history', () => {
  const content = [
    '- History lives in CHANGELOG.md; decisions in the ADR folder.',
    '- Filter logs with `--since 2026-01-01`.',
    '- Keep the `as-of` flag.',
    '```',
    'git log --since 2026-01-01  # previously used',
    '```',
    '- Release notes go to the changelog.',
    '  ```',
    '  as of 2026-01-01',
    '  ```',
  ].join('\n');
  const dir = repo({ 'AGENTS.md': content + '\n' });
  const r = check(dir);
  assert.equal(r.code, 0, r.err);
  rmSync(dir, { recursive: true });
});

// References

test('references: a cited path that does not exist fails, with line and path', () => {
  for (const span of [
    'docs/missing.md',
    'package.json',
    'src/gone',
    './scripts/x.sh',
    './src/gone',
    'ci.yaml',
    'ci.yml',
    'tool.mjs',
    'App.tsx',
    'lib.ts',
  ]) {
    const dir = repo({ 'AGENTS.md': `- ok\n- See \`${span}\`.\n`, 'src/a.js': '' });
    const r = check(dir);
    assert.equal(r.code, 1, span);
    assert.match(r.err, new RegExp(`^AGENTS\\.md:2: reference: \`${span.replace(/\./g, '\\.')}\` does not exist`, 'm'));
    rmSync(dir, { recursive: true });
  }
});

test('references: existing paths pass, from the root or from the file directory', () => {
  const dir = repo({
    'pkg/AGENTS.md': '- `index.js`, `scripts/run.sh`, `./index.js`, `src/`, `src/a.js:12`, `src/a.js:12:30`, `../package.json`\n',
    'pkg/index.js': '',
    'scripts/run.sh': '',
    'src/a.js': '',
    'package.json': '{}',
  });
  const r = check(dir);
  assert.equal(r.code, 0, r.err);
  rmSync(dir, { recursive: true });
});

test('references: URLs, globs, placeholders, commands and non-paths are ignored', () => {
  const spans = [
    'https://example.com/a.md',
    'src/**/*.test.js',
    '~/.claude/settings.json',
    '/etc/hosts',
    '<dir>/AGENTS.md',
    '$HOME/x.md',
    '@scope/pkg',
    '--base',
    'node --test tests/x.test.mjs',
    'process.env',
    'origin/main',
    'v1.2',
    'settings.json5',
  ];
  const content =
    spans.map((s) => `- \`${s}\``).join('\n') + '\n```\n`missing/file.md`\n```\n@docs/missing.md and more\n';
  const dir = repo({ 'AGENTS.md': content });
  const r = check(dir);
  assert.equal(r.code, 0, r.err);
  rmSync(dir, { recursive: true });
});

test('references: a path whose first directory exists is checked even without an extension', () => {
  const dir = repo({ 'AGENTS.md': '- `src/missing`\n- `nosuchdir/sub`\n', 'src/a.js': '' });
  const r = check(dir);
  assert.equal(r.code, 1);
  assert.match(r.err, /`src\/missing` does not exist/);
  assert.doesNotMatch(r.err, /nosuchdir/);
  rmSync(dir, { recursive: true });
});

test('references: an import line must resolve from the file directory', () => {
  let dir = repo({ 'CLAUDE.md': '@AGENTS.md\n' });
  let r = check(dir);
  assert.equal(r.code, 1);
  assert.match(r.err, /^CLAUDE\.md:1: reference: `AGENTS\.md` does not exist/m);
  rmSync(dir, { recursive: true });
  dir = repo({ 'CLAUDE.md': '- ok\n  @shared/rules\n' });
  r = check(dir);
  assert.match(r.err, /^CLAUDE\.md:2: reference: `shared\/rules` does not exist/m);
  rmSync(dir, { recursive: true });
  dir = repo({ 'pkg/CLAUDE.md': '@docs/rules.md\n', 'pkg/docs/rules.md': '- x\n' });
  r = check(dir);
  assert.equal(r.code, 0, r.err);
  rmSync(dir, { recursive: true });
});

// Files in scope

test('ignored files are not checked, untracked ones are', () => {
  const dir = repo({ '.gitignore': 'tmp/\n', 'tmp/AGENTS.md': '- Previously X.\n', 'new/CLAUDE.md': '- Previously Y.\n' });
  const r = check(dir);
  assert.equal(r.code, 1);
  assert.match(r.err, /new\/CLAUDE\.md/);
  assert.doesNotMatch(r.err, /tmp\/AGENTS\.md/);
  rmSync(dir, { recursive: true });
});

test('a tracked file deleted from disk is not checked', () => {
  const dir = repo({ 'AGENTS.md': '- Previously X.\n' });
  commit(dir);
  rmSync(join(dir, 'AGENTS.md'));
  assert.equal(check(dir).code, 0);
  rmSync(dir, { recursive: true });
});

test('only files named exactly AGENTS.md or CLAUDE.md are checked', () => {
  const dir = repo({ 'docs/AGENTS.md.bak': '- Previously.\n', 'MYCLAUDE.md': '- Previously.\n', 'agents.md': '- Previously.\n' });
  assert.equal(check(dir).code, 0);
  rmSync(dir, { recursive: true });
});

test('it works from a subdirectory, with paths from the repository root', () => {
  const dir = repo({ 'AGENTS.md': '- Previously X.\n', 'src/a.js': '' });
  const r = check(join(dir, 'src'));
  assert.equal(r.code, 1);
  assert.match(r.err, /^AGENTS\.md:1: history/m);
  rmSync(dir, { recursive: true });
});

// Amendments

const BASE_FILE = '# Agents\n\n' + lines(10) + '\n## Data\n\n- Data lives in `data/`.\n';

function based(files = {}) {
  const dir = repo({ 'AGENTS.md': BASE_FILE, 'data/x': '', ...files });
  commit(dir);
  return dir;
}

test('amendment: a rule of 300 characters passes, 301 fails with its line', () => {
  let dir = based();
  write(dir, 'AGENTS.md', BASE_FILE + item(300) + '\n');
  assert.equal(check(dir, '--base', 'HEAD').code, 0);
  rmSync(dir, { recursive: true });
  dir = based();
  write(dir, 'AGENTS.md', BASE_FILE + item(301) + '\n');
  const r = check(dir, '--base', 'HEAD');
  assert.equal(r.code, 1);
  assert.match(r.err, /^AGENTS\.md:17: amendment: this rule adds 301 characters \(limit 300\)\. Shorten it/m);
  rmSync(dir, { recursive: true });
});

test('amendment: a paragraph over several lines counts as one rule', () => {
  const dir = based();
  write(dir, 'AGENTS.md', BASE_FILE + '\n' + 'y'.repeat(150) + '\n' + 'z'.repeat(150) + '\n');
  const r = check(dir, '--base', 'HEAD');
  assert.equal(r.code, 1);
  assert.match(r.err, /^AGENTS\.md:18: amendment: this rule adds 301 characters/m);
  rmSync(dir, { recursive: true });
});

test('amendment: separate list items and paragraphs are separate rules', () => {
  const dir = based();
  write(dir, 'AGENTS.md', BASE_FILE + item(250) + '\n' + item(250) + '\n\n' + 'p'.repeat(250) + '\n');
  assert.equal(check(dir, '--base', 'HEAD').code, 0);
  rmSync(dir, { recursive: true });
});

test('amendment: a block of 1500 characters passes, 1501 fails with its first line', () => {
  const block = (extra) => [item(300), item(300), item(300), item(300), item(300 + extra)].join('\n') + '\n';
  let dir = based();
  write(dir, 'AGENTS.md', BASE_FILE + block(0));
  assert.equal(check(dir, '--base', 'HEAD').code, 0);
  rmSync(dir, { recursive: true });
  dir = based();
  write(dir, 'AGENTS.md', BASE_FILE + '## New\n' + [item(300), item(300), item(300), item(300), item(296)].join('\n') + '\n');
  const r = check(dir, '--base', 'HEAD');
  assert.equal(r.code, 1);
  assert.match(r.err, /^AGENTS\.md:17: amendment: this block adds 1502 characters \(limit 1500\)\. Move what/m);
  rmSync(dir, { recursive: true });
});

test('amendment: blocks separated by unchanged lines are judged apart', () => {
  const dir = based();
  const four = [item(300), item(300), item(300), item(300)].join('\n');
  write(dir, 'AGENTS.md', four + '\n' + BASE_FILE + four + '\n');
  assert.equal(check(dir, '--base', 'HEAD').code, 0);
  rmSync(dir, { recursive: true });
});

test('amendment: an edit counts what it adds, not the whole line', () => {
  const long = item(290);
  const dir = based({ 'AGENTS.md': BASE_FILE + long + '\n' });
  write(dir, 'AGENTS.md', BASE_FILE + long + ' more\n');
  assert.equal(check(dir, '--base', 'HEAD').code, 0);
  rmSync(dir, { recursive: true });
});

test('amendment: without --base, no amendment limit applies', () => {
  const dir = based();
  write(dir, 'AGENTS.md', BASE_FILE + item(1000) + '\n');
  assert.equal(check(dir).code, 0);
  rmSync(dir, { recursive: true });
});

test('amendment: changes committed on the branch count', () => {
  const dir = based();
  spawnSync('git', ['branch', 'base'], { cwd: dir });
  write(dir, 'AGENTS.md', BASE_FILE + item(400) + '\n');
  commit(dir);
  const r = check(dir, '--base', 'base');
  assert.equal(r.code, 1, r.err);
  assert.match(r.err, /amendment: this rule adds 400/);
  rmSync(dir, { recursive: true });
});

test('amendment: changes made on the base after the branch started do not count', () => {
  const dir = based({ 'AGENTS.md': BASE_FILE + item(400) + '\n' });
  spawnSync('git', ['branch', 'feature'], { cwd: dir });
  write(dir, 'AGENTS.md', BASE_FILE);
  commit(dir);
  spawnSync('git', ['branch', 'base'], { cwd: dir });
  spawnSync('git', ['switch', '-q', 'feature'], { cwd: dir });
  const r = check(dir, '--base', 'base');
  assert.equal(r.code, 0, r.err);
  rmSync(dir, { recursive: true });
});

test('amendment: rule boundaries follow markdown, not characters inside a line', () => {
  const cases = [
    // One paragraph whose second line holds list, table and heading markers.
    ['p'.repeat(150) + '\n' + 'x - y | z # w 1. v'.padEnd(150, 'q') + '\n', 1],
    // A list item with a "#" inside, then its continuation: one rule.
    ['- a #b'.padEnd(200, 'c') + '\n' + 'd'.repeat(150) + '\n', 1],
    // A list item, then a level-2 heading: two rules.
    [item(200) + '\n' + '## '.padEnd(200, 'h') + '\n', 0],
    // A heading, then a paragraph without a blank line: two rules.
    ['## '.padEnd(150, 'h') + '\n' + 'p'.repeat(200) + '\n', 0],
    // Numbered items past 9: separate rules.
    ['9. '.padEnd(200, 'n') + '\n' + '10. '.padEnd(200, 'n') + '\n', 0],
    // A table row, then another: separate rules.
    ['| '.padEnd(200, 't') + '\n' + '| '.padEnd(200, 't') + '\n', 0],
  ];
  for (const [added, code] of cases) {
    const dir = based();
    write(dir, 'AGENTS.md', BASE_FILE + '\n' + added);
    const r = check(dir, '--base', 'HEAD');
    assert.equal(r.code, code, `${added}\n${r.err}`);
    rmSync(dir, { recursive: true });
  }
});

test('amendment: a changed single line and a hunk of ten lines or more are both read', () => {
  let dir = based();
  write(dir, 'AGENTS.md', BASE_FILE.replace('- Data lives in `data/`.', item(400)));
  let r = check(dir, '--base', 'HEAD');
  assert.match(r.err, /^AGENTS\.md:16: amendment: this rule adds 37\d characters/m);
  rmSync(dir, { recursive: true });
  dir = based();
  write(dir, 'AGENTS.md', BASE_FILE + Array.from({ length: 12 }, () => item(130)).join('\n') + '\n');
  r = check(dir, '--base', 'HEAD');
  assert.match(r.err, /this block adds 1560 characters/);
  rmSync(dir, { recursive: true });
  const base = BASE_FILE + lines(12, '- old') + lines(10, '- kept');
  dir = based({ 'AGENTS.md': base });
  write(dir, 'AGENTS.md', BASE_FILE + item(400) + '\n' + lines(10, '- kept'));
  r = check(dir, '--base', 'HEAD');
  assert.match(r.err, /this rule adds 395 characters/);
  rmSync(dir, { recursive: true });
});

test('amendment: a block that replaces longer content adds only the difference', () => {
  const base = BASE_FILE + lines(6, '- a') + item(400) + '\n' + item(400) + '\n';
  const dir = based({ 'AGENTS.md': base });
  write(dir, 'AGENTS.md', BASE_FILE + lines(6, item(300)));
  const r = check(dir, '--base', 'HEAD');
  assert.equal(r.code, 0, r.err);
  rmSync(dir, { recursive: true });
});

test('amendment: a removed rule is subtracted once, from the rule that replaces it', () => {
  const dir = based({ 'AGENTS.md': BASE_FILE + item(290) + '\n' });
  write(dir, 'AGENTS.md', BASE_FILE + lines(6, item(300)).replace(item(300), item(300).replace('x', 'y')));
  const r = check(dir, '--base', 'HEAD');
  assert.match(r.err, /this block adds 1510 characters/);
  rmSync(dir, { recursive: true });
});

test('amendment: indentation and Windows line endings do not count', () => {
  const crlf = (text) => text.replace(/\n/g, '\r\n');
  const dir = based({ 'AGENTS.md': crlf(BASE_FILE) });
  write(dir, 'AGENTS.md', crlf(BASE_FILE + item(250) + '\n' + '    ' + 'c'.repeat(49) + '\n'));
  const r = check(dir, '--base', 'HEAD');
  assert.equal(r.code, 0, r.err);
  rmSync(dir, { recursive: true });
});

test('rewrite: when most of the file changed, only the file budget applies', () => {
  const dir = based();
  write(dir, 'AGENTS.md', '# New\n\n' + item(400) + '\n' + item(400) + '\n');
  assert.equal(check(dir, '--base', 'HEAD').code, 0);
  write(dir, 'AGENTS.md', item(400) + '\n' + lines(151, '- Another rule.'));
  const r = check(dir, '--base', 'HEAD');
  assert.equal(r.code, 1);
  assert.match(r.err, /size: 152 lines/);
  assert.doesNotMatch(r.err, /amendment/);
  rmSync(dir, { recursive: true });
});

test('rewrite: a file that does not exist on the base is a rewrite', () => {
  const dir = based();
  write(dir, 'src/CLAUDE.md', item(400) + '\n');
  assert.equal(check(dir, '--base', 'HEAD').code, 0);
  rmSync(dir, { recursive: true });
});

test('rewrite: replacing half of the file is still an amendment', () => {
  const base = '- a\n- b\n- c\n- d\n';
  const dir = repo({ 'AGENTS.md': base });
  commit(dir);
  write(dir, 'AGENTS.md', '- a\n- b\n' + item(400) + '\n');
  const r = check(dir, '--base', 'HEAD');
  assert.equal(r.code, 1);
  assert.match(r.err, /amendment/);
  rmSync(dir, { recursive: true });
});

// Arguments and environment

test('an unknown base fails and says so', () => {
  const dir = based();
  const r = check(dir, '--base', 'nope');
  assert.equal(r.code, 2);
  assert.match(r.err, /base nope, or no common history with HEAD\. Fetch it first/);
  rmSync(dir, { recursive: true });
});

test('a malformed argument prints the usage', () => {
  const dir = repo({});
  for (const args of [['--why'], ['--base'], ['--base', ''], ['--why', 'HEAD'], ['--base', 'HEAD', 'x']]) {
    const r = check(dir, ...args);
    assert.equal(r.code, 2, args.join(' '));
    assert.match(r.err, /usage: check-agents-md\.mjs \[--base <ref>\]/);
  }
  rmSync(dir, { recursive: true });
});

test('outside a git repository, it fails and says why', () => {
  const dir = mkdtempSync(join(tmpdir(), 'check-agents-md-'));
  const r = check(dir);
  assert.equal(r.code, 2);
  assert.match(r.err, /^check-agents-md: .*git repository/);
  rmSync(dir, { recursive: true });
});

test('run from the command line, it prints its output and sets the exit code', () => {
  const dir = repo({ 'AGENTS.md': GOOD, 'data/x': '' });
  const run = () => spawnSync(process.execPath, [SCRIPT], { cwd: dir, encoding: 'utf8' });
  let r = run();
  assert.equal(r.status, 0);
  assert.match(r.stdout, /1 file checked, no violation/);
  write(dir, 'AGENTS.md', GOOD + '- Previously X.\n');
  r = run();
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^AGENTS\.md:5: history/m);
  assert.equal(r.stdout, '');
  rmSync(dir, { recursive: true });
});

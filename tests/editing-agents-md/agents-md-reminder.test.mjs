import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '../../plugins/baudrier/skills/harness-setup/modules/editing-agents-md/hooks/agents-md-reminder.mjs');
const { reminder } = await import(SCRIPT);

const input = (tool_name, file_path) => ({ hook_event_name: 'PreToolUse', tool_name, tool_input: { file_path } });

test('writing or editing AGENTS.md or CLAUDE.md, root or nested, adds the reminder', () => {
  for (const path of ['/repo/AGENTS.md', '/repo/CLAUDE.md', '/repo/a/b/AGENTS.md', 'C:\\repo\\pkg\\CLAUDE.md', 'AGENTS.md']) {
    for (const tool of ['Write', 'Edit']) {
      const output = JSON.parse(reminder(input(tool, path)));
      assert.equal(output.hookSpecificOutput.hookEventName, 'PreToolUse', path);
      assert.match(
        output.hookSpecificOutput.additionalContext,
        /editing-agents-md skill .*\(route the change first, directives only, no history, within the size limits\), then run the project's check-agents-md script/,
      );
      assert.equal(output.hookSpecificOutput.permissionDecision, undefined);
    }
  }
});

test('any other file gets nothing', () => {
  for (const path of ['/repo/README.md', '/repo/MYAGENTS.md', '/repo/AGENTS.md.bak', '/repo/agents.md', '/repo/CLAUDE.md/x']) {
    assert.equal(reminder(input('Write', path)), '', path);
  }
});

test('an input without a file path gets nothing', () => {
  for (const value of [null, {}, { tool_input: {} }, { tool_input: { file_path: ['/repo/AGENTS.md'] } }]) {
    assert.equal(reminder(value), '');
  }
});

test('run as a hook, it reads stdin, prints the JSON and exits 0, even on bad input', () => {
  const run = (stdin) => spawnSync(process.execPath, [SCRIPT], { input: stdin, encoding: 'utf8' });
  let r = run(JSON.stringify(input('Edit', '/repo/CLAUDE.md')));
  assert.equal(r.status, 0);
  assert.match(JSON.parse(r.stdout).hookSpecificOutput.additionalContext, /editing-agents-md/);
  assert.ok(r.stdout.endsWith('}\n'));
  r = run('not json');
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

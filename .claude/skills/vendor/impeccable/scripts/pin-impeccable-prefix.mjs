#!/usr/bin/env node
/**
 * Deprecated: use the 3 condensed skills instead:
 *   impeccable-setup, impeccable-check, impeccable-ship
 *
 * Regenerates only those three under ~/.cursor/skills/
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const marker = '<!-- impeccable-pinned-skill -->';

const skills = {
  'impeccable-setup': readFileSync(join(root, 'impeccable-setup', 'SKILL.md'), 'utf-8'),
  'impeccable-check': readFileSync(join(root, 'impeccable-check', 'SKILL.md'), 'utf-8'),
  'impeccable-ship': readFileSync(join(root, 'impeccable-ship', 'SKILL.md'), 'utf-8'),
};

for (const [name, content] of Object.entries(skills)) {
  if (!content.includes(marker)) {
    console.error(`Refusing to copy ${name}: missing pin marker`);
    process.exit(1);
  }
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'SKILL.md'), content, 'utf-8');
  console.log(`ok ${name}`);
}

console.log('\nCondensed Impeccable skills: setup, check, ship');

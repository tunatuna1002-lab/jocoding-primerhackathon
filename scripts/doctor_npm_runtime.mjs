import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const rootPkgPath = path.join(process.cwd(), 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
const pm = rootPkg.packageManager || '';
const match = /^npm@(.+)$/.exec(pm);

if (!match) {
  console.error('[doctor:npm-runtime] root packageManager must be npm@<version>.');
  process.exit(1);
}

const expectedNpm = match[1];
const npmV = spawnSync('npm', ['-v'], { encoding: 'utf8' });
if (npmV.status !== 0) {
  console.error('[doctor:npm-runtime] failed to execute npm -v.');
  process.exit(1);
}

const actualNpm = npmV.stdout.trim();
if (actualNpm !== expectedNpm) {
  console.error(`[doctor:npm-runtime] expected npm ${expectedNpm}, got ${actualNpm}.`);
  console.error(`[doctor:npm-runtime] fix: corepack enable && corepack use npm@${expectedNpm}`);
  process.exit(1);
}

const npmRoot = spawnSync('npm', ['root', '-g'], { encoding: 'utf8' });
if (npmRoot.status !== 0) {
  console.error('[doctor:npm-runtime] failed to execute npm root -g.');
  process.exit(1);
}

const globalRoot = npmRoot.stdout.trim();
const npaModulePath = path.join(globalRoot, 'npm', 'node_modules', 'npm-package-arg');

try {
  const req = createRequire(import.meta.url);
  const npa = req(npaModulePath);
  npa('workspace:*');
} catch (error) {
  console.error('[doctor:npm-runtime] current npm cannot parse workspace:* .');
  console.error('[doctor:npm-runtime] fix: use corepack-managed npm from packageManager.');
  console.error(`[doctor:npm-runtime] commands: corepack enable && corepack use npm@${expectedNpm}`);
  console.error(`[doctor:npm-runtime] detail: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

console.log(`[doctor:npm-runtime] OK npm=${actualNpm} workspace:* parser supported`);

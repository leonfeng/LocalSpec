import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveOpenspecCli, resolveOpenspecRoot } from './constants.js';

export function openspecPackageVersion(): string {
  const pkgPath = join(resolveOpenspecRoot(), 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string };
  return pkg.version;
}

export function runOpenspec(args: string[], cwd: string): number {
  const cli = resolveOpenspecCli();
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8'),
) as {
  version: string;
  openspecUpstream?: string;
};

export const LOCALSPEC_VERSION = pkg.version;
export const OPENSPEC_UPSTREAM = pkg.openspecUpstream ?? '1.9.0';

/** Workflows patched by LocalSpec overlays (fork deltas + split). */
export const OVERLAY_WORKFLOWS = [
  'split',
  'apply',
  'archive',
  'bulk-archive',
  'explore',
  'propose',
] as const;

/** Fork core profile: upstream core + split. */
export const LOCAL_CORE_WORKFLOWS = [
  'propose',
  'explore',
  'apply',
  'update',
  'split',
  'sync',
  'archive',
] as const;

export function packageRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..');
}

export function overlaysRoot(): string {
  return join(packageRoot(), 'overlays', 'opencode');
}

export function resolveOpenspecRoot(): string {
  const entry = require.resolve('@fission-ai/openspec');
  // resolve points at dist/index.js
  return join(dirname(entry), '..');
}

export function resolveOpenspecCli(): string {
  return join(resolveOpenspecRoot(), 'bin', 'openspec.js');
}

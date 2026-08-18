import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { LOCAL_CORE_WORKFLOWS } from './constants.js';

type GlobalConfig = {
  profile?: string;
  workflows?: string[];
  delivery?: string;
};

function globalConfigPath(): string {
  const xdg = process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config');
  return join(xdg, 'openspec', 'config.json');
}

export function readGlobalConfig(): GlobalConfig {
  const path = globalConfigPath();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as GlobalConfig;
  } catch {
    return {};
  }
}

/** Ensure custom profile includes split (fork core set). Idempotent. */
export function ensureLocalProfile(): { changed: boolean; path: string } {
  const path = globalConfigPath();
  const current = readGlobalConfig();
  const workflows = [...LOCAL_CORE_WORKFLOWS];
  const sameProfile = current.profile === 'custom';
  const sameWorkflows =
    Array.isArray(current.workflows) &&
    current.workflows.length === workflows.length &&
    current.workflows.every((w, i) => w === workflows[i]);

  if (sameProfile && sameWorkflows) {
    return { changed: false, path };
  }

  const next: GlobalConfig = {
    ...current,
    profile: 'custom',
    workflows,
  };
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return { changed: true, path };
}

export function checkGlobalProfile(): string[] {
  const issues: string[] = [];
  const cfg = readGlobalConfig();
  if (cfg.profile !== 'custom') {
    issues.push(
      `OpenSpec profile is "${cfg.profile ?? 'core'}". LocalSpec expects profile "custom" with split workflow. Run: localspec configure`,
    );
    return issues;
  }
  if (!cfg.workflows?.includes('split')) {
    issues.push('Custom profile workflows omit "split". Run: localspec configure');
  }
  return issues;
}

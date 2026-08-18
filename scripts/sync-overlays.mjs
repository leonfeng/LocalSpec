#!/usr/bin/env node
/**
 * Regenerate overlays/opencode from a built OpenSpec fork checkout.
 *
 * Usage:
 *   OPENSPEC_FORK=/home/leon/Developer/OpenSpec node scripts/sync-overlays.mjs
 *
 * Requires the fork to be built (`pnpm build` in OpenSpec).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const forkRoot = process.env.OPENSPEC_FORK ?? join(repoRoot, '..', 'OpenSpec');
const outRoot = join(repoRoot, 'overlays', 'opencode');

const OVERLAY_WORKFLOWS = new Set([
  'split',
  'apply',
  'archive',
  'bulk-archive',
  'explore',
  'propose',
]);

const forkDist = join(forkRoot, 'dist');
const { getSkillTemplates, generateSkillContent, getCommandContents } = await import(
  pathToFileURL(join(forkDist, 'core/shared/skill-generation.js')).href
);
const { getSkillReferenceTransformer } = await import(
  pathToFileURL(join(forkDist, 'utils/command-references.js')).href
);

const transform = getSkillReferenceTransformer('opencode');

for (const { template, dirName, workflowId } of getSkillTemplates()) {
  if (!OVERLAY_WORKFLOWS.has(workflowId)) continue;
  const dir = join(outRoot, 'skills', dirName);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'SKILL.md'),
    generateSkillContent(template, 'localspec-overlay', transform),
  );
}

for (const { id, body } of getCommandContents()) {
  if (!OVERLAY_WORKFLOWS.has(id)) continue;
  mkdirSync(join(outRoot, 'commands'), { recursive: true });
  const transformed = transform(body);
  writeFileSync(
    join(outRoot, 'commands', `opsx-${id}.md`),
    `---\ndescription: "LocalSpec overlay for opsx-${id}"\n---\n\n${transformed}`,
  );
}

console.log(`Synced overlays from ${forkRoot} → ${outRoot}`);

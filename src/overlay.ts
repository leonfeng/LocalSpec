import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { overlaysRoot } from './constants.js';

export type ApplyOverlayResult = {
  skills: string[];
  commands: string[];
};

export function findOpencodeDir(startDir: string): string | null {
  let current = startDir;
  for (;;) {
    const candidate = join(current, '.opencode');
    if (existsSync(candidate) && statSync(candidate).isDirectory()) {
      return candidate;
    }
    const parent = join(current, '..');
    if (parent === current) return null;
    current = parent;
  }
}

export function applyOverlays(opencodeDir: string): ApplyOverlayResult {
  const source = overlaysRoot();
  const skillsOut: string[] = [];
  const commandsOut: string[] = [];

  const skillsSrc = join(source, 'skills');
  if (existsSync(skillsSrc)) {
    for (const dirName of readdirSync(skillsSrc)) {
      const skillFile = join(skillsSrc, dirName, 'SKILL.md');
      if (!existsSync(skillFile)) continue;
      const destDir = join(opencodeDir, 'skills', dirName);
      mkdirSync(destDir, { recursive: true });
      cpSync(skillFile, join(destDir, 'SKILL.md'));
      skillsOut.push(dirName);
    }
  }

  const commandsSrc = join(source, 'commands');
  if (existsSync(commandsSrc)) {
    const destCommands = join(opencodeDir, 'commands');
    mkdirSync(destCommands, { recursive: true });
    for (const fileName of readdirSync(commandsSrc)) {
      if (!fileName.endsWith('.md')) continue;
      cpSync(join(commandsSrc, fileName), join(destCommands, fileName));
      commandsOut.push(fileName);
    }
  }

  return { skills: skillsOut, commands: commandsOut };
}

import { Command } from 'commander';
import { LOCALSPEC_VERSION, OPENSPEC_UPSTREAM, OVERLAY_WORKFLOWS } from './constants.js';
import { applyOverlays, findOpencodeDir } from './overlay.js';
import { openspecPackageVersion, runOpenspec } from './openspec.js';
import { checkGlobalProfile, ensureLocalProfile } from './profile.js';

function projectDir(): string {
  return process.cwd();
}

function requireOpencodeDir(): string {
  const dir = findOpencodeDir(projectDir());
  if (!dir) {
    throw new Error(
      'No .opencode/ directory found. Run "localspec init" or "openspec init" in this project first.',
    );
  }
  return dir;
}

/** Arguments after the subcommand name, forwarded to openspec. */
function forwardArgs(argv: string[], subcommand: string): string[] {
  const index = argv.indexOf(subcommand);
  if (index < 0) return [];
  return argv.slice(index + 1);
}

export async function runCli(argv: string[]): Promise<void> {
  const program = new Command();
  program
    .name('localspec')
    .description('LocalSpec — OpenSpec overlay for local vLLM / BigBang agentic apply')
    .version(LOCALSPEC_VERSION);

  program
    .command('version')
    .description('Show LocalSpec and OpenSpec versions')
    .action(() => {
      console.log(`localspec ${LOCALSPEC_VERSION}`);
      console.log(`openspec upstream (pinned): ${OPENSPEC_UPSTREAM}`);
      console.log(`openspec installed: ${openspecPackageVersion()}`);
    });

  program
    .command('configure')
    .description('Set OpenSpec global profile to custom workflows (core + split)')
    .action(() => {
      const { changed, path } = ensureLocalProfile();
      if (changed) {
        console.log(`Updated ${path} → profile custom with split workflow.`);
      } else {
        console.log(`Already configured (${path}).`);
      }
    });

  program
    .command('doctor')
    .description('Check LocalSpec, OpenSpec, and project setup')
    .action(() => {
      const issues: string[] = [];
      const installed = openspecPackageVersion();
      if (installed !== OPENSPEC_UPSTREAM) {
        issues.push(
          `Installed @fission-ai/openspec is ${installed}; LocalSpec ${LOCALSPEC_VERSION} expects ${OPENSPEC_UPSTREAM}. Reinstall @leonfeng/localspec.`,
        );
      }
      issues.push(...checkGlobalProfile());
      const opencode = findOpencodeDir(projectDir());
      if (!opencode) {
        issues.push('No .opencode/ in this project tree.');
      } else {
        console.log(`Project .opencode: ${opencode}`);
      }
      if (issues.length === 0) {
        console.log('LocalSpec doctor: OK');
        return;
      }
      for (const issue of issues) {
        console.log(`⚠ ${issue}`);
      }
      process.exitCode = 1;
    });

  program
    .command('init')
    .description('Run openspec init, configure local profile, apply LocalSpec overlays')
    .allowUnknownOption(true)
    .action(() => {
      const extra = forwardArgs(argv, 'init');
      const cwd = projectDir();
      ensureLocalProfile();
      const code = runOpenspec(['init', ...extra], cwd);
      if (code !== 0) process.exit(code);
      const opencode = requireOpencodeDir();
      const applied = applyOverlays(opencode);
      printApplied(applied);
    });

  program
    .command('update')
    .description('Run openspec update, then re-apply LocalSpec overlays')
    .allowUnknownOption(true)
    .action(() => {
      const extra = forwardArgs(argv, 'update');
      const cwd = projectDir();
      const code = runOpenspec(['update', ...extra], cwd);
      if (code !== 0) process.exit(code);
      const opencode = requireOpencodeDir();
      const applied = applyOverlays(opencode);
      printApplied(applied);
    });

  function printApplied(applied: { skills: string[]; commands: string[] }): void {
    console.log('');
    console.log(
      `LocalSpec: applied ${applied.skills.length} skill overlay(s), ${applied.commands.length} command overlay(s).`,
    );
    console.log(`Overlays: ${OVERLAY_WORKFLOWS.join(', ')}`);
    console.log(
      'Runtime guardrails live in ~/.config/opencode — restart OpenCode after plugin updates.',
    );
  }

  await program.parseAsync(argv);
}

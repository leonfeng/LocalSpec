# LocalSpec

OpenSpec overlay for **local vLLM / BigBang** agentic apply via OpenCode.

Upstream [OpenSpec](https://github.com/Fission-AI/OpenSpec) targets frontier hosted models. LocalSpec ships the workflow deltas Leon's fork added — `/opsx:split`, loop-aware skills, local vLLM split guidance — as a **thin overlay** on npm `@fission-ai/openspec`.

Runtime guardrails (`stop-agent-loop`, read caps, child abort) stay in [`opencode-config`](https://github.com/leonfeng/opencode-config).

## Versioning

| Package | Role |
|---------|------|
| `@leonfeng/localspec` | Own semver (e.g. `0.1.0`) |
| `@fission-ai/openspec` | Pinned upstream (see `openspecUpstream` in package.json) |

**Do not** match upstream version numbers — that caused `openspec update` to overwrite local skills.

## Install

```bash
pnpm add -g @leonfeng/localspec
localspec configure   # once: global OpenSpec profile custom + split
```

During development:

```bash
cd LocalSpec && pnpm install && pnpm build
pnpm link --global
```

## Usage

```bash
localspec init          # openspec init + local profile + overlays
localspec update        # openspec update + re-apply overlays (use this, not bare openspec update)
localspec doctor        # version + profile + .opencode checks
localspec version
```

In projects:

```bash
cd my-repo
localspec update
```

## What overlays patch

- `openspec-split-change` + `/opsx-split` (not in upstream core)
- Local-model loop contracts on apply, explore, propose, archive, bulk-archive

After every `openspec update`, LocalSpec **re-applies** these files so upstream never wins.

## Refresh overlays from OpenSpec fork

When the fork templates change:

```bash
cd ../OpenSpec && pnpm build
cd ../LocalSpec && pnpm sync-overlays
git diff overlays/
```

## Architecture

```
openspec update  →  upstream skills/commands
localspec overlay →  fork deltas copied into .opencode/
opencode-config  →  plugins enforce loops at runtime
```

## License

MIT

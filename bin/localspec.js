#!/usr/bin/env node
import { runCli } from '../dist/cli.js';

runCli(process.argv).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

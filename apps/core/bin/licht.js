#!/usr/bin/env node

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entry = join(__dirname, "../dist/index.mjs");

const child = spawn("bun", [entry, ...process.argv.slice(2)], {
    stdio: "inherit",
    shell: true,
});

child.on("exit", (code) => {
    process.exit(code ?? 0);
});
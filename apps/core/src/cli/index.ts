#!/usr/bin/env node

import chalk from "chalk";

import { runInitCommand } from "./commands/init";
import { runStartCommand } from "./commands/start";

async function main() {
    const command = process.argv[2];

    switch (command) {
        case "init":
            await runInitCommand();
            return;

        case "start":
            await runStartCommand();
            return;

        default:
            console.log(chalk.gray("Usage"));
            console.log(`  ${chalk.cyan("licht init")}   ${chalk.dim("Initialize app")}`);
            console.log(`  ${chalk.cyan("licht start")}  ${chalk.dim("Start runtime")}`);

            console.log();
            process.exit(1);
    }
}

main().catch((error) => {
    console.error();
    console.error(chalk.bold.red("✖ Fatal error"));
    console.error(chalk.red(error?.message ?? error));
    console.error();

    process.exit(1);
});
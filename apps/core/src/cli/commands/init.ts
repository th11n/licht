import chalk from "chalk";

import { createDb } from '@/db/client';
import { initDb } from '@/db/init';
import { ensureAppDir } from '@/config/paths';
import { ensureConfig } from '@/config/config';

export type InitAppResult = {
    appDir: string;
    configPath: string;
    dbPath: string;
    host: string;
    port: number;
};

export function initApp(): InitAppResult {
    const paths = ensureAppDir();
    const config = ensureConfig(paths);

    const db = createDb(paths.dbPath);
    initDb(db);
    db.close();

    return {
        appDir: paths.appDir,
        configPath: paths.configPath,
        dbPath: paths.dbPath,
        host: config.host,
        port: config.port,
    };
}

export async function runInitCommand() {
    const result = initApp();

    console.log();
    console.log(chalk.bold.green("✔ Licht initialized"));
    console.log();

    console.log(chalk.gray("Paths"));
    console.log(`  ${chalk.cyan("App dir:")} ${result.appDir}`);
    console.log(`  ${chalk.cyan("Config: ")} ${result.configPath}`);
    console.log(`  ${chalk.cyan("DB:     ")} ${result.dbPath}`);

    console.log();
    console.log(chalk.gray("Next step"));

    const startCmd = "licht start";

    console.log(
        `  ${chalk.yellow("Run:")} ${chalk.bold(startCmd)}`
    );

    console.log();
}
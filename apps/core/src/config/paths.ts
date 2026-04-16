import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type AppPaths = {
    appDir: string;
    configPath: string;
    dbPath: string;
};

export function getAppPaths(): AppPaths {
    const appDir = join(homedir(), ".licht");
    const configPath = join(appDir, "config.json");
    const dbPath = join(appDir, "db.sqlite");

    return {
        appDir,
        configPath,
        dbPath,
    };
}

export function ensureAppDir(): AppPaths {
    const paths = getAppPaths();
    mkdirSync(paths.appDir, { recursive: true });
    return paths;
}
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { AppPaths } from "./paths";

export type LichtConfig = {
    host: string;
    port: number;
    sessionToken: string;
    allowedOrigins: string[];
};

export function getDefaultConfig(): LichtConfig {
    return {
        host: "127.0.0.1",
        port: 4317,
        sessionToken: randomUUID(),
        allowedOrigins: [
            "http://localhost:3000",
            "http://localhost:3001",
        ],
    };
}

export function ensureConfig(paths: AppPaths): LichtConfig {
    if (!existsSync(paths.configPath)) {
        const config = getDefaultConfig();
        writeFileSync(paths.configPath, JSON.stringify(config, null, 2), "utf-8");
        return config;
    }

    const raw = readFileSync(paths.configPath, "utf-8");
    return JSON.parse(raw) as LichtConfig;
}
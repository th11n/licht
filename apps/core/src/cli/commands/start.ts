import chalk from "chalk";

import { createDb } from "@/db/client";
import { initApp } from "@/cli/commands/init";
import { createApp } from "@/server/create-app";

export async function startRuntime() {
    const appState = initApp();

    const db = createDb(appState.dbPath);
    const app = createApp({ db });

    console.log();
    console.log(chalk.gray("Starting runtime..."));

    const server = Bun.serve({
        hostname: appState.host,
        port: appState.port,
        fetch: async (req) => {
            if (req.method === "OPTIONS") {
                return new Response(null, {
                    status: 204,
                    headers: {
                        "Access-Control-Allow-Origin": "http://localhost:3001",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                        "Access-Control-Max-Age": "86400",
                    },
                });
            }

            const res = await app.fetch(req);

            const headers = new Headers(res.headers);
            headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
            headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

            return new Response(res.body, {
                status: res.status,
                statusText: res.statusText,
                headers,
            });
        },

    });

    console.log();
    console.log(chalk.bold.green("✔ Licht runtime started"));
    console.log();

    console.log(chalk.gray("Server"));
    console.log(
        `  ${chalk.cyan("URL:")} ${chalk.underline(`http://${server.hostname}:${server.port}`)}`
    );
    console.log(`  ${chalk.cyan("Host:")} ${server.hostname}`);
    console.log(`  ${chalk.cyan("Port:")} ${server.port}`);

    console.log();
    console.log(chalk.dim("Press Ctrl+C to stop"));
    console.log();

    const shutdown = () => {
        console.log();
        console.log(chalk.red("Stopping runtime..."));

        server.stop();
        db.close();

        console.log(chalk.green("✔ Shutdown complete"));
        console.log();

        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

export async function runStartCommand() {
    await startRuntime();
}
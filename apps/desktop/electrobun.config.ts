import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Licht",
    identifier: "dev.bettertstack.licht.desktop",
    version: "0.0.1",
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    watchIgnore: [
      "../web/.next/**",
      "../web/node_modules/**",
      "../web/out/**",
    ],
    mac: {
      bundleCEF: true,
      defaultRenderer: "cef",
    },
    linux: {
      bundleCEF: true,
      defaultRenderer: "cef",
    },
    win: {
      bundleCEF: true,
      defaultRenderer: "cef",
      icon: "./assets/logo.ico",
    },
  },
} satisfies ElectrobunConfig;
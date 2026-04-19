FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS pruner
RUN corepack enable
RUN npm install -g turbo

COPY . .

RUN turbo prune web --docker

FROM base AS installer
WORKDIR /app

ENV HUSKY=0

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/bun.lock ./bun.lock

COPY --from=oven/bun:1.2.15 /usr/local/bin/bun /usr/local/bin/bun
COPY --from=oven/bun:1.2.15 /usr/local/bin/bunx /usr/local/bin/bunx

RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0

COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ ./

RUN cd apps/web && node ../../node_modules/next/dist/bin/next build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nextjs
RUN useradd --system --uid 1001 --gid 1001 nextjs

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
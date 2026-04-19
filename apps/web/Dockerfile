FROM oven/bun:1.2.15-slim AS base

FROM base AS pruner
WORKDIR /app

RUN bun add -g turbo

COPY . .

RUN turbo prune web --docker

FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/bun.lock ./bun.lock

RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ ./

RUN bun run --cwd apps/web build

FROM oven/bun:1.2.15-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["bun", "apps/web/server.js"]
FROM docker.m.daocloud.io/library/node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@10.33.2 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM docker.m.daocloud.io/library/node:22-alpine AS build
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@10.33.2 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM docker.m.daocloud.io/library/node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
RUN addgroup -S nodejs && adduser -S astro -G nodejs
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER astro
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]

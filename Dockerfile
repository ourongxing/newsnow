FROM node:20.12.2-alpine AS builder
WORKDIR /usr/src
COPY . .
# Install build dependencies for native modules like better-sqlite3
RUN apk add --no-cache python3 make g++
RUN corepack enable
RUN pnpm install
RUN pnpm run build

FROM node:20.12.2-alpine
WORKDIR /usr/app
COPY --from=builder /usr/src/dist/output ./output
ENV HOST=0.0.0.0 PORT=4444 NODE_ENV=production
EXPOSE $PORT
CMD ["node", "output/server/index.mjs"]

FROM node:20.12.2-alpine AS builder
WORKDIR /usr/src
COPY . .
RUN corepack enable
RUN pnpm install
RUN pnpm run build

FROM node:20.12.2-alpine
WORKDIR /usr/app
COPY --from=builder /usr/src/dist/output ./output
# Copy necessary files for runtime including package.json to check dependencies
COPY --from=builder /usr/src/package.json ./package.json
# Install production dependencies including mysql2 for MySQL support
RUN npm install mysql2 better-sqlite3
ENV HOST=0.0.0.0 PORT=4444 NODE_ENV=production
EXPOSE $PORT
CMD ["node", "output/server/index.mjs"]
FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm && pnpm install --no-frozen-lockfile --ignore-scripts

COPY . .

RUN CI=true SKIP_ENV_VALIDATION=true pnpm install --no-frozen-lockfile --ignore-scripts && pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]

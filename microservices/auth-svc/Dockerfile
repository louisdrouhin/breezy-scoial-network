FROM node:24-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm && pnpm install --frozen-lockfile

COPY prisma ./prisma
COPY src ./src

RUN pnpm prisma generate

EXPOSE 3001

CMD ["pnpm", "start"]

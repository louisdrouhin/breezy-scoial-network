FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS auth-svc
COPY --from=build /usr/src/app /prod/auth-svc
WORKDIR /prod/auth-svc
RUN pnpm deploy --filter=auth-svc --prod /prod/auth-svc-dist
WORKDIR /prod/auth-svc-dist
EXPOSE 3001
CMD ["pnpm", "start"]

FROM base AS user-svc
COPY --from=build /usr/src/app /prod/user-svc
WORKDIR /prod/user-svc
RUN pnpm deploy --filter=user-svc --prod /prod/user-svc-dist
WORKDIR /prod/user-svc-dist
EXPOSE 3002
CMD ["pnpm", "start"]

FROM base AS post-svc
COPY --from=build /usr/src/app /prod/post-svc
WORKDIR /prod/post-svc
RUN pnpm deploy --filter=post-svc --prod /prod/post-svc-dist
WORKDIR /prod/post-svc-dist
EXPOSE 3003
CMD ["pnpm", "start"]

FROM base AS notif-svc
COPY --from=build /usr/src/app /prod/notif-svc
WORKDIR /prod/notif-svc
RUN pnpm deploy --filter=notif-svc --prod /prod/notif-svc-dist
WORKDIR /prod/notif-svc-dist
EXPOSE 3004
CMD ["pnpm", "start"]

FROM base AS feed-svc
COPY --from=build /usr/src/app /prod/feed-svc
WORKDIR /prod/feed-svc
RUN pnpm deploy --filter=feed-svc --prod /prod/feed-svc-dist
WORKDIR /prod/feed-svc-dist
EXPOSE 3005
CMD ["pnpm", "start"]

FROM base AS frontend
COPY --from=build /usr/src/app /prod/frontend
WORKDIR /prod/frontend/front
RUN pnpm build
ENV CI=true
RUN pnpm install --prod --ignore-scripts
EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "start"]

FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm deploy --filter=auth-svc --prod /prod/auth-svc
RUN pnpm deploy --filter=user-svc --prod /prod/user-svc
RUN pnpm deploy --filter=post-svc --prod /prod/post-svc
RUN pnpm deploy --filter=notif-svc --prod /prod/notif-svc
RUN pnpm deploy --filter=feed-svc --prod /prod/feed-svc
RUN pnpm deploy --filter=front --prod /prod/frontend

# Cible de developpement : monorepo complet avec toutes les deps (dev incluses),
# pnpm epingle (packageManager racine) et pnpm-workspace.yaml presents. Pas de
# `pnpm deploy --prod` ici : le dev a besoin des devDependencies (ex. next dev)
# et d'un environnement aligne sur la racine. Le compose de dev monte les sources
# par-dessus pour le hot reload (`node --watch` / `next dev`).
FROM base AS dev
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS auth-svc
COPY --from=build /prod/auth-svc /prod/auth-svc
WORKDIR /prod/auth-svc
EXPOSE 3001
CMD ["pnpm", "start"]

FROM base AS user-svc
COPY --from=build /prod/user-svc /prod/user-svc
WORKDIR /prod/user-svc
EXPOSE 3002
CMD ["pnpm", "start"]

FROM base AS post-svc
COPY --from=build /prod/post-svc /prod/post-svc
WORKDIR /prod/post-svc
EXPOSE 3003
CMD ["pnpm", "start"]

FROM base AS notif-svc
COPY --from=build /prod/notif-svc /prod/notif-svc
WORKDIR /prod/notif-svc
EXPOSE 3004
CMD ["pnpm", "start"]

FROM base AS feed-svc
COPY --from=build /prod/feed-svc /prod/feed-svc
WORKDIR /prod/feed-svc
EXPOSE 3005
CMD ["pnpm", "start"]

FROM base AS frontend
COPY --from=build /prod/frontend /prod/frontend
WORKDIR /prod/frontend
EXPOSE 3000
CMD ["pnpm", "start"]

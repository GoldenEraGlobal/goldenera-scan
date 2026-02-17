FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS final
WORKDIR /app
COPY --from=build /usr/src/app/.output /app/.output
COPY --from=build /usr/src/app/package.json /app/package.json
# Create an empty .env file to suppress errors if the start script requires it, 
# although real env vars should be passed to the container.
RUN touch .env

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "start"]

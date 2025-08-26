# syntax=docker/dockerfile:1

# Common args
ARG PNPM_VERSION=10.15.0
ARG PLAYWRIGHT_BROWSERS="chromium"

FROM node:lts-alpine AS node-tests
WORKDIR /app

# keep CI deterministic
ENV CI=true \
    NODE_ENV=test \
    PNPM_HOME=/root/.local/share/pnpm \
    PATH="/root/.local/share/pnpm:$PATH" \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# prepare minimal environment
# pin pnpm to same version as package.json
RUN corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate

# Use cache for speed & fetch config
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm fetch

# bring in the rest of the app
COPY . .

# strict lockfile-based install and run tests
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline \
 && pnpm run check \
 && pnpm run test:unit


# ubuntu for playwrght compatibility
FROM node:lts-bookworm AS playwright-tests
WORKDIR /app

ENV CI=true \
    NODE_ENV=test \
    PNPM_HOME=/root/.local/share/pnpm \
    PATH="/root/.local/share/pnpm:$PATH" \
    PLAYWRIGHT_BROWSERS_PATH=0

RUN corepack enable \
 && corepack prepare pnpm@${PNPM_VERSION} --activate

# reuse previously generated node_modules & workspace
COPY --from=node-tests /app ./

RUN --mount=type=cache,id=playwright-browsers,target=/app/node_modules/playwright/.local-browsers \
    pnpm exec playwright install-deps && \
    pnpm exec playwright install ${PLAYWRIGHT_BROWSERS}

RUN pnpm run test:integration

FROM node:lts-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production \
    PNPM_HOME=/root/.local/share/pnpm \
    PATH="/root/.local/share/pnpm:$PATH"

RUN corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=playwright-tests /app ./

RUN pnpm run build

FROM caddy:2.10.0-alpine AS server
LABEL author=flurbudurbur \
    org.opencontainers.image.title="kurosearch" \
    org.opencontainers.image.source="https://github.com/flurbudurbur/kurosearch" \
    org.opencontainers.image.arch="amd64" \
    org.opencontainers.image.description="A self-contained version of kurosearch.com" \
    org.opencontainers.image.version="1.0.0-rc.1"

# expose ports for http(s) traffic
EXPOSE 80 443

COPY --from=builder /app/build /srv
COPY ./Caddyfile /etc/caddy/Caddyfile

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
 CMD wget -q --spider http://localhost/ || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
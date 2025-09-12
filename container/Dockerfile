# syntax=docker/dockerfile:1

# Common args
ARG PNPM_VERSION=10.15.1
ARG PLAYWRIGHT_BROWSERS="chromium"
ARG PROJECT_VERSION=1.0.0

FROM node:lts-bookworm AS node-tests
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
COPY ../package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm fetch

# bring in the rest of the app
COPY .. .

# strict lockfile-based install and run tests
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline \
 && pnpm run check \
 && pnpm run test:unit


FROM node:lts-bookworm AS playwright-tests
WORKDIR /app

ARG PLAYWRIGHT_BROWSERS
ARG PNPM_VERSION

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

ARG PNPM_VERSION

ENV NODE_ENV=production \
    PNPM_HOME=/root/.local/share/pnpm \
    PATH="/root/.local/share/pnpm:$PATH"

RUN corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=playwright-tests /app ./

RUN pnpm run build \
    && pnpm --filter=kurosearch deploy --prod /app/prod

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runtime

ARG PROJECT_VERSION
ARG PNPM_VERSION

LABEL author=flurbudurbur \
    org.opencontainers.image.title="kurosearch" \
    org.opencontainers.image.description="A self-contained version of kurosearch.com" \
    org.opencontainers.image.version=${PROJECT_VERSION} \
    org.opencontainers.image.source="https://github.com/flurbudurbur/kurosearch" \
    org.opencontainers.image.authors="flurbudurbur 69259138+flurbudurbur@users.noreply.github.com"

ENV NODE_ENV=production \
    PORT=8080

WORKDIR /app

COPY --chown=nonroot:nonroot --from=builder /app/prod/node_modules ./node_modules
COPY --chown=nonroot:nonroot --from=builder /app/build ./build

EXPOSE 8080

CMD ["/app/build/index.js"]
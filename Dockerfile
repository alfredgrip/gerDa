# -------------------
# Builder stage
# -------------------
FROM node:25-alpine AS builder

ENV CI=true

RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build
RUN pnpm prune --prod

# -------------------
# Runtime stage
# -------------------
FROM node:25-alpine

RUN apk add --no-cache \
    tectonic \
    pandoc \
    fontconfig \
    harfbuzz \
    icu-libs \
    libstdc++ \
    bash

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dsekdocs ./dsekdocs
COPY --from=builder /app/GUIDE.tex ./GUIDE.tex

# Compile the GUIDE.tex to ensure all LaTeX dependencies are in order
RUN tectonic -X compile GUIDE.tex -Z search-path=dsekdocs

# Create dirs for generated content
RUN mkdir -p /app/output/tex && \
    mkdir -p /app/output/pdf && \
    mkdir -p /app/output/img

ENV CI=false
ENV NODE_ENV=production
ENV TZ=Etc/UTC
ENV ORIGIN=http://localhost:3000
# 10MB, request can become big due to large images
ENV BODY_SIZE_LIMIT=10485760
EXPOSE 3000

CMD ["node", "build/index.js"]
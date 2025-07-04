# -------------------
# Builder stage
# -------------------
FROM node:alpine AS builder

# Enable and install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency files first for better caching
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the app
RUN pnpm run build

# Remove dev dependencies
RUN pnpm prune --prod

# -------------------
# Runtime stage
# -------------------
FROM node:alpine

# Install system dependencies for runtime
RUN apk add --no-cache tectonic pandoc

ENV TZ=Etc/UTC
WORKDIR /app

# Copy built files and only production deps
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN tectonic -X compile GUIDE.tex -Z search-path=dsekdocs && mv GUIDE.pdf static/
# Optional: copy precompiled PDF if used
# COPY --from=builder /app/static/GUIDE.pdf ./static/GUIDE.pdf

EXPOSE 3000
ENV NODE_ENV=production

# Update this ORIGIN in production
CMD ORIGIN=http://localhost:3000 node server.js

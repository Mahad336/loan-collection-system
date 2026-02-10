# Debian base: Prisma query engine works without Alpine/musl/OpenSSL issues
FROM node:20-bookworm-slim

# Chromium + deps for Puppeteer (PDF generation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./

# Copy workspace packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN npm ci

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Generate Prisma client then build API
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

# Migrations and seed run at startup when DATABASE_URL is set by docker-compose
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]

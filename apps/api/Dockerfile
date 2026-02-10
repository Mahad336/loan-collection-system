FROM node:20-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

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

# Build API
WORKDIR /app/apps/api
RUN npm run build

# Run migrations and seed
RUN npx prisma generate
RUN npx prisma migrate deploy

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db seed && node dist/main.js"]

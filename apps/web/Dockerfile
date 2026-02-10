FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN npm ci

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/web
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

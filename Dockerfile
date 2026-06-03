# Build stage
FROM node:24.16.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src/ ./src/
COPY migrations/ ./migrations/

RUN npm run build

# Production stage
FROM node:24.16.0-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/migrations ./migrations
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]

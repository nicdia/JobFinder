# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/sql ./src/sql
COPY --from=builder /app/src/config ./src/config
ENV NODE_ENV=production
CMD ["node", "dist/mainPipeScript.js"]

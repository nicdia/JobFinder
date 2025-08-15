# -------- build --------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite build -> dist
ARG BUILD_DIR=dist
RUN npm run build

# -------- serve via nginx --------
FROM nginx:alpine
# unsere nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
# statische Dateien hinterlegen
ARG BUILD_DIR=dist
COPY --from=build /app/${BUILD_DIR} /usr/share/nginx/html
EXPOSE 80

# syntax=docker/dockerfile:1
# Build the Vite/React frontend and serve it via nginx.
#
#   docker build -t argonauts-frontend:latest -f "Kyc identity theft/frontend/Dockerfile" "Kyc identity theft/frontend"
#   docker run --rm -p 80:80 argonauts-frontend:latest

# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ── Stage 2: serve ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove the default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy the Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx starts on a static-only config so it never depends on a backend being
# up, then swaps in the proxy config once they resolve. See nginx.bootstrap.conf
# and upstream-wait.sh for why.
COPY nginx.bootstrap.conf /etc/nginx/conf.d/default.conf
COPY nginx.full.conf      /etc/nginx/nginx.full.conf
COPY upstream-wait.sh     /docker-entrypoint.d/40-upstream-wait.sh
RUN chmod +x /docker-entrypoint.d/40-upstream-wait.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

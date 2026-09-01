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

# nginx config as a template: the DNS resolver address is injected at start.
# Restricting envsubst to DNS_RESOLVER keeps it away from nginx's own $host,
# $uri and friends, which would otherwise be blanked out.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-resolver.envsh /docker-entrypoint.d/10-resolver.envsh
RUN chmod +x /docker-entrypoint.d/10-resolver.envsh
ENV NGINX_ENVSUBST_FILTER=DNS_RESOLVER

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

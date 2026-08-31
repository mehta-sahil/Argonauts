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

# nginx config: serve SPA (fallback to index.html) and static labs
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

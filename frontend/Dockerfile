# Stage 1: compiler le frontend, sans API ni serveur Next.js dans l'image finale.
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Chaîne vide => appels relatifs /api/, relayés par Nginx à l'exécution.
ENV NEXT_PUBLIC_API_BASE_URL=""
RUN npm run build

# Stage 2: seulement Nginx, ses réglages et l'export HTML/CSS/JS.
FROM nginx:stable-alpine AS production
ENV BACKEND_UPSTREAM=backend:4000
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

# syntax=docker/dockerfile:1
# Static site: build with Node, serve dist/ with Nginx. No backend, no database.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Build-time configuration (Vite inlines VITE_* values into the static bundle).
ARG VITE_SITE_URL=https://tools.baserastech.com
ARG VITE_CONTACT_EMAIL=
ARG VITE_ADSENSE_ENABLED=false
ARG VITE_ADSENSE_PUBLISHER_ID=
ARG VITE_ADSENSE_TOP_SLOT=
ARG VITE_ADSENSE_BOTTOM_SLOT=
ARG VITE_ADSENSE_LEFT_SLOT=
ARG VITE_ADSENSE_RIGHT_SLOT=
ARG VITE_GOOGLE_ANALYTICS_ID=
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL \
    VITE_ADSENSE_ENABLED=$VITE_ADSENSE_ENABLED \
    VITE_ADSENSE_PUBLISHER_ID=$VITE_ADSENSE_PUBLISHER_ID \
    VITE_ADSENSE_TOP_SLOT=$VITE_ADSENSE_TOP_SLOT \
    VITE_ADSENSE_BOTTOM_SLOT=$VITE_ADSENSE_BOTTOM_SLOT \
    VITE_ADSENSE_LEFT_SLOT=$VITE_ADSENSE_LEFT_SLOT \
    VITE_ADSENSE_RIGHT_SLOT=$VITE_ADSENSE_RIGHT_SLOT \
    VITE_GOOGLE_ANALYTICS_ID=$VITE_GOOGLE_ANALYTICS_ID
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/healthz || exit 1

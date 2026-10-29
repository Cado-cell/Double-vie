# Double Vie — static PWA served by nginx.
# Only the published files (the flat PWA package at the repository root) are copied into the image.
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="Double Vie" \
      org.opencontainers.image.description="Life simulator PWA (static files served by nginx)" \
      org.opencontainers.image.source="https://github.com/Cado-cell/double-vie"

RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/double-vie.conf

COPY index.html app.js sw.js manifest.webmanifest \
     apple-touch-icon.png icon-192.png icon-512.png icon-maskable-512.png \
     /usr/share/nginx/html/

EXPOSE 80

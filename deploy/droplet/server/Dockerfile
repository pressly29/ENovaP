# API container: the existing Netlify Functions behind a tiny Node server.
# Build context is the repo root (see docker-compose.yml).
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production \
    PORT=8888 \
    BLOBS_DIR=/data/blobs

COPY netlify/functions ./netlify/functions
COPY deploy/droplet/server ./server

RUN mkdir -p /data/blobs && chown -R node:node /data
USER node

EXPOSE 8888
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:8888/healthz || exit 1
CMD ["node", "server/index.js"]

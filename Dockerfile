# One container serves the website, the admin page and the API.

# ---- Build the React site ----
FROM node:22-alpine AS client
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Run the server ----
FROM node:22-alpine
ENV NODE_ENV=production \
    PORT=8080 \
    DATA_DIR=/data \
    TRUST_PROXY=1
WORKDIR /app
COPY server/package.json server/package-lock.json server/
RUN cd server && npm ci --omit=dev
COPY server/src server/src
COPY --from=client /app/client/dist client/dist
# Runs as root so it can write to hosted volumes, which are usually mounted root-owned.
RUN mkdir -p /data
EXPOSE 8080
CMD ["node", "server/src/index.js"]

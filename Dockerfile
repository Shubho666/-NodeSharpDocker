FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application
COPY --chown=node:node watcher.js .

# Create runtime directories
RUN mkdir -p /data/input /data/output \
    && chown -R node:node /data

# Switch to non-root user
USER node

# Mount point for input/output
#VOLUME ["/data"]

CMD ["node", "watcher.js"]
# Angular 20 dev image - Use specific version for reproducibility
FROM node:20.19.0-alpine3.21

# Define build arguments early for better caching
ARG GIT_USER_NAME
ARG GIT_USER_EMAIL

# Set environment variables
ENV NG_CLI_ANALYTICS=ci \
    CHOKIDAR_USEPOLLING=true \
    WATCHPACK_POLLING=true \
    NODE_ENV=development \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

# Create non-root user early (security best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S angular -u 1001 -G nodejs

# Update packages and install dependencies in single layer
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    git \
    dumb-init && \
    rm -rf /var/cache/apk/*

# Install Angular CLI globally with specific version
RUN npm install -g @angular/cli@20 && \
    npm cache clean --force

# Configure Git as root before switching users
RUN git config --system user.name "${GIT_USER_NAME}" && \
    git config --system user.email "${GIT_USER_EMAIL}" && \
    git config --system init.defaultBranch main

# Set working directory and change ownership
WORKDIR /home/angular/workspace

# Copy package files, registry config, and env for token auth
COPY --chown=angular:nodejs package*.json .npmrc .env ./
RUN export $(grep '^GITLAB_TOKEN=' .env | xargs) && \
    npm install --no-audit --no-fund && \
    rm -f .npmrc .env

# Switch to non-root user for runtime operations
# USER angular

# Health check for development server
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4200 || exit 1

EXPOSE 4200

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

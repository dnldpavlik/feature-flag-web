# DevContainer Dockerfile for Feature Flag UI
FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    # Playwright dependencies
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Install Angular CLI globally
RUN su node -c "npm install -g @angular/cli@20"

# Install additional global npm packages
RUN su node -c "npm install -g \
    npm-check-updates \
    typescript \
    eslint \
    prettier"

# Set up npm global packages for node user
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# Create workspace directory
WORKDIR /workspaces/feature-flag-ui

# Expose ports
# 4200 - Angular dev server
# 9876 - Karma test runner
EXPOSE 4200 9876

# Default command
CMD ["sleep", "infinity"]

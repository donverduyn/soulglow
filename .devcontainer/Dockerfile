# Stage 1: Build stage with Node.js
FROM node:20 as builder

# Install Yarn
RUN apt-get update && apt-get install -y curl gnupg \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/yarnkey.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update && apt-get install -y yarn

# Clone and build React DevTools
RUN git clone https://github.com/facebook/react.git /tmp/react \
    && cd /tmp/react \
    && yarn install \
    && cd ./scripts/release \
    && yarn install \
    && node ./download-experimental-build.js --commit $(git rev-parse main) \
    && cd ./../../packages/react-devtools-extensions \
    && yarn build:chrome

# Stage 2: Setup the final image
FROM mcr.microsoft.com/devcontainers/base:bullseye

# Install general dependencies and Chrome
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] https://dl-ssl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y libnss3 libgbm1 fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils alsa-utils vulkan-tools mesa-vulkan-drivers upower libglib2.0-bin fonts-recommended --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* /var/tmp/*

# Additional container configuration
RUN mkdir -p /tmp/runtime-vscode \
    && chown vscode:vscode /tmp/runtime-vscode \
    && chmod 700 /tmp/runtime-vscode \
    && usermod -a -G audio,video vscode

# Copy built React DevTools from the builder stage
COPY --from=builder /tmp/react/packages/react-devtools-extensions/chrome/build /tmp/react-devtools-extensions

# Configure PATH for potential remaining Node modules
ENV PATH=./node_modules/.bin:$PATH
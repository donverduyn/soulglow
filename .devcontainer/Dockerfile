# # Step 1: Create a Java runtime
# FROM eclipse-temurin:21 as jre-build

# # java.base and java.logging are needed to build React
# RUN $JAVA_HOME/bin/jlink \
#          --add-modules java.base,java.logging \  
#          # for openapi-generator ,java.xml,java.naming,jdk.unsupported,java.desktop \
#          --strip-debug \
#          --no-man-pages \
#          --no-header-files \
#          --compress=2 \
#          --output /javaruntime

# # Stage 2: Build React DevTools
# FROM node:20 as builder
# ENV JAVA_HOME=/opt/java/openjdk
# ENV PATH "${JAVA_HOME}/bin:${PATH}"
# COPY --from=jre-build /javaruntime $JAVA_HOME

# # Install Yarn
# RUN apt-get update && apt-get install -y curl gnupg \
#     && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/yarnkey.gpg \
#     && echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
#     && apt-get update && apt-get install -y yarn

# # Clone and build
# RUN git clone https://github.com/facebook/react.git /tmp/react \
#     && cd /tmp/react \
#     && yarn install \
#     && yarn build-for-devtools \
#     && cd ./packages/react-devtools-extensions \
#     && yarn build:chrome

# Stage 3: Setup the final image
FROM mcr.microsoft.com/devcontainers/base:bullseye

# Install necessary packages
RUN apt-get update && apt-get install -y \
    chromium \
    alsa-utils \
    # libgconf-2-4 \
    # libnss3 \
    # libxss1 \
    # libasound2 \
    # libatk1.0-0 \
    # libatk-bridge2.0-0 \
    # libcups2 \
    # libdbus-1-3 \
    # libdrm2 \
    # libgbm1 \
    # libgtk-3-0 \
    # libnspr4 \
    # libxcomposite1 \
    # libxrandr2 \
    # libxdamage1 \
    # libxkbcommon0 \
    # libxshmfence1 \
    # libx11-xcb1 \
    # libxcursor1 \
    # libxi6 \
    # libxtst6 \
    # libnss3-dev \
    # libgles2-mesa \
    # libegl1-mesa \
    # libgl1-mesa-glx \
    # mesa-utils \
    xdg-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

# # Install general dependencies and Chrome
# RUN apt-get update \
#     && apt-get install -y wget gnupg \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
#     && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] https://dl-ssl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && apt-get update \
#     && apt-get install -y libnss3 libgbm1 fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils alsa-utils vulkan-tools mesa-vulkan-drivers upower libglib2.0-bin fonts-recommended --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/* /var/tmp/*

# Additional container configuration
RUN mkdir -p /tmp/runtime-vscode \
    && chown vscode:vscode /tmp/runtime-vscode \
    && chmod 700 /tmp/runtime-vscode \
    && usermod -a -G audio,video vscode

# Copy built React DevTools from the builder stage
# COPY --from=builder /tmp/react/packages/react-devtools-extensions/chrome/build /tmp/react-devtools-extensions

# Add Node binaries to PATH
ENV PATH=./node_modules/.bin:$PATH

# If you want to use Java runtime
# ENV JAVA_HOME=/opt/java/openjdk
# ENV PATH "${JAVA_HOME}/bin:${PATH}"
# COPY --from=jre-build /javaruntime $JAVA_HOME

# Step 1: Create a Java runtime
FROM eclipse-temurin:21 as jre-build

# java.base and java.logging are needed to build React
RUN $JAVA_HOME/bin/jlink \
         --add-modules java.base,java.logging \  
         # for openapi-generator ,java.xml,java.naming,jdk.unsupported,java.desktop \
         --strip-debug \
         --no-man-pages \
         --no-header-files \
         --compress=2 \
         --output /javaruntime

# Stage 2: Build React DevTools
FROM node:20 as builder
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH "${JAVA_HOME}/bin:${PATH}"
COPY --from=jre-build /javaruntime $JAVA_HOME

# Install Yarn
RUN apt-get update && apt-get install -y curl gnupg \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/yarnkey.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update && apt-get install -y yarn

# Clone and build
# RUN git clone https://github.com/facebook/react.git /tmp/react \
#     && cd /tmp/react \
#     && yarn install \
#     && yarn build-for-devtools \
#     && cd ./packages/react-devtools-extensions \
#     && yarn build:chrome

# Stage 3: Setup the final image
FROM mcr.microsoft.com/devcontainers/base:bullseye


# Install general dependencies and Chrome
# RUN apt-get update \
#     && apt-get install -y wget gnupg \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
#     && sh -c 'echo "deb [arch=arm64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] https://dl-ssl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \

# Update package lists and install necessary tools
RUN apt-get update && \
    apt-get install -y software-properties-common nano

# Add contrib and non-free to sources.list
RUN echo "deb http://deb.debian.org/debian bullseye main contrib non-free" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian-security bullseye-security main contrib non-free" >> /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bullseye-updates main contrib non-free" >> /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bullseye-backports main contrib non-free" >> /etc/apt/sources.list

RUN apt-get update && apt-get -t bullseye-backports install -y open-vm-tools

RUN apt-get update \
    && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \ 
    #
    fonts-dejavu \ 
    fonts-liberation \ 
    fonts-liberation2 \
    # ttf-mscorefonts-installer \ 
    fonts-noto \ 
    fonts-noto-cjk \
    fonts-freefont-ttf \
    fonts-recommended \
    fonts-firacode \
    dbus \ 
    dbus-x11 \
    chromium \
    # libappindicator3-1 \
    # ibgdk-pixbuf2.0-0 \ 
    # libxdamage1 \
    alsa-utils \ 
    pulseaudio \
    mesa-utils \
    mesa-utils-extra \
    # eglinfo \
    libgl1-mesa-dri \
    libegl1-mesa \
    libgles2-mesa \
    libglx-mesa0 \
    # vulkan-tools \ 
    # mesa-vulkan-drivers \ 
    # upower \ 
    --no-install-recommends \
    # && sudo usermod -aG video $USER \
    && rm -rf /var/lib/apt/lists/* /var/tmp/*
    
# COPY install.sh /tmp/install.sh
# RUN chmod +x /tmp/install.sh \
#     && /tmp/install.sh \
#     && rm /tmp/install.sh

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

FROM mcr.microsoft.com/devcontainers/base:bullseye

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] https://dl-ssl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

RUN apt-get update \
    && apt-get install -y libnss3 libgbm1 fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 xdg-utils fonts-recommended alsa-utils vulkan-tools mesa-vulkan-drivers upower xvfb --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
    
RUN mkdir -p /tmp/runtime-vscode \
    && chown vscode:vscode /tmp/runtime-vscode \
    && chmod 700 /tmp/runtime-vscode \
    && usermod -a -G audio,video vscode

# Add node binaries to PATH
ENV PATH=./node_modules/.bin:$PATH
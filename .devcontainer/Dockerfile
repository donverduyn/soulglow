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

COPY ./codemods /tmp/codemods
RUN git clone https://github.com/mantinedev/mantine /tmp/mantine \
    && cd /tmp/mantine \
    && yarn install \
    && yarn dlx jscodeshift -t /tmp/codemods/previewHead.ts ./.storybook/main.ts --parser=ts \
    && cat ./.storybook/main.ts \
    && ./node_modules/.bin/storybook build \
    && mv ./storybook-static /tmp/mantine-storybook

# Step 3: Create the final image
FROM mcr.microsoft.com/devcontainers/base:bullseye

RUN apt-get update \
    && apt-get install -y \
    xdg-utils \ 
    fonts-dejavu \ 
    fonts-liberation \ 
    fonts-liberation2 \
    fonts-noto \ 
    fonts-noto-cjk \
    fonts-freefont-ttf \
    fonts-recommended \
    fonts-firacode \
    dbus \
    dbus-x11 \
    chromium \
    alsa-utils \ 
    pulseaudio \
    mesa-utils-extra \
    # vulkan-tools \ 
    # upower \ 
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* /var/tmp/*


# RUN apt-get update && apt-get install -y \
#     pkg-config \
#     cmake \
#     build-essential \
#     python3 \
#     python3-pip \
#     python3-venv \
#     && apt-get clean


# # Create a virtual environment for Python packages
# RUN python3 -m venv /opt/venv
# RUN echo "source /opt/venv/bin/activate" | tee -a ~/.bashrc

# # Extract the current 'secure_path' from sudoers, append the venv path, and patch it in /etc/sudoers.d
# RUN CURRENT_SECURE_PATH=$(grep -Po '^Defaults\s+secure_path\s*=\s*"\K[^"]*' /etc/sudoers) \
#     && echo "Defaults secure_path=\"/opt/venv/bin:$CURRENT_SECURE_PATH\"" | tee /etc/sudoers.d/custom_secure_path

# # Ensure the sudoers file has the correct permissions
# RUN chmod 440 /etc/sudoers.d/custom_secure_path

# # Activate the virtual environment and install Meson
# RUN /opt/venv/bin/pip install --upgrade pip --no-cache-dir pip && \
#     /opt/venv/bin/pip install --no-cache-dir pycparser PyYAML Mako meson

# # Add virtual environment to PATH to make meson available globally
# ENV PATH="/opt/venv/bin:$PATH"

# RUN echo "deb-src http://deb.debian.org/debian bookworm main" >> /etc/apt/sources.list
# RUN apt-get update && apt-get build-dep -y mesa && apt-get build-dep -y libdrm

# ENV LIBDIR=/usr/lib/aarch64-linux-gnu
# ENV TOP=/opt

# # Clone and build libdrm
# RUN git clone https://gitlab.freedesktop.org/mesa/drm.git $TOP/drm && \
#     cd $TOP/drm && \
#     meson builddir --prefix=/usr --libdir=${LIBDIR} && \
#     meson compile -C builddir && \
#     meson install -C builddir

# # # Clone and build Mesa with SVGA3D driver support
# RUN git clone https://gitlab.freedesktop.org/mesa/mesa.git $TOP/mesa && \
#     cd $TOP/mesa && \
#     meson builddir -Dvulkan-drivers= -Dgallium-drivers=svga -Dglvnd=enabled -Dglvnd-vendor-name=mesa --prefix=/usr && \
#     meson compile -C builddir && \
#     meson install -C builddir
    

# Additional container configuration
RUN mkdir -p /tmp/runtime-vscode \
    && chown vscode:vscode /tmp/runtime-vscode \
    && chmod 700 /tmp/runtime-vscode \
    && usermod -a -G audio,video vscode

# Copy built React DevTools from the builder stage
# COPY --from=builder /tmp/react/packages/react-devtools-extensions/chrome/build /tmp/react-devtools-extensions

COPY --from=builder /tmp/mantine-storybook /tmp/mantine-storybook
# Create empty JSON files
RUN echo '{}' > /tmp/mantine-storybook/metadata.json \
  && echo '{}' > /tmp/mantine-storybook/stories.json

RUN yarn dlx playwright install --with-deps

# Add Node binaries to PATH
ENV PATH=./node_modules/.bin:$PATH

# If you want to use Java runtime
# ENV JAVA_HOME=/opt/java/openjdk
# ENV PATH "${JAVA_HOME}/bin:${PATH}"
# COPY --from=jre-build /javaruntime $JAVA_HOME

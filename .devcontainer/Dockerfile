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
COPY ./codemods /tmp/codemods
RUN git clone https://github.com/mantinedev/mantine /tmp/mantine \
    && cd /tmp/mantine \
    && yarn install \
    && yarn dlx jscodeshift -t /tmp/codemods/preview-head.ts ./.storybook/main.ts --parser=ts \
    && yarn dlx jscodeshift -t /tmp/codemods/parameters-docs.ts ./.storybook/preview.tsx --parser=tsx \
    && cat ./.storybook/preview.tsx \
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
    inotify-tools \
    # libflite.so.1 \
    # libflite_usenglish.so.1 \     
    # libflite_cmu_grapheme_lang.so.1 \
    # libflite_cmu_grapheme_lex.so.1 \
    # libflite_cmu_indic_lang.so.1 \
    # libflite_cmu_indic_lex.so.1 \ 
    # libflite_cmulex.so.1 \  
    # libflite_cmu_time_awb.so.1 \
    # libflite_cmu_us_awb.so.1 \
    # libflite_cmu_us_kal16.so.1 \
    # libflite_cmu_us_kal.so.1 \
    # libflite_cmu_us_rms.so.1 \
    # libflite_cmu_us_slt.so.1 \
    # libharfbuzz-icu.so.0 \
    # libenchant-2.so.2 \
    # libsecret-1.so.0 \
    # libhyphen.so.0 \             
    # libmanette-0.2.so.0 \
    # libdw.so.1 \
    # libgudev-1.0.so.0 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* /var/tmp/*

# Additional container configuration
RUN mkdir -p /tmp/runtime-vscode \
    && chown vscode:vscode /tmp/runtime-vscode \
    && chmod 700 /tmp/runtime-vscode \
    && usermod -a -G audio,video vscode

# Copy built React DevTools from the builder stage
COPY --from=builder /tmp/mantine-storybook /tmp/mantine-storybook

# Create empty JSON files
RUN echo '{}' > /tmp/mantine-storybook/metadata.json \
  && echo '{}' > /tmp/mantine-storybook/stories.json

# Add Node binaries to PATH
ENV PATH=/home/vscode/.yarn/bin:/node_modules/.bin:$PATH

# Copy the script into the container
COPY ./shell.sh /usr/local/bin/shell.sh

# Append the script to bashrc and zshrc
RUN echo "source /usr/local/bin/shell.sh" >> /etc/bash.bashrc \
    && echo "source /usr/local/bin/shell.sh" >> /etc/zsh/zshrc

# If you want to use Java runtime
# ENV JAVA_HOME=/opt/java/openjdk
# ENV PATH "${JAVA_HOME}/bin:${PATH}"
# COPY --from=jre-build /javaruntime $JAVA_HOME

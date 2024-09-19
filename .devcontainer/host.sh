#!/bin/bash
# make sure the config directory exists to bind mount
# mkdir -p "$HOME/.minikube"
# mkdir -p "$HOME/.kube"

# Install monaspace

if [ ! -d "/tmp/monaspace" ]; then
    git clone https://github.com/githubnext/monaspace.git /tmp/monaspace > /dev/null 2>&1
    cd /tmp/monaspace

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        chmod +x ./util/install_linux.sh
         ./util/install_linux.sh > /dev/null 2>&1
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        chmod +x ./util/install_macos.sh
         ./util/install_macos.sh > /dev/null 2>&1
    fi
fi

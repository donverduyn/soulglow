#!/bin/bash

# make sure the config directory exists to bind mount
mkdir -p "$HOME/.minikube"
mkdir -p "$HOME/.kube"

# Check if the /tmp/monaspace directory does not exist
if [ ! -d "/tmp/monaspace" ]; then
    # Clone the repository into /tmp/monaspace
    git clone https://github.com/githubnext/monaspace.git /tmp/monaspace > /dev/null 2>&1

    # Change directory to /tmp/monaspace
    cd /tmp/monaspace

    # Make the installation script executable
    chmod +x ./util/install_linux.sh

    # Run the installation script with all output silenced
    ./util/install_linux.sh > /dev/null 2>&1
fi

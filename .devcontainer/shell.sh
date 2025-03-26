#!/bin/bash

# Ensure DISPLAY is set for X11 apps
export DISPLAY=host.docker.internal:0

# Function to dynamically add `node_modules/.bin` to PATH
add_node_bin_to_path() {
  local dir="$PWD"
  while [ "$dir" != "/" ]; do
    if [ -d "$dir/node_modules/.bin" ]; then
      export PATH="$dir/node_modules/.bin:$PATH"
      break
    fi
    dir="$(dirname "$dir")"
  done
}

# Run on shell start
add_node_bin_to_path

# Hook into `cd` so it updates dynamically
cd() {
  builtin cd "$@" || return
  add_node_bin_to_path
}

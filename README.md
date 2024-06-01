# Milight UI

This Project provides a modern UI to interact with the Rest API provided by (https://github.com/sidoh/esp8266_milight_hub)

# Getting started
To get started, make sure you are on a linux machine/vm and have docker installed. Pull the repository and navigate to the root directory of the project. Open in dev container and grab a coffee.

## Running on Apple Silicon
There is a problem with compiling react from source on arm64 to obtain react devtools for puppeteer chromium, so a VM with Rosetta emulation is required on Apple Silicon for now. 
https://github.com/imagemin/gifsicle-bin/issues/124

It is advised to use vscode with the remote SSH extension. For more information see:
https://code.visualstudio.com/remote/advancedcontainers/develop-remote-host. 

### X11 client
Also make sure you have XQuartz installed. Don't forget to enable remote connections in the settings and X11 forwarding should work automatically.

## Starting the development server
Note that Puppeteer is used to manage the browser for development. It automatically provides React Devtools and forwards the browser to the host machine over x11. To start the development server run:

```
yarn dev
```
### Inspect dependency tree
To inspect the dependency tree run the dev server and visit the /__inspect link provided in the terminal.


# Testing
To run the test suite with vitest, run:

```
yarn test
```
A browser window will open and display the test results.

# Contributing
If you like to contribute to this project, please reach out to me. I am happy to help you get started.

## Editing files
To edit files in VScode that are opened in preview mode, press `Ctrl + Shift + V`. Don't click on the page before pressing the shortcut.

## Patches
Currently, the project is using a patched version of vite-plugin-checker, because it is incompatible with the ESM version of meow.

# License
This project is licensed under the MIT License - see the LICENSE.md file for details.

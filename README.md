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
Note that Puppeteer manages the browser for development purposes. It automatically provides React Devtools. Chromium is automatically forwarded over X11 to the host machine. To start the development server run:


```
yarn dev
```

#### Tips
- On Linux, chromium will steal focus and you can close the window with `Esc`.
- On MacOS, chromium will not steal focus and you can close the window with `Cmd + C`, ending the terminal process, which closes the window too.

### Visiting the dev server outside of the container
The dev server is running on port 4173 and is statically forwarded to the host machine. To visit the dev server on the host, launch the dev server, open a browser and navigate to http://localhost:4173. If you want to make the dev server available to other devices on the network, configure your firewall to allow incoming connections on port 4173. Remote debugging is not supported outside of the container.

### Debugging
To debug the client, run "Attach to Chrome" in the debug tab of vscode. The debugger will attach to the x11 forwarded chromium instance and set breakpoints in the code in vscode.

### Inspect dependency tree
To inspect the dependency tree run the dev server and visit the /__inspect link provided in the terminal.


# Testing
To run the test suite with vitest, run:

```
yarn test
```
A browser window will open and display the test results.

# Linting
The project runs tsc, eslint and stylelint in a concurrently to ensure code quality. To run the linter, run:

```
yarn lint
```

## Navigating to the error
Note that the any warnings and errors are also displayed in the left corner of the browser window when running the dev server. You can click on the warning to navigate to the file and line where the error occured.

# Contributing
If you like to contribute to this project, please reach out to me. I am happy to help you get started.

## Editing files
To edit files in VScode that are opened in preview mode, press `Ctrl + Shift + V`. Don't click on the page before pressing the shortcut.

## Patches
Currently, the project is using a patched version of vite-plugin-checker, because it is incompatible with the ESM version of meow.

# License
This project is licensed under the MIT License - see the LICENSE.md file for details.

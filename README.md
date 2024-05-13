# Milight UI

This Project provides a modern UI to interact with the Rest API provided by (https://github.com/sidoh/esp8266_milight_hub)

# Getting started

To get started, make sure you are on a linux machine/vm and have docker installed. Pull the repository and navigate to the root directory of the project. Open in dev container and grab a coffee.

To start the development server run:

```
yarn dev
```

# Testing

To run the test suite with vitest, run:

```
yarn test
```
An browser window will open and display the test results.

# Editing files

To edit files in VScode that are opened in preview mode, press `Ctrl + Shift + V`. Don't click on the page before pressing the shortcut.

# Patches

Currently, the project is using a patched version of vite-plugin-checker, because it is incompatible with the ESM version of meow.
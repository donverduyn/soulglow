import fs from 'node:fs';
import path from 'node:path';
import { Plugin } from 'vite';

function removeExtraFontsPlugin(): Plugin {
  let projectRoot = ''; // Variable to store the project root path

  return {
    // Only apply in build mode
    apply: 'build',

    // This hook runs after the build is complete
    closeBundle() {
      // Resolve the path to 'storybook-static' relative to the project root
      const storybookStaticDir: string = path.resolve(
        projectRoot,
        'storybook-static'
      );
      const fontsFolder: string = path.join(storybookStaticDir, 'fonts');
      const fontExtensions: string[] = [
        '.woff',
        '.woff2',
        '.ttf',
        '.eot',
        '.otf',
      ];

      // console.log('Removing extra font files outside the fonts folder...');

      /**
       * Recursively traverse the directory and remove font files that are outside the fonts folder.
       * @param dir - Directory to scan
       */
      function removeFontFilesOutsideFontsFolder(dir: string): void {
        const files: string[] = fs.readdirSync(dir);

        files.forEach((file: string) => {
          const fullPath: string = path.join(dir, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && fullPath !== fontsFolder) {
            // Recurse into subdirectories except the 'fonts' folder
            removeFontFilesOutsideFontsFolder(fullPath);
          } else if (stat.isFile()) {
            // Check if the file is a font file
            if (fontExtensions.includes(path.extname(file))) {
              // If the file is outside the 'fonts' folder, remove it
              if (!fullPath.startsWith(fontsFolder)) {
                // console.log(`Removing font file: ${fullPath}`);
                fs.unlinkSync(fullPath);
              }
            }
          }
        });
      }

      // Ensure the 'storybook-static' directory exists before attempting to process
      if (fs.existsSync(storybookStaticDir)) {
        // Run the removal process
        removeFontFilesOutsideFontsFolder(storybookStaticDir);
      } else {
        console.warn(
          `Directory ${storybookStaticDir} does not exist, skipping font removal.`
        );
      }
    },

    // Ensure it runs after everything else
    // Hook to get Vite's root directory
    configResolved(config) {
      projectRoot = config.root; // Capture the project root
    },

    enforce: 'post',

    // Name of the plugin
    name: 'remove-extra-fonts-plugin',
  };
}

export default removeExtraFontsPlugin;

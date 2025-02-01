import { createClient } from '@hey-api/openapi-ts';
import yargs from 'yargs';

const argv = yargs().option('watch', {
  alias: 'w',
  describe: 'Watch for file changes',
  type: 'boolean',
}).argv;

export const generate = async (
  yamlFilePath: string = './openapi.yml',
  outputDir: string = './src/__generated/api'
) => {
  try {
    // Generate TypeScript client
    await createClient({
      // client: '@hey-api/client-fetch',
      // debug: true,
      // experimentalParser: true,
      input: yamlFilePath,
      logs: {
        level: 'trace',
        path: './logs',
      },
      output: {
        // format: 'prettier',
        // lint: 'eslint',
        path: outputDir,
      },
      plugins: [
        {
          name: '@hey-api/client-fetch',
        },
        {
          enums: 'typescript',
          identifierCase: 'preserve',
          name: '@hey-api/typescript',
        },
        {
          asClass: true,
          name: '@hey-api/sdk',
          serviceNameBuilder: '{{name}}Service',
        },
      ],
      watch: (await argv).watch === true,
      // schemas: {
      //   export: true,
      //   type: 'json',
      // },
    });

    console.log('Client generation completed successfully.');
  } catch (error) {
    console.error('Failed to generate client:', error);
  }
};

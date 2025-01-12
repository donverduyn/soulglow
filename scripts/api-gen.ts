import { createClient } from '@hey-api/openapi-ts';

export const generate = async (
  yamlFilePath: string = './openapi.yml',
  outputDir: string = './src/__generated/api'
) => {
  try {
    // Generate TypeScript client
    await createClient({
      client: '@hey-api/client-fetch',
      // debug: true,
      input: yamlFilePath,
      output: {
        format: 'prettier',
        lint: 'eslint',
        path: outputDir,
      },

      plugins: [
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

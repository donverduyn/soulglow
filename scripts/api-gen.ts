import * as fs from 'fs';
import { createClient } from '@hey-api/openapi-ts';
import { load } from 'js-yaml';

export const generate = async (
  yamlFilePath: string = './openapi.yml',
  outputDir: string = './src/__generated/api'
) => {
  try {
    // Read YAML file and parse it
    const yamlContent = fs.readFileSync(yamlFilePath, 'utf8');
    const jsonSpec = load(yamlContent) as Record<string, unknown>;

    // Generate TypeScript client
    await createClient({
      client: 'fetch',
      // debug: true,
      input: Object.assign(jsonSpec, {
        servers: [{ url: '/api' }],
      }),
      output: {
        format: 'prettier',
        lint: 'eslint',
        path: outputDir,
      },
      schemas: {
        export: true,
        type: 'json',
      },
      services: {
        export: true,
        name: '{{name}}Service',
      },
      types: {
        dates: true,
        enums: 'typescript',
        export: true,
        name: 'preserve',
      },
    });

    console.log('Client generation completed successfully.');
  } catch (error) {
    console.error('Failed to generate client:', error);
  }
};

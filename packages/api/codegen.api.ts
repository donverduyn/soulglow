import type { CodegenConfig } from '@graphql-codegen/cli';
// import { api as clientApi } from 'client/public';

// Default to localhost
let host = 'localhost';

// Parse --host from CLI args
process.argv.forEach((arg, i) => {
  if (arg === '--host' && process.argv[i + 1]) {
    host = process.argv[i + 1];
  }
});

const address = `http://${host}:8080/v1/graphql`;

export const config: CodegenConfig = {
  documents: ['../../**/*.gql', '!**/node_modules/**'],
  generates: {
    'metadata/query_collections.yaml': {
      plugins: ['hasura-allow-list'],
    },
    '__generated/introspection.json': {
      plugins: ['introspection'],
    },
  },
  hooks: {
    beforeDone: [
      'yarn hasura:metadata:apply',
      // 'prettier --write src/__generated/gql/**/*.ts src/__generated/gql/**/*.json src/__generated/gql/**/*.yml',
    ],
  },
  schema: [
    {
      [address]: {
        headers: {
          'X-Hasura-Admin-Secret': 'admin_secret',
        },
      },
    },
  ],
  overwrite: true,
  watch: false,
};

export default config;

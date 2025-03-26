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

const isCI = process.env.CI === 'true';

const address = `http://${host}:8080/v1/graphql`;

export const config: CodegenConfig = {
  documents: ['../../**/*.gql', '!**/node_modules/**'],
  generates: {
    '__generated/introspection.json': {
      plugins: ['introspection'],
    },
    'metadata/query_collections.yaml': {
      plugins: ['hasura-allow-list'],
    },
  },
  hooks: {
    beforeDone: isCI ? [] : ['yarn hasura:metadata:apply'],
  },
  overwrite: true,
  schema: [
    {
      [address]: {
        headers: {
          'X-Hasura-Admin-Secret': 'admin_secret',
        },
      },
    },
  ],
  watch: false,
};

export default config;

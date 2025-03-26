import type { CodegenConfig } from '@graphql-codegen/cli';
// import { api as clientApi } from 'client/public';
import { api } from './public';

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
      [api.address]: {
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

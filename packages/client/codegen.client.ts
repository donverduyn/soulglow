import path from 'node:path';
import type { CodegenConfig } from '@graphql-codegen/cli';
// import { api as api } from 'api/public';
import { api as clientApi } from './public';

// this is used in postinstall to prevent codegen from applying the metadata, as this is is not needed when we opt out of allow list
const noExternal = process.argv.includes('--no-external');

export const internalPlugins: NonNullable<CodegenConfig['generates']> = {
  './src/__generated/gql/fabbrica.ts': {
    config: {
      namingConvention: {
        enumValues: 'change-case-all#upperCase',
        typeNames: 'change-case-all#pascalCase',
      },
      nonOptionalDefaultFields: true,
      typesFile: './types',
    },
    plugins: ['@mizdra/graphql-codegen-typescript-fabbrica'],
  },
  // './src/__generated/gql/modules.ts': {
  //   plugins: [
  //     {
  //       add: {
  //         content: typenamesByModulePlugin({
  //           filter: (typename) =>
  //             !typename.endsWith('_root') && typename !== 'mutation_root',
  //           operationsPath: './src/__generated/gql/operations.ts',
  //         }),
  //       },
  //     },
  //   ],
  // },
  'src/__generated/gql/introspection.client.json': {
    config: {
      includeDirectives: true,
      includeEnums: true,
      includeInputs: false,
      includeScalars: true,
    },
    plugins: ['urql-introspection'],
  },
  'src/__generated/gql/mocks.msw.ts': {
    plugins: ['typescript-msw'],
    preset: 'import-types',
    presetConfig: {
      typesPath: './operations',
    },
    schema: './../api/__generated/introspection.json',
  },
  'src/__generated/gql/operations.ts': {
    plugins: ['typescript-operations', 'typed-document-node'],
    preset: 'import-types',
    presetConfig: {
      typesPath: './types',
    },
  },
  'src/__generated/gql/types.ts': {
    config: {
      avoidOptionals: true,
      enumsAsTypes: true,
      namingConvention: {
        enumValues: 'change-case-all#upperCase',
        typeNames: 'change-case-all#pascalCase',
      },
      scalars: {
        ID: 'string',
        timestamptz: {
          input: 'Date',
          output: 'string',
        },
        uuid: 'string',
      },
    },
    plugins: ['typescript'],
  },
};

export const internalHooks: NonNullable<CodegenConfig['hooks']> = {
  afterAllFileWrite: [
    'npx jscodeshift -t ./.codegen/transforms/strip-document-suffix.ts ./src/__generated/gql/operations.ts --parser=ts',
    'npx jscodeshift -t ./.codegen/transforms/strip-input-fields.ts ./src/__generated/gql/types.ts --parser=ts',
    'npx tsx ./.codegen/transforms/strip-client-schema.ts src/__generated/gql/introspection.client.json',
    'npx tsx ./.codegen/transforms/codegen-plugin-modules.ts',
  ],
};

export const externalPlugins: NonNullable<CodegenConfig['generates']> = {
  [`./../api/metadata/query_collections.yaml`]: {
    plugins: ['hasura-allow-list'],
  },
};

export const externalHooks: NonNullable<CodegenConfig['hooks']> = {
  beforeDone: [
    `cd ${path.resolve(__dirname, './../api && yarn hasura:metadata:apply')}`,
  ],
};

export const config: CodegenConfig = {
  documents: clientApi.documents,
  generates: {
    ...(!noExternal ? externalPlugins : {}),
    ...internalPlugins,
  },
  hooks: noExternal
    ? internalHooks
    : Object.assign({}, internalHooks, externalHooks),
  overwrite: true,
  schema: [
    './../api/__generated/introspection.json',
    './.codegen/local-schema.gql',
  ],
  watch: false, //process.env.NODE_ENV === 'development',
};

export default config;

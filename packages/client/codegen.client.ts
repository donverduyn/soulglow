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
  'src/__generated/gql/introspection.urql.json': {
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
  // beforeAllFileWrite: ['rm -rf src/__generated/gql/*'],
  afterAllFileWrite: [
    'npx jscodeshift -t ./.codegen/transforms/strip-document-suffix.ts ./src/__generated/gql/operations.ts --parser=ts',
  ],
};

export const externalPlugins: NonNullable<CodegenConfig['generates']> = {
  [`./../api/metadata/query_collections.yaml`]: {
    plugins: ['hasura-allow-list'],
  },
};

export const externalHooks: NonNullable<CodegenConfig['hooks']> = {
  beforeDone: ['cd ./../api && yarn hasura:metadata:apply'],
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
  schema: './../api/__generated/introspection.json',
  watch: false, //process.env.NODE_ENV === 'development',
};

export default config;

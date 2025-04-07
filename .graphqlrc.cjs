module.exports = {
  documents: ['./packages/client/src/**/*.gql'],
  extensions: {
    languageService: {
      enableValidation: false,
    },
  },
  schema: [
    './packages/api/__generated/introspection.json',
    './packages/client/.codegen/local-schema.gql',
  ],
};

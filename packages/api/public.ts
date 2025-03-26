export const api = {
  address: 'http://hasura:8080/v1/graphql',
  queryCollections: 'metadata/query_collections.yaml',
  schema: '__generated/introspection.json',
} as const;

import type { DocumentNode, IntrospectionQuery } from 'graphql';
import {
  buildClientSchema,
  getOperationAST,
  GraphQLSchema,
  isObjectType,
  isInputObjectType,
  OperationTypeNode,
} from 'graphql';
import memoize from 'moize';
import {
  type AnyVariables,
  type OperationResult,
  type TypedDocumentNode,
  createRequest,
  Client,
  type GraphQLRequest,
} from 'urql';
import { createEventFactory } from './event';

const getOperation = memoize((doc: DocumentNode) => {
  const op = getOperationAST(doc, undefined);
  if (!op) throw new Error('No operation found in GraphQL document');
  return op;
});

export function getOperationType(doc: DocumentNode) {
  return getOperation(doc).operation;
}

export function getOperationName(doc: DocumentNode) {
  return getOperation(doc).name?.value;
}

export function getSchemaTypes(schema: GraphQLSchema): string[] {
  return Object.values(schema.getTypeMap())
    .filter((type) => isObjectType(type) || isInputObjectType(type))
    .map((type) => type.name)
    .filter(
      (name) =>
        !name.startsWith('__') &&
        !['query_root', 'mutation_root', 'subscription_root'].includes(name) &&
        !name.endsWith('MutationResponse') &&
        !name.toLowerCase().includes('aggregate') &&
        !name.toLowerCase().includes('fields')
    );
}

export function getSchemaFromJson(
  rawJson: Record<string, unknown>
): GraphQLSchema {
  // rawJson should contain { data: { __schema: { ... }}} at the top level
  // Cast it to IntrospectionQuery for type safety
  return buildClientSchema(rawJson as unknown as IntrospectionQuery);
}

export const createGraphQLRequestEvent = createEventFactory(
  'GraphQLRequest',
  <TData, TVariables extends AnyVariables>(
    query: TypedDocumentNode<TData, TVariables>,
    variables: TVariables
  ) => {
    const request = createRequest(query, variables);
    const name = getOperationName(request.query);
    if (name === undefined) {
      throw new Error('Operation name is required');
    }
    const topic = `gql/${String(name)}:${String(request.key)}`;
    return { request, topic };
  }
);

export const createGraphQLResponseEvent = createEventFactory(
  'GraphQLResponse',
  <TData, TVariables extends AnyVariables>(
    operationResult: OperationResult<TData, TVariables>,
    topic: string
  ) => {
    return { operationResult, topic };
  }
);

export const executeRequest = <TData, TVariables extends AnyVariables>(
  client: Client,
  request: GraphQLRequest<TData, TVariables>,
  context: Record<string, unknown> = {}
) => {
  const type = getOperationType(request.query);
  return type === OperationTypeNode.QUERY
    ? client.executeQuery(request, context)
    : type === OperationTypeNode.MUTATION
      ? client.executeMutation(request, context)
      : client.executeSubscription(request, context);
  // const op = client.createRequestOperation(
  //   getOperationType(request.query),
  //   request,
  //   context
  // );
  // const source = client.executeRequestOperation(op);
  // return source;
};

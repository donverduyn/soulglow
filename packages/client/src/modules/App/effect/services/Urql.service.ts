import {
  Client,
  type AnyVariables,
  type GraphQLRequest,
  type TypedDocumentNode,
} from '@urql/core';
import { fetchExchange, OperationResult } from '@urql/core';
import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import { pipe, Effect, Stream } from 'effect';
import { context } from 'effect/FastCheck';
import { toAsyncIterable } from 'wonka';
import schema from '__generated/gql/introspection.client.json';
// import {
//   EndpointPanel_EndpointByPk,
//   EndpointPanel_Endpoint,
// } from '__generated/gql/operations';

// const isCI = import.meta.env.CI === 'true';
const isInContainer =
  typeof process !== 'undefined' && process.env.REMOTE_CONTAINERS === 'true';

const url = `http://${isInContainer ? 'hasura' : 'localhost'}:8080/v1/graphql`;
const headers = {
  'X-Hasura-Admin-Secret': 'admin_secret',
};

export const client = new Client({
  exchanges: [
    devtoolsExchange,
    // populateExchange({
    //   schema: schema as unknown as IntrospectionQuery,
    // }),
    cacheExchange({ schema }),
    // retryExchange({}),
    // offlineExchange({}),
    // subscriptionExchange({}),
    fetchExchange,
  ],
  fetchOptions: () => ({ headers }),
  url,
});

type MessageFactory = <TVariables extends AnyVariables, TResponse>(
  query: TypedDocumentNode<TResponse, TVariables>,
  variables: TVariables
) => {
  document: TypedDocumentNode<TResponse, TVariables>;
  variables: TVariables;
};

// Generic query factory function
const createMessage: MessageFactory = (document, variables) => ({
  document,
  variables,
});

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const test = createMessage(EndpointPanel_EndpointByPk, {
//   id: '123',
// });

export class UrqlService {
  constructor(private readonly client: Client) {}

  public query<TResponse, TVariables extends AnyVariables>(
    request: GraphQLRequest<TResponse, TVariables>,
    handler: <A, E, R>(
      e: OperationResult<TResponse, TVariables>
    ) => Effect.Effect<A, E, R>
  ) {
    // TODO: think about using a ref to prevent recomposing the effect on every method call
    return pipe(
      Effect.sync(() =>
        this.client.executeMutation(
          {
            key: request.key,
            query: request.query,
            variables: request.variables,
          },
          context
        )
      ),
      Effect.andThen((source) =>
        pipe(
          Stream.fromAsyncIterable(pipe(source, toAsyncIterable), () => {}),
          Stream.tap((e) => handler(e).pipe(Effect.forkScoped)),
          Stream.take(1),
          Stream.runCollect,
          Effect.forkScoped
        )
      )
    );
  }
  // public mutation<TResponse, TVariables extends AnyVariables>(
  //   document: TypedDocumentNode<TResponse, TVariables>,
  //   variables: TVariables
  // ) {
  //   return this.client.executeMutation(document, variables).toPromise();
  // }
  // public subscription<TResponse, TVariables extends AnyVariables>(
  //   document: TypedDocumentNode<TResponse, TVariables>,
  //   variables: TVariables
  // ) {
  //   return this.client.executeSubscription(document, variables).toPromise();
  // }
}

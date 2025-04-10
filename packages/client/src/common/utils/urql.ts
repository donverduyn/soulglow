import type {
  Data,
  DataFields,
  UpdateResolver,
} from '@urql/exchange-graphcache';
import {
  DocumentNode,
  FieldNode,
  Kind,
  OperationDefinitionNode,
  OperationTypeNode,
} from 'graphql';
import type { TypedDocumentNode } from 'urql';

type UpdateStrategy = 'append' | 'removeById' | 'replaceById';
type Updates = Record<string, Record<string, UpdateResolver>>;

export function generateUpdatesFromDocuments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operations: Record<string, TypedDocumentNode<any, any>>
): Updates {
  const updates: Updates = { mutation_root: {} };

  for (const [_, doc] of Object.entries(operations)) {
    const op = extractMutationOperation(doc);
    if (!op) continue;

    const mutationName = op.name?.value;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!mutationName || !doc.definitions) continue;

    const field = op.selectionSet.selections[0];
    if (field.kind !== Kind.FIELD) continue;

    const mutationFieldName = field.name.value;
    const entityTypeName = getEntityTypeFromSelection(field);

    if (!entityTypeName) continue;

    const strategy = inferStrategy(mutationFieldName);
    if (!strategy) continue;

    const listQueryKey = generateQueryKey(entityTypeName);
    const listQueryDoc = operations[listQueryKey];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!listQueryDoc) continue;

    updates.mutation_root[mutationFieldName] = makeUpdater(
      strategy,
      entityTypeName,
      listQueryDoc
    );
  }

  return updates;
}

function extractMutationOperation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: TypedDocumentNode<any, any>
): OperationDefinitionNode | null {
  return (
    doc.definitions.find(
      (d): d is OperationDefinitionNode =>
        d.kind === Kind.OPERATION_DEFINITION &&
        d.operation === OperationTypeNode.MUTATION
    ) ?? null
  );
}

function getEntityTypeFromSelection(field: FieldNode): string | null {
  const name = field.name.value;

  const entityType = name
    .replace(/^insert/, '')
    .replace(/^update/, '')
    .replace(/^delete/, '')
    .replace(/(One|ByPk|Many|Aggregate|Stream|Response)?$/, '')
    .replace(/^\w/, (c) => c.toLowerCase());

  return entityType || null;
}

function inferStrategy(name: string): UpdateStrategy | null {
  if (name.startsWith('insert')) return 'append';
  if (name.startsWith('delete')) return 'removeById';
  if (name.startsWith('update')) return 'replaceById';
  return null;
}

function generateQueryKey(entity: string): string {
  const name = entity.charAt(0).toUpperCase() + entity.slice(1);
  return `${name}Panel_${name}List`;
}

function makeUpdater(
  strategy: UpdateStrategy,
  entityType: string,
  queryDoc: DocumentNode
): UpdateResolver {
  return (result, _, cache) => {
    const entity = extractEntityFromResult(result, entityType);
    if (!entity) return; // No entity was found, no update needed

    const listFieldName = getEntityListField(entityType);
    const queries = cache
      .inspectFields('query_root') // Inspect fields in 'Query' type
      .filter((f) => f.fieldName === listFieldName); // Filter for relevant queries

    // If no queries are found, exit early
    if (queries.length === 0) return;

    for (const { arguments: variables } of queries) {
      cache.updateQuery({ query: queryDoc, variables }, (data) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const list = (data?.[listFieldName] as Data[]) ?? [];
        let updatedList;

        switch (strategy) {
          case 'append':
            updatedList = [...list, entity];
            break;
          case 'removeById':
            // Make sure to filter out the entity by ID
            updatedList = list.filter((e) => e.id !== entity.id);
            break;
          case 'replaceById':
            updatedList = list.map((e) => (e.id === entity.id ? entity : e));
            break;
          default:
            updatedList = list;
        }

        return {
          [listFieldName]: updatedList,
        } as Data;
      });
    }
  };
}

function extractEntityFromResult(result: DataFields, expectedTypename: string) {
  const match = Object.values(result).find(
    (v) => (v as Data).__typename === expectedTypename
  );

  const maybeReturning = Object.values(result).find((v) =>
    Array.isArray((v as Data).returning)
  ) as Data | undefined;

  return ((match || maybeReturning?.returning) as Data | null) ?? null;
}

function getEntityListField(entityType: string): string {
  return entityType; // Defaulting to entity name as the list field (e.g., 'endpoints')
}

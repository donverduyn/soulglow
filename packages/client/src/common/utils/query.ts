export type QueryType<R> = {
  name: string;
  payload: R;
  source: string;
  timestamp: number;
};

type QueryObject = {
  entity: string;
  fields: string[];
  relations?: { [key: string]: QueryObject };
  // eslint-disable-next-line typescript-sort-keys/interface, @typescript-eslint/no-explicit-any
  filters?: { [key: string]: any };
};

export class QueryBuilder {
  private query: QueryObject;

  constructor(entity: string) {
    this.query = { entity, fields: [] };
  }

  static select(entity: string) {
    return new QueryBuilder(entity);
  }

  fields(fields: string[]) {
    this.query.fields = fields;
    return this;
  }

  relation(name: string, subQueryFn: (qb: QueryBuilder) => QueryBuilder) {
    if (!this.query.relations) this.query.relations = {};
    this.query.relations[name] = subQueryFn(new QueryBuilder(name)).build();
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter(filters: Record<string, any>) {
    this.query.filters = filters;
    return this;
  }

  build(): QueryObject {
    return this.query;
  }
}

export function queryObjectToGraphQL(query: QueryObject): string {
  function buildFields(
    fields: string[],
    relations?: Record<string, QueryObject>
  ): string {
    let result = fields.join(' ');

    if (relations) {
      Object.entries(relations).forEach(([relation, subQuery]) => {
        result += ` ${relation} { ${buildFields(subQuery.fields, subQuery.relations)} }`;
      });
    }

    return result;
  }

  const filters = query.filters
    ? `(where: ${JSON.stringify(query.filters).replace(/"([^"]+)":/g, '$1:')})`
    : '';

  return `query { ${query.entity} ${filters} { ${buildFields(query.fields, query.relations)} } }`;
}

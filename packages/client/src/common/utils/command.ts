export type CommandType<R> = {
  name: string;
  payload: R;
  source: string;
  timestamp: number;
};

type CommandObject = {
  command: string; // The action (e.g., "updateUser")
  entity: string; // The entity type (e.g., "user")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>; // Input data
  returnFields?: string[]; // Fields to return after execution
};
export class CommandBuilder {
  private command: CommandObject;

  constructor(command: string, entity: string) {
    this.command = { command, entity, params: {} };
  }

  static create(command: string, entity: string) {
    return new CommandBuilder(command, entity);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params(params: Record<string, any>) {
    this.command.params = params;
    return this;
  }

  returnFields(fields: string[]) {
    this.command.returnFields = fields;
    return this;
  }

  build(): CommandObject {
    return this.command;
  }
}

export function commandObjectToGraphQL(command: CommandObject): string {
  function buildFields(fields: string[]): string {
    return fields.length ? `{ ${fields.join(' ')} }` : '';
  }

  const params = JSON.stringify(command.params).replace(/"([^"]+)":/g, '$1:');
  const returnFields = command.returnFields
    ? buildFields(command.returnFields)
    : '';

  return `mutation { ${command.command}(${params}) ${returnFields} }`;
}

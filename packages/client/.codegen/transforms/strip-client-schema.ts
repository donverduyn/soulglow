#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

type TypeRef = {
  kind: string;
  name?: string;
  ofType?: TypeRef;
};

type IntrospectionType = {
  enumValues?: { name: string }[];
  fields?: { args?: { type: TypeRef }[]; name: string; type: TypeRef }[];
  inputFields?: { name: string; type: TypeRef }[];
  interfaces?: { name: string }[];
  kind: string;
  name: string;
  possibleTypes?: { name: string }[];
};

type Schema = {
  __schema: {
    directives?: unknown[];
    mutationType?: { name: string };
    queryType: { name: string };
    subscriptionType?: { name: string };
    types: IntrospectionType[];
  };
};

const collectTypeNames = (typeRef: TypeRef | undefined, into: Set<string>) => {
  if (!typeRef) return;
  if (typeRef.name) into.add(typeRef.name);
  collectTypeNames(typeRef.ofType, into);
};

const walkType = (
  name: string,
  allTypes: Map<string, IntrospectionType>,
  keep: Set<string>
) => {
  if (keep.has(name)) return;
  const type = allTypes.get(name);
  if (!type) return;

  keep.add(name);

  type.fields?.forEach((field) => {
    collectTypeNames(field.type, keep);
    field.args?.forEach((arg) => collectTypeNames(arg.type, keep));
  });

  type.inputFields?.forEach((input) => collectTypeNames(input.type, keep));
  type.interfaces?.forEach((iface) => walkType(iface.name, allTypes, keep));
  type.possibleTypes?.forEach((pt) => walkType(pt.name, allTypes, keep));
};

const filterIntrospection = (filePath: string) => {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const schema = JSON.parse(fs.readFileSync(absolutePath, 'utf8')) as Schema;

  const typeMap = new Map(schema.__schema.types.map((t) => [t.name, t]));
  const keep = new Set<string>();

  walkType(schema.__schema.queryType.name, typeMap, keep);
  if (schema.__schema.mutationType)
    walkType(schema.__schema.mutationType.name, typeMap, keep);
  if (schema.__schema.subscriptionType)
    walkType(schema.__schema.subscriptionType.name, typeMap, keep);

  // Always keep core scalars
  [
    'String',
    'Int',
    'Float',
    'Boolean',
    'ID',
    'uuid',
    'timestamptz',
    'Any',
  ].forEach((s) => keep.add(s));

  // Prune unused types
  const pruned = {
    ...schema,
    __schema: {
      ...schema.__schema,
      types: schema.__schema.types.filter((t) => keep.has(t.name)),
    },
  };

  fs.writeFileSync(absolutePath, JSON.stringify(pruned, null, 2));
  console.log(
    `[filter-introspection] Cleaned ${path.relative(process.cwd(), absolutePath)} (${String(keep.size)} types kept)`
  );
};

const main = () => {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error(
      'Usage: ts-node scripts/filter-introspection.ts <path-to-introspection.json>'
    );
    process.exit(1);
  }

  filterIntrospection(inputFile);
};

main();

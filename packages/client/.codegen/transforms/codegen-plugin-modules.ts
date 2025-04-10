import * as fs from 'fs';
import * as ts from 'typescript';

type PluginOptions = {
  filter?: (typename: string) => boolean;
  operationsPath: string;
};

export function typenamesByModulePlugin({
  operationsPath,
  filter = (name) => !name.endsWith('_root'),
}: PluginOptions): string {
  // Read the source file content
  const source = fs.readFileSync(operationsPath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    'operations.ts',
    source,
    ts.ScriptTarget.Latest,
    true
  );

  const moduleTypenameMap = new Map<string, Set<string>>();

  // Function to recursively collect typenames
  function extractTypenames(node: ts.Node, set: Set<string>) {
    if (ts.isPropertySignature(node) && node.name.getText() === '__typename') {
      const literal =
        node.type &&
        ts.isLiteralTypeNode(node.type) &&
        ts.isStringLiteral(node.type.literal);

      if (literal) {
        const value = node.type.literal.getText().replace(/['"]/g, '');
        if (filter(value)) {
          set.add(value.toLowerCase());
        }
      }
    }
    ts.forEachChild(node, (child) => extractTypenames(child, set));
  }

  // Loop through all the nodes in the source file and extract typenames
  sourceFile.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      const name = node.name.text;
      const match = /^(\w+)_/.exec(name); // This assumes module names are the first part of the alias
      if (!match) return;

      const module = match[1]; // Module name
      if (!moduleTypenameMap.has(module)) {
        moduleTypenameMap.set(module, new Set());
      }

      // Collect typenames for this module
      extractTypenames(node, moduleTypenameMap.get(module)!);
    }
  });

  // Prepare the final result and deduplicate the typenames
  const result: Record<string, string[]> = {};
  for (const [mod, values] of moduleTypenameMap.entries()) {
    const typenames = Array.from(values).sort(); // Sort typenames
    if (typenames.length > 0) {
      result[mod] = typenames;
    }
  }

  // Generate the contents for the `modules.ts` file
  const contents = `// AUTO-GENERATED FILE - DO NOT EDIT

export const typenamesByModule = {
${Object.entries(result)
  .map(
    ([mod, types]) => `  ${mod}: [${types.map((t) => `'${t}'`).join(', ')}],`
  )
  .join('\n')}
} as const;

export type ModuleName = keyof typeof typenamesByModule;
export type TypenameInModule<M extends ModuleName> = typeof typenamesByModule[M][number];
`;

  return contents; // Return the generated contents to be used by the codegen tool
}

const contents = typenamesByModulePlugin({
  operationsPath: './src/__generated/gql/operations.ts',
});

const outputPath = './src/__generated/gql/modules.ts';
fs.writeFileSync(outputPath, contents);

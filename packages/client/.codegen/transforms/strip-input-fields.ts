import {
  API,
  FileInfo,
  TSTypeAliasDeclaration,
  TSPropertySignature,
} from 'jscodeshift';

const AUDIT_FIELDS = new Set(['createdAt', 'updatedAt']);

export default function transformer(file: FileInfo, api: API): string {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find<TSTypeAliasDeclaration>(j.TSTypeAliasDeclaration)
    .filter((path) => {
      const name = path.node.id.name;
      return name.endsWith('Input');
    })
    .forEach((typePath) => {
      j(typePath)
        .find<TSPropertySignature>(j.TSPropertySignature)
        .filter((propPath) => {
          const key = propPath.node.key;
          return j.Identifier.check(key) && AUDIT_FIELDS.has(key.name);
        })
        .remove();
    });

  return root.toSource({
    quote: 'single',
    trailingComma: true,
  });
}

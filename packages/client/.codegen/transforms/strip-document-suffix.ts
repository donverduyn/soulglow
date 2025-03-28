import { API, FileInfo } from 'jscodeshift';

const DOCUMENT_SUFFIX = 'Document';

export const parser = 'ts';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.VariableDeclaration).forEach((path) => {
    const decls = path.node.declarations;

    decls.forEach((decl) => {
      if (
        decl.type === 'VariableDeclarator' &&
        decl.id.type === 'Identifier' &&
        decl.init &&
        decl.id.name.endsWith(DOCUMENT_SUFFIX)
      ) {
        const originalName = decl.id.name;
        const newName = originalName.slice(
          0,
          originalName.length - DOCUMENT_SUFFIX.length
        );

        // Rename the declaration identifier
        decl.id.name = newName;

        // Replace identifier usage in this declaration
        j(decl.init)
          .find(j.Identifier)
          .forEach((idPath) => {
            if (idPath.node.name === originalName) {
              idPath.node.name = newName;
            }
          });
      }
    });
  });

  return root.toSource({ quote: 'single', trailingComma: true });
}

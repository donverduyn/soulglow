import type { JSCodeshift, Transform } from 'jscodeshift';

const transformer: Transform = (fileInfo, api) => {
  const j: JSCodeshift = api.jscodeshift;
  const root = j(fileInfo.source);
  const defaultExport = root.find(j.ExportDefaultDeclaration);

  const previewHeadFunction = j.property(
    'init',
    j.identifier('previewHead'),
    j.arrowFunctionExpression(
      [j.identifier('head')],
      j.binaryExpression(
        '+',
        j.logicalExpression('||', j.identifier('head'), j.literal('')),
        j.literal(
          '<style>\n' +
            '  .sb-preparing-story,\n' +
            '  .sb-preparing-docs { background: inherit; }\n' +
            '</style>'
        )
      ),
      false
    )
  );

  defaultExport
    .find(j.ObjectExpression)
    .filter((path) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return path.parent.node === defaultExport.get(0).node;
    })
    .forEach((path) => {
      path.value.properties.push(previewHeadFunction);
    });

  return root.toSource();
};

export default transformer;

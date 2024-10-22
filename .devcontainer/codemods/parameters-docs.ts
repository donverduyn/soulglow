import {
  API,
  FileInfo,
  JSCodeshift,
  ObjectExpression,
  Property,
} from 'jscodeshift';

function isProperty(prop: { type: string }): prop is Property {
  return prop.type === 'Property';
}

const exportName = 'parameters';

function createDocsSourceState(j: JSCodeshift): ObjectExpression {
  return j.objectExpression([
    j.property(
      'init',
      j.identifier('docs'),
      j.objectExpression([
        j.property(
          'init',
          j.identifier('source'),
          j.objectExpression([
            j.property('init', j.identifier('state'), j.literal('open')),
          ])
        ),
      ])
    ),
  ]);
}

function mergeProperties(
  existingProperties: Property[],
  newProperties: ObjectExpression
): void {
  const existingDocsProp = existingProperties.find(
    (prop) =>
      isProperty(prop) &&
      prop.key.type === 'Identifier' &&
      prop.key.name === 'docs'
  );

  const newDocsProp = newProperties.properties.find(
    (prop) =>
      isProperty(prop) &&
      prop.key.type === 'Identifier' &&
      prop.key.name === 'docs'
  ) as Property;

  if (existingDocsProp && existingDocsProp.value.type === 'ObjectExpression') {
    const docsObject = existingDocsProp.value;

    const newSourceProp = (
      newDocsProp.value as ObjectExpression
    ).properties.find(
      (prop) =>
        isProperty(prop) &&
        prop.key.type === 'Identifier' &&
        prop.key.name === 'source'
    ) as Property;

    const sourceProperty = docsObject.properties.find(
      (prop) =>
        isProperty(prop) &&
        prop.key.type === 'Identifier' &&
        prop.key.name === 'source'
    ) as Property | undefined;

    if (sourceProperty && sourceProperty.value.type === 'ObjectExpression') {
      const sourceObject = sourceProperty.value;
      const stateProperty = sourceObject.properties.find(
        (prop) =>
          isProperty(prop) &&
          prop.key.type === 'Identifier' &&
          prop.key.name === 'state'
      ) as Property | undefined;

      if (!stateProperty) {
        sourceObject.properties.push(
          (newSourceProp.value as ObjectExpression).properties[0]
        );
      }
    } else {
      docsObject.properties.push(newSourceProp);
    }
  } else {
    existingProperties.push(newDocsProp);
  }
}

export default function transformer(file: FileInfo, api: API): string {
  const j: JSCodeshift = api.jscodeshift;
  const root = j(file.source);
  const exportDeclaration = root.find(j.ExportNamedDeclaration, {
    declaration: {
      declarations: [{ id: { name: exportName } }],
    },
  });

  if (exportDeclaration.size()) {
    exportDeclaration.forEach((path) => {
      const declaration = path.value.declaration;
      if (declaration && declaration.type === 'VariableDeclaration') {
        const declarator = declaration.declarations[0];
        if (
          declarator.type === 'VariableDeclarator' &&
          declarator.init &&
          declarator.init.type === 'ObjectExpression'
        ) {
          mergeProperties(
            declarator.init.properties as Property[],
            createDocsSourceState(j)
          );
        }
      }
    });
  } else {
    const newExport = j.exportNamedDeclaration(
      j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier(exportName),
          createDocsSourceState(j)
        ),
      ])
    );

    const programNode = root.find(j.Program).nodes()[0];
    programNode.body.push(newExport);
  }

  return root.toSource();
}

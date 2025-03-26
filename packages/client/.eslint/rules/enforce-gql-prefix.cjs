const path = require('node:path');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEntityFromPath(filePath) {
  const segments = filePath.split(path.sep);
  const modulesIndex = segments.lastIndexOf('modules');
  if (modulesIndex === -1 || modulesIndex + 1 >= segments.length) return null;
  return capitalize(segments[modulesIndex + 1]);
}

const rule = {
  create(context) {
    return {
      OperationDefinition(node) {
        const filename =
          typeof context.getFilename === 'function'
            ? context.getFilename()
            : '';

        if (
          !filename ||
          (!filename.endsWith('.gql') && !filename.endsWith('.graphql'))
        ) {
          return;
        }

        const entity = getEntityFromPath(filename);
        if (!entity) return;

        const expectedPrefix = `${entity}_`;
        const opName = node.name?.value;
        if (!opName) return;

        if (!opName.startsWith(expectedPrefix)) {
          context.report({
            data: {
              entity,
              expectedPrefix,
              opName,
            },
            messageId: 'incorrectPrefix',
            node: node.name,
          });
        }
      },
    };
  },

  meta: {
    docs: {
      category: 'Operations',
      description:
        'Ensure GraphQL operation name starts with entity prefix based on folder under "modules"',
      recommended: false,
    },
    messages: {
      incorrectPrefix:
        'Operation name "{{opName}}" should be prefixed with "{{expectedPrefix}}" based on "modules/{{entity}}" path',
    },
    schema: [],
    type: 'problem',
  },
};

module.exports = rule;

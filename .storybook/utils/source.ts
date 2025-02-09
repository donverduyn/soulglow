import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { StoryContext } from '@storybook/react';

export const unwrapAndFixMemoJSX = (
  code: string,
  storyContext: StoryContext
) => {
  try {
    const ast = parse(code, {
      plugins: ['jsx'],
      sourceType: 'module',
    });

    let extractedJSX = code;

    traverse(ast, {
      JSXElement(path) {
        extractedJSX = path.node.children
          .map((child) => code.slice(child.start!, child.end!))
          .join('')
          .trim();
        path.stop();
      },
    });

    const componentName =
      storyContext.component?.displayName ||
      storyContext.component?.name ||
      'Component';

    extractedJSX = extractedJSX.replace(/^<React\.Memo/, `<${componentName}`);
    return extractedJSX || code;
  } catch (error) {
    console.error('Error parsing JSX:', error);
    return code;
  }
};

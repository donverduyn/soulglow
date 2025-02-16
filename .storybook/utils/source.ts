import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { StoryContext } from '@storybook/react';
import babel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import { format } from 'prettier/standalone';

/**
 * Unwraps JSX from React.Memo and replaces [object Object] with "[object Object]"
 * @param {string} code - The JSX code to process.
 * @param {object} storyContext - The story context containing component info.
 * @returns {string} - The modified JSX code.
 */
export const unwrapAndFixMemoJSX = async (
  code: string,
  storyContext: StoryContext
) => {
  try {
    if (!/<[A-Z][a-zA-Z0-9.]*/.test(code)) {
      return code;
    }

    if (code.includes('decorators:') || code.includes('play:')) {
      return code;
    }

    const fixedCode = code.replace(/\[object Object\]/g, '"[object Object]"');
    const ast = parse(fixedCode, {
      plugins: ['jsx'],
      sourceType: 'module',
    });

    let extractedJSX = '';
    let foundJSX = false;

    traverse(ast, {
      JSXElement(path) {
        if (!foundJSX) {
          extractedJSX = path.node.children
            .map((child) => generate(child).code)
            .join('')
            .trim();

          foundJSX = true;
          path.stop();
        }
      },
    });

    const componentName =
      storyContext.component?.displayName ||
      storyContext.component?.name ||
      'Component';

    if (!extractedJSX) {
      return fixedCode;
    }

    extractedJSX = extractedJSX.replace(/^<React\.Memo/, `<${componentName}`)
    const formattedJSX = await format(extractedJSX, {
      jsxSingleQuote: true,
      parser: 'babel',
      plugins: [babel, prettierPluginEstree],
      printWidth: 80,
      singleQuote: true,
      trailingComma: 'all',
    });

    return formattedJSX;
  } catch (error) {
    return code;
  }
};

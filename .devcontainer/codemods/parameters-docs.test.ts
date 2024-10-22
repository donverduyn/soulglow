import jscodeshift, { API } from 'jscodeshift';
import { format } from 'prettier';
import transformer from './parameters-docs';

function formatCode(code: string) {
  return format(code, { parser: 'typescript' });
}

const jscodeshiftAPI: API = {
  j: jscodeshift,
  jscodeshift,
  report: () => {},
  stats: () => {},
};

describe('jscodeshift transformer', () => {
  it('should append parameters if not present', async () => {
    const inputCode = await formatCode(`
      const someVar = 'value';
    `);

    const expectedOutput = await formatCode(`
      const someVar = "value";
      
      export const parameters = { 
        docs: {
          source: {
            state: "open"
          } 
        } 
      };`);

    const result = transformer(
      { path: 'test-file.js', source: inputCode },
      jscodeshiftAPI
    );
    const formatted = await formatCode(result);
    expect(formatted).toBe(expectedOutput);
  });

  it('should merge parameters if already present', async () => {
    const inputCode = await formatCode(`
      export const parameters = { 
        someProp: true 
      };
    `);

    const expectedOutput = await formatCode(`
      export const parameters = {
        someProp: true,
        
        docs: {
          source: {
            state: "open"
          }
        }
      };`);

    const result = await formatCode(
      transformer({ path: 'test-file.js', source: inputCode }, jscodeshiftAPI)
    );
    expect(result).toBe(expectedOutput);
  });

  it('should not overwrite existing docs property in parameters', async () => {
    const inputCode = await formatCode(`
      export const parameters = {
        docs: {
          existingProp: "value"
        }
      };
    `);

    const expectedOutput = await formatCode(`
      export const parameters = {
        docs: {
          existingProp: "value",
  
          source: {
            state: "open"
          }
        }
      };
    `);

    const result = await formatCode(
      transformer({ path: 'test-file.js', source: inputCode }, jscodeshiftAPI)
    );
    expect(result).toBe(expectedOutput);
  });
});

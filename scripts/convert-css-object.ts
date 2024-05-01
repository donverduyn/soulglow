function cssToString(
  cssObject: Record<string, unknown>,
  indent: string = ''
): string {
  let cssString = '';
  for (const key in cssObject) {
    const value = cssObject[key];
    if (typeof value === 'object') {
      // Handle nested CSS object (e.g., for pseudo-classes or media queries)
      cssString += `${indent}${key} {\n${cssToString(value as Record<string, unknown>, indent + '  ')}${indent}}\n`;
    } else {
      // Handle simple property-value pair
      cssString += `${indent}${key}: ${String(value)};\n`;
    }
  }
  return cssString;
}

// Convert CSS object to string
const result = cssToString({ color: '#52af77' });
console.log(result);

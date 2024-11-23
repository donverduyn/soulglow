import { PluginCreator } from 'postcss';

interface Options {
  placeholder?: string;
  replacement?: string;
}

const defaultOptions = {
  placeholder: '{{prefix}}',
  replacement: '',
} satisfies Options;

const postcssClassWildcardPrefix: PluginCreator<Options> = (
  opts: Options = defaultOptions
) => {
  const options = { ...defaultOptions, ...opts };

  return {
    Rule(rule) {
      rule.selectors = rule.selectors.map((selector) =>
        selector.replace(
          new RegExp(options.placeholder, 'g'),
          options.replacement
        )
      );
    },
    postcssPlugin: 'postcss-class-wildcard-prefix',
  };
};

postcssClassWildcardPrefix.postcss = true;
export default postcssClassWildcardPrefix;

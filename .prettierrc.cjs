module.exports = {
  printWidth: 80,
  tabWidth: 2,
  trailingComma: 'all',
  singleQuote: true,
  semi: true,
  endOfLine: 'auto',
  importOrder: [
    '^@nestjs/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^\\.\\./',
    '^\\./',
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrderParserPlugins: [
    'typescript',
    'classProperties',
    'decorators-legacy',
  ],
};

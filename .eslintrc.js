module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  ignorePatterns: [
    "**/dist/**",
    "*.js",
  ],
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
};

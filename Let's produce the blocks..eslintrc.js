module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    // Allow console.log in development, but warn in production
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Enforce consistent return
    'consistent-return': 'error',
    // Prefer const over let when possible
    'prefer-const': 'error',
    // No unused variables (except those starting with _)
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Enforce explicit return types on functions (optional, but good practice)
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Allow any type (can be tightened later)
    '@typescript-eslint/no-explicit-any': 'off',
    // Prettier integration
    'prettier/prettier': 'error',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};

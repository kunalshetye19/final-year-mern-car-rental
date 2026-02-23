import js from '@eslint/js'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { React: 'readonly' },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react: await import('eslint-plugin-react').then(m => m.default),
      'react-hooks': await import('eslint-plugin-react-hooks').then(m => m.default),
    },
    rules: {
      ...js.configs.recommended.rules,
      'react/jsx-no-react-fragment': 'off',
    },
  },
]

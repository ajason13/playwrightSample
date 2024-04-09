import playwright from 'eslint-plugin-playwright'

export default [
  {
    ...playwright.configs['flat/playwright'],
    files: ['tests/**'],
  },
  {
    files: ['tests/**'],
    rules: {
      // Customize Playwright rules
      // ...
    },
  },
]
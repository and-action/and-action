// @ts-check
import eslint from '@eslint/js';
import rxjs from '@smarttools/eslint-plugin-rxjs';
import angular from 'angular-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import cypress from 'eslint-plugin-cypress';
import pluginImport from 'eslint-plugin-import';
import jsDoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
      rxjs.configs.recommended,
      jsDoc.configs['flat/recommended'],
      pluginImport.flatConfigs.recommended,
      eslintConfigPrettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'ana',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'ana',
          style: 'camelCase',
        },
      ],
      '@typescript-eslint/consistent-indexed-object-style': [
        'error',
        'index-signature',
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'off',
        {
          accessibility: 'explicit',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/quotes': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowTernary: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
      'arrow-parens': ['off', 'always'],
      'import/order': 'off',
      'max-len': 'off',
      'no-shadow': 'off',
      'jsdoc/require-jsdoc': 'off',
      '@smarttools/rxjs/no-unsafe-takeuntil': [
        'error',
        {
          allow: ['repeat'],
        },
      ],
    },
  },
  {
    files: ['src/**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['cypress/**/*.ts'],
    extends: [cypress.configs.recommended],
    rules: {
      'cypress/no-chained-get': 'error',
      'cypress/no-debug': 'error',
      'cypress/no-force': 'error',
      'cypress/no-pause': 'error',
      'cypress/no-xpath': 'error',
    },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
  },
);

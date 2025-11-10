import { defineConfig } from 'cypress';
import path from 'node:path';

export default defineConfig({
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
      webpackConfig: {
        resolve: {
          alias: {
            // Workaround to make zoneless app works with Cypress
            'zone.js': path.resolve(__dirname, 'cypress/support/zone-stubs'),
          },
        },
      },
    },
    specPattern: '**/*.cy.ts',
  },
});

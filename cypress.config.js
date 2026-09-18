module.exports = {
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: 'https://admisions.geekqa.net',
    specPattern: 'tests/functional/**/*.cy.js',
    supportFile: 'tests/functional/support/e2e.js',
    setupNodeEvents(on, config) {
      return config;
    },
  },
};
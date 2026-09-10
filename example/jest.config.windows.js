const config = {
  // RNW transforms its component mocks lazily on the first render.
  testTimeout: 30000,
};

module.exports = require('@rnx-kit/jest-preset')('windows', config);

const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'cypress'),
      '@support': path.resolve(__dirname, 'cypress/common/support'),
      '@featureCommand': path.resolve(__dirname, 'cypress/common/support/featureCommand'),
      '@common': path.resolve(__dirname, 'cypress/common'),
    },
    extensions: ['.js', '.json'],
  },
};

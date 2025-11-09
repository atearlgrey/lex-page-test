const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'cypress'),
      '@support': path.resolve(__dirname, 'cypress/support'),
      '@featureCommand': path.resolve(__dirname, 'cypress/support/featureCommand'),
    },
    extensions: ['.js', '.json'],
  },
};

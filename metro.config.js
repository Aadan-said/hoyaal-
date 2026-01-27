const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add Node.js polyfills
config.resolver.alias = {
  ...config.resolver.alias,
  'stream': require.resolve('readable-stream'),
  'crypto': require.resolve('react-native-crypto'),
  'buffer': require.resolve('@craftzdog/react-native-buffer'),
  'util': require.resolve('react-native-util'),
  'assert': require.resolve('assert'),
  'ws': require.resolve('./mocks/ws.js'),
  'http': require.resolve('./mocks/dummy.js'),
  'https': require.resolve('./mocks/dummy.js'),
  'net': require.resolve('./mocks/dummy.js'),
  'tls': require.resolve('./mocks/dummy.js'),
  'dgram': require.resolve('./mocks/dummy.js'),
  'zlib': require.resolve('./mocks/dummy.js'),
  'events': require.resolve('events'),
};

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'stream': require.resolve('readable-stream'),
  'crypto': require.resolve('react-native-crypto'),
  'buffer': require.resolve('@craftzdog/react-native-buffer'),
  'util': require.resolve('react-native-util'),
  'assert': require.resolve('assert'),
  'ws': require.resolve('./mocks/ws.js'),
  'http': require.resolve('./mocks/dummy.js'),
  'https': require.resolve('./mocks/dummy.js'),
  'net': require.resolve('./mocks/dummy.js'),
  'tls': require.resolve('./mocks/dummy.js'),
  'dgram': require.resolve('./mocks/dummy.js'),
  'zlib': require.resolve('./mocks/dummy.js'),
  'events': require.resolve('events'),
};

// Handle Node.js core modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;

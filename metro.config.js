const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add Firebase module resolution
config.resolver.alias = {
  ...config.resolver.alias,
};

// Ensure Firebase modules are resolved correctly
config.resolver.platforms = ['native', 'web', 'default'];
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;


module.exports = config;
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolution: Set to false to avoid bundling loops in some environments
config.resolver.unstable_enablePackageExports = false;

// Avoid watching irrelevant directories that might trigger rebuild loops
config.resolver.blockList = [
  /afsc_styling_platform\/.*/,
  /\.git\/.*/,
  /\.expo\/.*/,
];

// Priority for react-native fields to avoid web-specific resolution issues that cause loops
config.resolver.resolverMainFields.unshift('react-native');

// Since package exports are disabled, manually redirect axios to its browser-safe
// build so it doesn't pull in Node.js built-ins like 'crypto', 'http', etc.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'axios') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/axios/dist/browser/axios.cjs'),
      type: 'sourceFile',
    };
  }
  // Fall through to default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add asset extensions
config.resolver.assetExts.push('cjs');

module.exports = withNativeWind(config, { 
  input: './global.css',
  // Add for NativeWind v4
  projectRoot: __dirname 
});
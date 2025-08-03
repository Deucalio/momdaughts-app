const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Web-specific resolver configuration
if (process.env.EXPO_PLATFORM === "web") {
  config.resolver.platforms = ["web", "native", "ios", "android"];
  config.resolver.alias = {
    ...config.resolver.alias,
    "nanoid/non-secure": "nanoid",
  };
}

module.exports = config;

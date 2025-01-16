const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Adding 'cjs' to the source extensions
config.resolver.sourceExts.push('cjs');

// Applying NativeWind config
module.exports = withNativeWind(config, {
    input: "./global.css"
});

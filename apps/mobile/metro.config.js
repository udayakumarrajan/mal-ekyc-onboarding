const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude test files and axios from bundle
config.resolver = {
  ...config.resolver,
  blacklistRE: /(__tests__|\.test\.(ts|tsx|js|jsx))$/,
  sourceExts: [...(config.resolver?.sourceExts || []), 'ts', 'tsx'],
};

module.exports = config;

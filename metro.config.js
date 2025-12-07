/* eslint-env node */
// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const projectRoot = __dirname;
const appRoot = path.resolve(projectRoot, 'app'); // adjust if your app folder is named differently
const config = getDefaultConfig(projectRoot);

// keep your transform options (inlineRequires)
config.transformer.getTransformOptions = async () => ({
  transform: {
    inlineRequires: true,
  },
});

// axios/apisauce temporary fix
config.resolver.unstable_conditionNames = ['require', 'default', 'browser'];

// support .cjs
config.resolver.sourceExts.push('cjs');

// your custom extensions
config.resolver.sourceExts.push('sql');
config.resolver.assetExts.push('wasm');

// === Add this section to make `@/...` resolve to ./app for Metro ===
// Map the module name "@" to the app folder
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@': appRoot,
  '@assets': path.resolve(projectRoot, 'assets'), // optional: match your tsconfig paths
};

// Make metro watch the app folder directly (helps monorepo / linked folders)
config.watchFolders = config.watchFolders || [];
if (!config.watchFolders.includes(appRoot)) {
  config.watchFolders.push(appRoot);
}

// If you want imports like `import { App } from "@/app"` to work as `@ -> ./app`
// ensure you have an `index.ts`/`index.tsx` in app/ that exports App:
//   export { default as App } from './App';
// or update your imports to point to correct file.
module.exports = config;

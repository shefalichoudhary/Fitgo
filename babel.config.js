/** @type {import('@babel/core').TransformOptions} */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Module resolver MUST be present so Metro/EAS know how to resolve @/ imports
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./app",
            "@assets": "./assets"
          }
        }
      ],
      // Keep your inline-import for .sql files
      ["inline-import", { extensions: [".sql"] }]
    ]
  };
};

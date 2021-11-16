const WindiCSSCracoPlugin = require('windicss-craco-plugin');

module.exports = {
  plugins: [
    {
      plugin: WindiCSSCracoPlugin,
      options: {
        scan: {
          dirs: ["./"],
          exclude: ["node_modules", ".git", "public/index.html"]
        },
      },
    },
  ],
}

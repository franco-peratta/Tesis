const CracoLessPlugin = require("craco-less")

const colors = {
  "@body-background": "#fff",
  "@primary-color": "#1CB5E2",
  "@btn-primary-color": "#fff",
  "@btn-primary-bg": "#002352"
}

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: colors,
            javascriptEnabled: true
          }
        }
      }
    }
  ]
}

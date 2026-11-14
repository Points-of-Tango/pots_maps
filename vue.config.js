module.exports = {
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'UK Tango Map'
    }
  },
  pwa: {
    name: 'UK Tango Map',
    themeColor: '#1B82C5',
    msTileColor: '#1B82C5',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'default',
    manifestOptions: {
      name: 'UK Tango Map',
      short_name: 'UK Tango Map',
      theme_color: '#1B82C5',
      background_color: '#ffffff'
    },
    iconPaths: {
      faviconSVG: null,
      maskIcon: null
    }
  }
}

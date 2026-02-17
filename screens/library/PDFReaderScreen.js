import React, { forwardRef } from 'react'
import { WebView } from 'react-native-webview'

const PDFWebView = forwardRef(({ html, onMessage }, ref) => {
  return (
    <WebView
      ref={ref}
      source={{ html }}
      onMessage={onMessage}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      mixedContentMode="always"
    />
  )
})

export default PDFWebView

export default function usePdfBridge(webViewRef) {

  const inject = (code) => {
    webViewRef.current?.injectJavaScript(`${code}; true;`)
  }

  const goToPage = (page) => {
    inject(`goToPage(${page})`)
  }

  const search = (query) => {
    const safe = query.replace(/'/g, "\\'")
    inject(`searchText('${safe}')`)
  }

  const clearSearch = () => {
    inject(`clearSearch()`)
  }

  const toggleDrawing = (value) => {
    inject(`setDrawingMode(${value})`)
  }

  const setHighlightColor = (color) => {
    inject(`setHighlightColor('${color}')`)
  }

  return {
    goToPage,
    search,
    clearSearch,
    toggleDrawing,
    setHighlightColor,
  }
}

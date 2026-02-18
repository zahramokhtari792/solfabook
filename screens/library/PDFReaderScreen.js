import React, { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'

import PDFWebView from '../../components/PDFWebView'  
import usePdfLoader from '../../hooks/usePdfLoader'  
import usePdfStorage from '../../hooks/usePdfStorage'  
import usePdfBridge from '../../hooks/usePdfBridge'  
import { sendPdfInChunks } from '../../services/pdfChunkSender' 
import { getPdfHtml } from '../../webview/pdfTemplate'  

const PDFReaderScreen = ({ route }) => {

  const { pdfUrl, fileId, userId } = route.params

  const webViewRef = useRef(null)

  const { base64, loading, download } = usePdfLoader(pdfUrl)
  const storage = usePdfStorage(userId, fileId)
  const bridge = usePdfBridge(webViewRef)

  const [highlights, setHighlights] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    download()
  }, [])

  useEffect(() => {
    if (base64) {
      sendPdfInChunks(webViewRef, base64)
    }
  }, [base64])

  useEffect(() => {
    const loadData = async () => {
      const h = await storage.loadHighlights()
      const b = await storage.loadBookmarks()
      if (h) setHighlights(h)
      if (b) setBookmarks(b)
    }
    loadData()
  }, [fileId])

  const onMessage = async (event) => {
    const data = JSON.parse(event.nativeEvent.data)

    switch (data.type) {

      case 'PDF_LOADED':
        setTotalPages(data.pageCount)
        break

      case 'PAGE_CHANGED':
        setCurrentPage(data.currentPage)
        break

      case 'SAVE_HIGHLIGHTS':
        setHighlights(data.highlights)
        await storage.saveHighlights(data.highlights)
        break
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" />
  }

  return (
    <View style={{ flex: 1 }}>
      <PDFWebView
        ref={webViewRef}
        html={getPdfHtml()}
        onMessage={onMessage}
      />
    </View>
  )
}

export default PDFReaderScreen

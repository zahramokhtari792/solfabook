import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { WebView } from 'react-native-webview'
import usePdfBridge from '../../hooks/usePdfBridge'
import usePdfStorage from './../../hooks/usePdfStorage';

const PDFWebView = forwardRef(({ html, onMessage }, ref) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const [bookmarks, setBookmarks] = useState([])
  const [highlights, setHighlights] = useState([])

  const [showPageModal, setShowPageModal] = useState(false)
  const [showBookmarkModal, setShowBookmarkModal] = useState(false)
  const [showHighlightModal, setShowHighlightModal] = useState(false)
  const [showColorModal, setShowColorModal] = useState(false)

  const [pageInput, setPageInput] = useState('')
  const [highlightColor, setHighlightColor] = useState('#ffeb3b')

  const webViewRef = useRef(null)

  const bridge = usePdfBridge(webViewRef)
  const storage = usePdfStorage(userId, fileId)


  useEffect(() => {
    const loadData = async () => {
      const savedHighlights = await storage.loadHighlights()
      const savedBookmarks = await storage.loadBookmarks()

      if (savedHighlights) setHighlights(savedHighlights)
      if (savedBookmarks) setBookmarks(savedBookmarks)
    }

    loadData()
  }, [fileId])
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

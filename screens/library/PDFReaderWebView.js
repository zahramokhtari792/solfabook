import { View, ActivityIndicator, TouchableOpacity, Text, Keyboard } from 'react-native'
import React, { useRef, useState, useEffect, useMemo } from 'react'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import makeStyles from '../../styles/NewStyles'
import { themeColor0, themeColor5 } from '../../theme/Color'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import { dlUrl, uri } from '../../services/URL'
import { useSelector } from 'react-redux'
import { handleError } from '../../helpers/Common'
import * as FileSystem from 'expo-file-system'
import { useTranslation } from 'react-i18next'
import PdfReaderHeader from './pdfReaderWebView/components/PdfReaderHeader';
import PdfSearchBar from './pdfReaderWebView/components/PdfSearchBar';
import PdfBottomNav from './pdfReaderWebView/components/PdfBottomNav';
import PdfModals from './pdfReaderWebView/components/PdfModals';
import { styles } from './pdfReaderWebView/styles';

// Chunk size for base64 transfer (500KB per chunk to avoid memory issues)
const CHUNK_SIZE = 500 * 1024;

/**
 * PDFReaderWebView - Test component for PDF.js-based PDF viewing with highlighting
 * 
 * Features:
 * - PDF rendering via Mozilla's PDF.js
 * - Text selection support
 * - Highlight selected text (tap "Highlight" button after selecting)
 * - Highlights stored locally in AsyncStorage
 * - Clear all highlights option
 * 
 * Usage:
 * <PDFReaderWebView route={{ params: { pdfUrl: 'https://example.com/file.pdf', id: 'unique-id' } }} />
 */

const PDFReaderWebView = ({ route, downloadedPdf, downloadPdf, downloadingPdf }) => {
    const params = route?.params;
    const userToken = useSelector(state => state.auth?.token);
    const [data, setData] = useState()
    const { i18n } = useTranslation();
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
    const NewStyles = useMemo(() => makeStyles(lang), [lang]);
    const fetchFiles = () => {
        axios.post(`${uri}/fetchFiles`, { id: params?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${userToken}` } })
            .then((res) => {
                setData(`${dlUrl}/${res?.data?.file_pdf?.[0]?.file_path}`)
            })
            .catch((err) => {
                handleError(err)
            })
            .finally(() => {
            })
    }

    // Use provided PDF URL
    const pdfUrl = params?.pdfUrl ?? data;
    const preferLocal = params?.preferLocal === true;
    const localUri = params?.localUri ?? null;
    const fileId = params?.id ?? (params?.pdfUrl ? `url_${encodeURIComponent(params.pdfUrl)}` : undefined);

    const webViewRef = useRef(null);
    const webViewReadyRef = useRef(false);
    const didRestorePageRef = useRef(false);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [highlights, setHighlights] = useState([]);
    const [error, setError] = useState(null);
    const [pdfBase64, setPdfBase64] = useState(null);
    const [fetchingPdf, setFetchingPdf] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    // Search state
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResultCount, setSearchResultCount] = useState(0);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

    // Page navigation state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [showPageModal, setShowPageModal] = useState(false);
    const [pageInput, setPageInput] = useState('');
    const [lastOpenedPage, setLastOpenedPage] = useState(null);

    // Bookmarks state
    const [bookmarks, setBookmarks] = useState([]);
    const [showBookmarksModal, setShowBookmarksModal] = useState(false);

    // Drawing state
    const [drawingMode, setDrawingMode] = useState(false);
    const [drawingColor, setDrawingColor] = useState('#ff0000');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [highlighterMode, setHighlighterMode] = useState(false);
    const [drawingOpacity, setDrawingOpacity] = useState(1);
    const drawingColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'];

    // Highlight state
    const [highlightMode, setHighlightMode] = useState(false);
    const [highlightColor, setHighlightColor] = useState('#ffeb3b');
    const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);
    const [showHighlightsModal, setShowHighlightsModal] = useState(false);
    const [textSelected, setTextSelected] = useState(false);
    const highlightColors = ['#ffeb3b', '#a5d6a7', '#90caf9', '#f48fb1', '#ce93d8', '#ffcc80', '#80deea', '#e6ee9c'];

    // Load saved highlights and bookmarks when fileId changes
    useEffect(() => {
        if (!fileId) return;
        loadHighlights();
        loadBookmarks();
        loadLastOpenedPage();
        didRestorePageRef.current = false;
    }, [fileId]);

    // Fetch file URL when id/token available
    useEffect(() => {
        if (!params?.id || !userToken) return;
        fetchFiles();
    }, [params?.id, userToken]);

    // Fetch PDF as base64 to bypass CORS
    useEffect(() => {
        const fetchPdfAsBase64 = async () => {
            try {
                setFetchingPdf(true);
                setError(null);

                const tryReadLocal = async () => {
                    if (!localUri) return false;
                    const info = await FileSystem.getInfoAsync(localUri);
                    if (!info.exists) return false;
                    const base64 = await FileSystem.readAsStringAsync(localUri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    setPdfBase64(base64);
                    return true;
                };

                // Always prefer local when available (especially for offline)
                const localOk = await tryReadLocal();
                if (localOk) return;

                // Use expo-file-system to download and read as base64
                const fileUri = FileSystem.cacheDirectory + 'temp_pdf_' + Date.now() + '.pdf';
                const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri);

                if (downloadResult.status === 200) {
                    const base64 = await FileSystem.readAsStringAsync(fileUri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    setPdfBase64(base64);

                    // Clean up temp file
                    await FileSystem.deleteAsync(fileUri, { idempotent: true });
                } else {
                    throw new Error('دانلود PDF ناموفق بود');
                }
            } catch (err) {
                console.log('Error fetching PDF:', err);
                // Fallback to local if download failed (offline)
                try {
                    const ok = await (async () => {
                        if (!localUri) return false;
                        const info = await FileSystem.getInfoAsync(localUri);
                        if (!info.exists) return false;
                        const base64 = await FileSystem.readAsStringAsync(localUri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        setPdfBase64(base64);
                        return true;
                    })();
                    if (!ok) {
                        setError('خطا در دانلود PDF: ' + (err.message || 'نامشخص'));
                    }
                } catch (e) {
                    setError('خطا در دانلود PDF: ' + (err.message || 'نامشخص'));
                }
            } finally {
                setFetchingPdf(false);
            }
        };

        if (pdfUrl || localUri) {
            fetchPdfAsBase64();
        }
    }, [pdfUrl, retryCount, preferLocal, localUri]);

    const loadHighlights = async () => {
        try {
            const saved = await AsyncStorage.getItem(`pdf_highlights_${fileId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setHighlights(parsed);
            }
        } catch (err) {
            console.log('Error loading highlights:', err);
        }
    };

    const saveHighlights = async (newHighlights) => {
        try {
            await AsyncStorage.setItem(`pdf_highlights_${fileId}`, JSON.stringify(newHighlights));
            setHighlights(newHighlights);
        } catch (err) {
            console.log('Error saving highlights:', err);
        }
    };

    // Bookmark functions
    const loadBookmarks = async () => {
        try {
            const saved = await AsyncStorage.getItem(`pdf_bookmarks_${fileId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setBookmarks(parsed);
            }
        } catch (err) {
            console.log('Error loading bookmarks:', err);
        }
    };

    const saveBookmarks = async (newBookmarks) => {
        try {
            await AsyncStorage.setItem(`pdf_bookmarks_${fileId}`, JSON.stringify(newBookmarks));
            setBookmarks(newBookmarks);
        } catch (err) {
            console.log('Error saving bookmarks:', err);
        }
    };

    const loadLastOpenedPage = async () => {
        try {
            const saved = await AsyncStorage.getItem(`pdf_last_page_${fileId}`);
            if (saved) {
                const page = parseInt(saved, 10);
                if (!Number.isNaN(page)) {
                    setLastOpenedPage(page);
                }
            } else {
                setLastOpenedPage(null);
            }
        } catch (err) {
            console.log('Error loading last page:', err);
        }
    };

    const saveLastOpenedPage = async (page) => {
        if (!fileId) return;
        try {
            await AsyncStorage.setItem(`pdf_last_page_${fileId}`, String(page));
        } catch (err) {
            console.log('Error saving last page:', err);
        }
    };

    const toggleBookmark = (pageNum = currentPage) => {
        const page = parseInt(pageNum);
        const isBookmarked = bookmarks.includes(page);
        let newBookmarks;
        if (isBookmarked) {
            newBookmarks = bookmarks.filter(p => p !== page);
        } else {
            newBookmarks = [...bookmarks, page].sort((a, b) => a - b);
        }
        saveBookmarks(newBookmarks);
    };

    const isCurrentPageBookmarked = () => {
        return bookmarks.includes(currentPage);
    };

    const goToBookmark = (pageNum) => {
        handleGoToPage(pageNum);
        setShowBookmarksModal(false);
    };

    // Drawing functions
    const loadDrawings = async () => {
        try {
            const saved = await AsyncStorage.getItem(`pdf_drawings_${fileId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Will inject into WebView after it's ready
                return parsed;
            }
        } catch (err) {
            console.log('Error loading drawings:', err);
        }
        return {};
    };

    const saveDrawings = async (drawings) => {
        try {
            await AsyncStorage.setItem(`pdf_drawings_${fileId}`, JSON.stringify(drawings));
        } catch (err) {
            console.log('Error saving drawings:', err);
        }
    };

    const toggleDrawingMode = () => {
        const newMode = !drawingMode;
        setDrawingMode(newMode);
        webViewRef.current?.injectJavaScript(`setDrawingMode(${newMode}); true;`);
    };

    const changeDrawingColor = (color) => {
        setDrawingColor(color);
        setShowColorPicker(false);
        webViewRef.current?.injectJavaScript(`setDrawingColor('${color}'); true;`);
    };

    const undoDrawing = () => {
        webViewRef.current?.injectJavaScript('undoDrawing(); true;');
    };

    const clearAllDrawings = () => {
        webViewRef.current?.injectJavaScript('clearAllDrawings(); true;');
    };

    const changeStrokeWidth = (width) => {
        setStrokeWidth(width);
        webViewRef.current?.injectJavaScript(`setLineWidth(${width}); true;`);
    };

    const toggleHighlighterMode = () => {
        const newMode = !highlighterMode;
        setHighlighterMode(newMode);
        webViewRef.current?.injectJavaScript(`setHighlighterMode(${newMode}); true;`);
    };

    const changeDrawingOpacity = (opacity) => {
        setDrawingOpacity(opacity);
        webViewRef.current?.injectJavaScript(`setDrawingOpacity(${opacity}); true;`);
    };

    // Highlight functions
    const toggleHighlightMode = () => {
        const newMode = !highlightMode;
        setHighlightMode(newMode);
        // Disable drawing mode when highlight mode is enabled
        if (newMode && drawingMode) {
            setDrawingMode(false);
            webViewRef.current?.injectJavaScript(`setDrawingMode(false); true;`);
        }
        webViewRef.current?.injectJavaScript(`setHighlightMode(${newMode}); true;`);
    };

    const changeHighlightColor = (color) => {
        setHighlightColor(color);
        setShowHighlightColorPicker(false);
        webViewRef.current?.injectJavaScript(`setHighlightColor('${color}'); true;`);
    };

    const removeHighlight = (highlightIndex) => {
        const newHighlights = highlights.filter((_, index) => index !== highlightIndex);
        setHighlights(newHighlights);
        saveHighlights(newHighlights);
        webViewRef.current?.injectJavaScript(`setHighlights(${JSON.stringify(newHighlights)}); true;`);
    };

    const goToHighlight = (highlight) => {
        if (highlight.page && highlight.page !== currentPage) {
            webViewRef.current?.injectJavaScript(`goToPage(${highlight.page}); true;`);
        }
        setShowHighlightsModal(false);
    };

    const applyHighlight = () => {
        webViewRef.current?.injectJavaScript('highlightSelection(); true;');
    };

    // Send PDF data in chunks to avoid memory crash with large files
    const sendPdfInChunks = async (base64Data) => {
        const totalChunks = Math.ceil(base64Data.length / CHUNK_SIZE);

        console.log(`Sending PDF in ${totalChunks} chunks (total size: ${(base64Data.length / 1024 / 1024).toFixed(2)}MB)`);

        // Send start signal with total chunks info
        webViewRef.current?.injectJavaScript(`
            window.pdfChunks = [];
            window.totalChunks = ${totalChunks};
            window.receivedChunks = 0;
            true;
        `);

        // Send chunks with small delays to prevent overwhelming
        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, base64Data.length);
            const chunk = base64Data.substring(start, end);

            // Use setTimeout to add small delay between chunks
            await new Promise(resolve => setTimeout(resolve, 50));

            // Escape the chunk for safe JavaScript injection
            const escapedChunk = chunk.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

            webViewRef.current?.injectJavaScript(`
                window.pdfChunks.push('${escapedChunk}');
                window.receivedChunks++;
                if (window.receivedChunks === window.totalChunks) {
                    const fullBase64 = window.pdfChunks.join('');
                    window.pdfChunks = null; // Free memory
                    window.loadPDFFromBase64(fullBase64);
                }
                true;
            `);
        }
    };

    // HTML content that loads PDF.js and renders the PDF
    const htmlContent = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=4.0, user-scalable=yes">
    <meta name="format-detection" content="telephone=no">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }
        html, body {
            -webkit-user-select: text;
            user-select: text;
            -webkit-touch-callout: default;
        }
        body {
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
            overflow: hidden; /* No scrolling - single page mode */
            height: 100vh;
        }
        #pdf-container {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }
        .page-wrapper {
            position: relative;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            max-width: 100%;
            max-height: 100%;
            overflow: auto;
            opacity: 1;
            transition: opacity 0.15s ease-in-out;
        }
        .page-wrapper.loading {
            opacity: 0.5;
        }
        #page-loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 14px;
            z-index: 1000;
            display: none;
        }
        #page-loading.visible {
            display: block;
        }
        canvas {
            display: block;
            margin: 0 auto;
        }
        .textLayer {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            line-height: 1.0;
            -webkit-user-select: text;
            user-select: text;
            z-index: 2;
        }
        .highlight-layer {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            pointer-events: none;
        }
        .highlight-rect {
            position: absolute;
            border-radius: 2px;
        }
        .textLayer > span {
            color: transparent;
            position: absolute;
            white-space: pre;
            cursor: text;
            transform-origin: 0% 0%;
            -webkit-user-select: text;
            user-select: text;
            pointer-events: auto;
            padding: 0;
        }
        .textLayer > span::selection {
            background: rgba(150, 29, 90, 0.5);
            color: transparent;
        }
        .textLayer > span::-moz-selection {
            background: rgba(150, 29, 90, 0.5);
            color: transparent;
        }
        .highlight {
            color: transparent !important;
            border-radius: 2px;
        }
        .highlight-mode-active .textLayer > span {
            cursor: pointer !important;
        }
        .highlight-mode-indicator {
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #961d5a;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1001;
            display: none;
        }
        .highlight-mode-indicator.visible {
            display: block;
        }
        .search-highlight-layer {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 3;
            pointer-events: none;
        }
        .search-match-rect {
            position: absolute;
            background-color: rgba(255, 152, 0, 0.5);
            border-radius: 2px;
        }
        .search-match-rect.current {
            background-color: rgba(255, 87, 34, 0.8);
            box-shadow: 0 0 4px rgba(255, 87, 34, 0.8);
        }
        .drawing-canvas {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 10;
            touch-action: none;
            pointer-events: none;
        }
        .drawing-canvas.active {
            pointer-events: auto;
            cursor: crosshair;
        }
        .page-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #999;
            font-size: 16px;
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        }
        .pdf-canvas {
            display: block;
            margin: 0 auto;
        }
        .highlight-toolbar {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(150, 29, 90, 0.95);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: none;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            font-size: 14px;
        }
        .highlight-toolbar.visible {
            display: block;
        }
        #loading {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 16px;
            color: #961d5a;
        }
    </style>
</head>
<body>
    <div id="loading">در حال بارگذاری...</div>
    <div id="page-loading">در حال بارگذاری صفحه...</div>
    <div id="error-msg" style="display:none; color:red; text-align:center; padding:20px;"></div>
    <div id="highlight-mode-indicator" class="highlight-mode-indicator">حالت هایلایت فعال - روی متن کلیک کنید</div>
    <div id="pdf-container"></div>

    <script>
        // Error handler for script loading
        window.onerror = function(msg, url, line) {
            document.getElementById('error-msg').style.display = 'block';
            document.getElementById('error-msg').textContent = 'Error: ' + msg;
            document.getElementById('loading').style.display = 'none';
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PDF_ERROR',
                    error: msg
                }));
            }
            return true;
        };
    </script>
    <script src="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js" crossorigin="anonymous"></script>
    <script>
        // Check if PDF.js loaded
        if (typeof pdfjsLib === 'undefined') {
            document.getElementById('loading').textContent = 'خطا در بارگذاری کتابخانه PDF';
            document.getElementById('error-msg').style.display = 'block';
            document.getElementById('error-msg').textContent = 'PDF.js library failed to load';
            throw new Error('PDF.js not loaded');
        }
        
        // Configure PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

        const pdfUrl = '${pdfUrl}';
        let pdfDoc = null;
        let highlights = [];
        const container = document.getElementById('pdf-container');
        const loadingEl = document.getElementById('loading');
        const highlightModeIndicator = document.getElementById('highlight-mode-indicator');
        let selectedSpans = [];

        function getOffsetWithinSpan(span, container, offset) {
            if (!span.contains(container)) return null;
            let currentOffset = 0;
            const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT, null);
            let node = walker.nextNode();
            while (node) {
                if (node === container) {
                    return currentOffset + offset;
                }
                currentOffset += node.nodeValue.length;
                node = walker.nextNode();
            }
            return null;
        }

        function getTopLevelTextSpans() {
            const layer = document.querySelector('.textLayer');
            if (!layer) return [];
            return Array.from(layer.children).filter(el => el.tagName === 'SPAN');
        }

        function getRangeRects(range) {
            return Array.from(range.getClientRects()).filter(r => r.width > 0 && r.height > 0);
        }

        function spanIntersectsRange(spanRect, rangeRects, minVerticalRatio) {
            const spanHeight = Math.max(1, spanRect.height);
            for (let i = 0; i < rangeRects.length; i++) {
                const r = rangeRects[i];
                const overlapTop = Math.max(spanRect.top, r.top);
                const overlapBottom = Math.min(spanRect.bottom, r.bottom);
                const overlap = Math.max(0, overlapBottom - overlapTop);
                if (overlap / spanHeight >= minVerticalRatio) {
                    // also require some horizontal overlap
                    if (!(spanRect.right <= r.left || spanRect.left >= r.right)) {
                        return true;
                    }
                }
            }
            return false;
        }

        function getRectsRelativeToPage(range, pageWrapper) {
            const wrapperRect = pageWrapper.getBoundingClientRect();
            return Array.from(range.getClientRects())
                .filter(r => r.width > 0 && r.height > 0)
                .map(r => ({
                    x: r.left - wrapperRect.left,
                    y: r.top - wrapperRect.top,
                    width: r.width,
                    height: r.height
                }));
        }

        function drawHighlightRects(rects, color, highlightLayer) {
            rects.forEach(r => {
                const rect = document.createElement('div');
                rect.className = 'highlight-rect';
                rect.style.backgroundColor = hexToRgba(color || highlightColor, 0.4);
                rect.style.left = r.x + 'px';
                rect.style.top = r.y + 'px';
                rect.style.width = r.width + 'px';
                rect.style.height = r.height + 'px';
                highlightLayer.appendChild(rect);
            });
        }

        function rangesIntersect(a, b) {
            if (a.compareBoundaryPoints(Range.END_TO_START, b) <= 0) return false;
            if (a.compareBoundaryPoints(Range.START_TO_END, b) >= 0) return false;
            return true;
        }

        function getIntersectionRange(a, b) {
            if (!rangesIntersect(a, b)) return null;
            const r = document.createRange();
            if (a.compareBoundaryPoints(Range.START_TO_START, b) > 0) {
                r.setStart(a.startContainer, a.startOffset);
            } else {
                r.setStart(b.startContainer, b.startOffset);
            }
            if (a.compareBoundaryPoints(Range.END_TO_END, b) < 0) {
                r.setEnd(a.endContainer, a.endOffset);
            } else {
                r.setEnd(b.endContainer, b.endOffset);
            }
            if (r.collapsed) return null;
            return r;
        }

        function getTextRectsFromSelection(range, textLayer, pageWrapper) {
            const wrapperRect = pageWrapper.getBoundingClientRect();
            const rects = [];
            const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT, null);
            let node = walker.nextNode();
            while (node) {
                const nodeRange = document.createRange();
                nodeRange.selectNodeContents(node);
                const intersection = getIntersectionRange(range, nodeRange);
                if (intersection) {
                    const r = Array.from(intersection.getClientRects())
                        .map(rc => {
                            const left = Math.max(rc.left, wrapperRect.left);
                            const right = Math.min(rc.right, wrapperRect.right);
                            const top = Math.max(rc.top, wrapperRect.top);
                            const bottom = Math.min(rc.bottom, wrapperRect.bottom);
                            const width = right - left;
                            const height = bottom - top;
                            if (width <= 0 || height <= 0) return null;
                            return {
                                x: left - wrapperRect.left,
                                y: top - wrapperRect.top,
                                width,
                                height
                            };
                        })
                        .filter(Boolean);
                    rects.push(...r);
                }
                node = walker.nextNode();
            }
            return rects;
        }


        function getSpanSelectionInfo(span, range) {
            const spanText = span.textContent || '';
            if (!spanText) return null;
            let startOffset = 0;
            let endOffset = spanText.length;

            if (span.contains(range.startContainer)) {
                const start = getOffsetWithinSpan(span, range.startContainer, range.startOffset);
                if (start !== null) startOffset = start;
            }
            if (span.contains(range.endContainer)) {
                const end = getOffsetWithinSpan(span, range.endContainer, range.endOffset);
                if (end !== null) endOffset = end;
            }

            if (endOffset <= startOffset) return null;

            return {
                span,
                startOffset,
                endOffset
            };
        }

        function renderHighlightsForSpan(span, spanHighlights, highlightLayer, pageWrapper) {
            const baseText = span.textContent || '';
            if (!baseText || !spanHighlights || spanHighlights.length === 0) return;
            if (!span.firstChild || !highlightLayer) return;

            const wrapperRect = pageWrapper.getBoundingClientRect();

            spanHighlights.forEach(h => {
                const start = typeof h.startOffset === 'number' ? h.startOffset : 0;
                const end = typeof h.endOffset === 'number' ? h.endOffset : baseText.length;
                const safeStart = Math.max(0, Math.min(start, baseText.length));
                const safeEnd = Math.max(0, Math.min(end, baseText.length));
                if (safeEnd <= safeStart) return;

                const range = document.createRange();
                range.setStart(span.firstChild, safeStart);
                range.setEnd(span.firstChild, safeEnd);

                const rects = Array.from(range.getClientRects()).filter(r => r.width > 0 && r.height > 0);
                rects.forEach(r => {
                    const rect = document.createElement('div');
                    rect.className = 'highlight-rect';
                    rect.style.backgroundColor = hexToRgba(h.color || highlightColor, 0.4);
                    rect.style.left = (r.left - wrapperRect.left) + 'px';
                    rect.style.top = (r.top - wrapperRect.top) + 'px';
                    rect.style.width = r.width + 'px';
                    rect.style.height = r.height + 'px';
                    highlightLayer.appendChild(rect);
                });
            });
        }

        // Highlight mode state
        let isHighlightMode = false;
        let highlightColor = '#ffeb3b';

        // Drawing state
        let isDrawingMode = false;
        let drawingColor = '#ff0000';
        let lineWidth = 3;
        let isHighlighterMode = false;
        let drawingOpacity = 1;

        // Helper function to apply opacity to hex color
        function applyOpacityToColor(hexColor, opacity) {
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
        }

        async function renderTextLayerAccurate(textLayer, textContent, viewport, pageNum, dpr) {
            if (typeof pdfjsLib.renderTextLayer === 'function') {
                await pdfjsLib.renderTextLayer({
                    textContent,
                    container: textLayer,
                    viewport,
                    textDivs: [],
                    enhanceTextSelection: true
                }).promise;
            } else {
                const items = textContent.items || [];
                items.forEach((item, index) => {
                    if (!item.str || item.str.trim() === '') return;
                    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
                    const span = document.createElement('span');
                    span.textContent = item.str;
                    span.dataset.index = index;
                    const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]) / dpr;
                    const left = tx[4] / dpr;
                    const top = tx[5] / dpr;
                    span.style.left = left + 'px';
                    span.style.top = top + 'px';
                    span.style.fontSize = fontSize + 'px';
                    span.style.fontFamily = item.fontName || 'sans-serif';
                    if (item.width) {
                        span.style.width = (item.width * viewport.scale / dpr) + 'px';
                    }
                    span.style.transform = 'scaleX(' + (item.transform[0] < 0 ? -1 : 1) + ')';
                    textLayer.appendChild(span);
                });
            }

            const spans = textLayer.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (!span.dataset.index) span.dataset.index = index;
                span.addEventListener('click', function(e) {
                    if (isHighlightMode) {
                        e.stopPropagation();
                        handleSpanClick(span, pageNum);
                    }
                });
            });
        }
        let drawings = {}; // { pageNum: [{ points: [], color: string }] }
        let currentPath = null;
        let isDrawing = false;

        // SINGLE PAGE MODE - only 1 page rendered at a time
        let currentPageNum = 1;
        let pageViewports = {};
        let isRendering = false; // Prevent concurrent renders
        let pendingPage = null; // Queue next page if user taps rapidly

        // Convert hex color to rgba with opacity
        function hexToRgba(hex, alpha) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return \`rgba(\${r}, \${g}, \${b}, \${alpha})\`;
        }

        // Set highlight mode
        function setHighlightMode(enabled) {
            isHighlightMode = enabled;
            if (enabled) {
                container.classList.add('highlight-mode-active');
                highlightModeIndicator.classList.add('visible');
            } else {
                container.classList.remove('highlight-mode-active');
                highlightModeIndicator.classList.remove('visible');
            }
        }

        // Set highlight color
        function setHighlightColor(color) {
            highlightColor = color;
        }

        // Handle click on text span in highlight mode
        function handleSpanClick(span, pageNum) {
            if (!isHighlightMode) return;

            const spanIndex = parseInt(span.dataset.index);
            const spanText = span.textContent || '';
            const startOffset = 0;
            const endOffset = spanText.length;

            const existingIndex = highlights.findIndex(h =>
                h.page === pageNum &&
                h.spanIndex === spanIndex &&
                h.source === 'span'
            );

            if (existingIndex >= 0) {
                highlights.splice(existingIndex, 1);
            } else {
                if (!span.firstChild) return;
                const pageWrapper = span.closest('.page-wrapper');
                if (!pageWrapper) return;
                const range = document.createRange();
                range.setStart(span.firstChild, startOffset);
                range.setEnd(span.firstChild, endOffset);
                const rects = getRectsRelativeToPage(range, pageWrapper);
                if (!rects.length) return;
                const highlightData = {
                    page: pageNum,
                    text: spanText,
                    spanIndex: spanIndex,
                    rects: rects,
                    color: highlightColor,
                    source: 'span'
                };
                highlights.push(highlightData);
            }

            applySavedHighlights(pageNum);
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SAVE_HIGHLIGHTS',
                highlights: highlights
            }));
        }

        // Track selection
        document.addEventListener('selectionchange', () => {
            if (isHighlightMode) return; // Don't show selection toolbar in highlight mode

            const selection = window.getSelection();
            let hasSelection = selection && selection.toString().trim().length > 0;
            if (hasSelection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const layer = document.querySelector('.textLayer');
                const inTextLayer = layer && layer.contains(range.commonAncestorContainer);
                if (!inTextLayer) {
                    hasSelection = false;
                }
            }

            if (hasSelection) {
                selectedSpans = [];
            } else {
                selectedSpans = [];
            }

            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'TEXT_SELECTED',
                hasSelection: hasSelection
            }));
        });

        // Highlight the selected text
        function highlightSelection() {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            const range = selection.getRangeAt(0);
            const layer = document.querySelector('.textLayer');
            if (!layer || !layer.contains(range.commonAncestorContainer)) return;
            const pageWrapper = layer.closest('.page-wrapper');
            if (!pageWrapper) return;

            const rects = getTextRectsFromSelection(range, layer, pageWrapper);
            const selectedText = selection.toString().trim();
            if (!rects.length || !selectedText) return;

            const highlightData = {
                page: currentPageNum,
                text: selectedText,
                rects: rects,
                color: highlightColor
            };

            highlights.push(highlightData);

            applySavedHighlights(currentPageNum);
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SAVE_HIGHLIGHTS',
                highlights: highlights
            }));

            if (selection) selection.removeAllRanges();
            selectedSpans = [];
        }

        // Apply saved highlights to rendered page
        function applySavedHighlights(pageNum) {
            const pageHighlights = highlights.filter(h => h.page === pageNum);
            const pageWrapper = document.querySelector('.page-wrapper');
            if (!pageWrapper) return;

            const highlightLayer = pageWrapper.querySelector('.highlight-layer');
            if (!highlightLayer) return;
            highlightLayer.innerHTML = '';

            pageHighlights.forEach(h => {
                if (h.rects && h.rects.length > 0) {
                    drawHighlightRects(h.rects, h.color, highlightLayer);
                    return;
                }

                // Backward compatibility: convert old spanIndex/offset highlights to rects
                if (h.spanIndex != null) {
                    const span = pageWrapper.querySelector('.textLayer span[data-index="' + h.spanIndex + '"]');
                    if (!span || !span.firstChild) return;
                    const start = typeof h.startOffset === 'number' ? h.startOffset : 0;
                    const end = typeof h.endOffset === 'number' ? h.endOffset : span.textContent.length;
                    if (end <= start) return;
                    const range = document.createRange();
                    range.setStart(span.firstChild, start);
                    range.setEnd(span.firstChild, end);
                    const rects = getRectsRelativeToPage(range, pageWrapper);
                    if (rects.length > 0) {
                        drawHighlightRects(rects, h.color, highlightLayer);
                    }
                }
            });
        }

        const pageLoadingEl = document.getElementById('page-loading');
        
        // SINGLE PAGE MODE: Render a single page (clears container first)
        async function renderPage(pageNum) {
            // Prevent concurrent renders - queue the page if busy
            if (isRendering) {
                pendingPage = pageNum;
                return;
            }
            
            isRendering = true;
            pendingPage = null;
            currentPageNum = pageNum;
            
            // Show loading indicator
            pageLoadingEl.classList.add('visible');
            
            // Dim current page if exists
            const oldWrapper = container.querySelector('.page-wrapper');
            if (oldWrapper) {
                oldWrapper.classList.add('loading');
            }
            
            const page = await pdfDoc.getPage(pageNum);
            
            // Fit-to-width (no upscale) with HiDPI rendering
            const baseViewport = page.getViewport({ scale: 1 });
            const containerWidth = container.clientWidth || window.innerWidth || baseViewport.width;
            const fitScale = Math.min(containerWidth / baseViewport.width, 1);
            const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
            // Removed zoomScale - let browser handle zoom natively for smooth scaling
            const viewportCss = page.getViewport({ scale: fitScale });
            const viewportRender = page.getViewport({ scale: fitScale * dpr });

            // Clear container now that we have page data
            container.innerHTML = '';
            
            // Create page wrapper
            const pageWrapper = document.createElement('div');
            pageWrapper.className = 'page-wrapper';
            pageWrapper.dataset.page = pageNum;
            pageWrapper.style.width = viewportCss.width + 'px';
            pageWrapper.style.height = viewportCss.height + 'px';

            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.className = 'pdf-canvas';
            canvas.height = viewportRender.height;
            canvas.width = viewportRender.width;
            canvas.style.width = viewportCss.width + 'px';
            canvas.style.height = viewportCss.height + 'px';
            pageWrapper.appendChild(canvas);

            // Create text layer
            const textLayer = document.createElement('div');
            textLayer.className = 'textLayer';
            textLayer.style.width = viewportCss.width + 'px';
            textLayer.style.height = viewportCss.height + 'px';
            pageWrapper.appendChild(textLayer);

            const highlightLayer = document.createElement('div');
            highlightLayer.className = 'highlight-layer';
            highlightLayer.style.width = viewportCss.width + 'px';
            highlightLayer.style.height = viewportCss.height + 'px';
            pageWrapper.appendChild(highlightLayer);

            // Create drawing canvas
            const drawingCanvas = document.createElement('canvas');
            drawingCanvas.className = 'drawing-canvas';
            if (isDrawingMode) drawingCanvas.classList.add('active');
            drawingCanvas.dataset.page = pageNum;
            drawingCanvas.width = viewportRender.width;
            drawingCanvas.height = viewportRender.height;
            drawingCanvas.style.width = viewportCss.width + 'px';
            drawingCanvas.style.height = viewportCss.height + 'px';
            // Store the base dimensions for coordinate normalization
            drawingCanvas.dataset.baseWidth = baseViewport.width;
            drawingCanvas.dataset.baseHeight = baseViewport.height;
            pageWrapper.appendChild(drawingCanvas);

            // Add to container
            container.appendChild(pageWrapper);

            // Setup drawing events
            setupDrawingEvents(drawingCanvas, pageNum);

            // Render canvas
            await page.render({
                canvasContext: context,
                viewport: viewportRender
            }).promise;

            // Render text layer for accurate selection
            const textContent = await page.getTextContent({
                normalizeWhitespace: false,
                disableCombineTextItems: true
            });
            await renderTextLayerAccurate(textLayer, textContent, viewportCss, pageNum, 1);

            // Apply saved highlights and drawings
            applySavedHighlights(pageNum);
            applySavedDrawings(pageNum);
            
            // Hide loading indicator
            pageLoadingEl.classList.remove('visible');
            
            // Notify React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAGE_CHANGED',
                currentPage: pageNum,
                totalPages: pdfDoc.numPages
            }));
            
            // Release render lock
            isRendering = false;
            
            // If user requested another page while rendering, render it now
            if (pendingPage !== null && pendingPage !== pageNum) {
                const nextPage = pendingPage;
                pendingPage = null;
                renderPage(nextPage);
            }
        }

        // Removed zoom-triggered re-render - browser handles zoom natively via CSS transforms
        // This prevents flickering and layout jumps during pinch-zoom
        

        // Drawing functions
        function setupDrawingEvents(canvas, pageNum) {
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            const getPos = (e) => {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                
                let canvasX, canvasY;
                if (e.touches && e.touches.length > 0) {
                    canvasX = (e.touches[0].clientX - rect.left) * scaleX;
                    canvasY = (e.touches[0].clientY - rect.top) * scaleY;
                } else {
                    canvasX = (e.clientX - rect.left) * scaleX;
                    canvasY = (e.clientY - rect.top) * scaleY;
                }
                
                // Convert to normalized PDF coordinates (0-1 range)
                const normalizedX = canvasX / canvas.width;
                const normalizedY = canvasY / canvas.height;
                
                return {
                    x: normalizedX,
                    y: normalizedY,
                    // Also include canvas coordinates for immediate rendering
                    canvasX: canvasX,
                    canvasY: canvasY
                };
            };
            
            const startDrawing = (e) => {
                if (!isDrawingMode) return;
                e.preventDefault();
                isDrawing = true;
                const pos = getPos(e);
                
                // Calculate effective line width (highlighter mode uses thicker lines)
                const effectiveWidth = isHighlighterMode ? lineWidth * 6 : lineWidth;
                const effectiveOpacity = isHighlighterMode ? Math.min(drawingOpacity * 0.4, 0.5) : drawingOpacity;
                
                // Store normalized line width (relative to canvas width)
                const normalizedLineWidth = (effectiveWidth * window.devicePixelRatio) / canvas.width;
                
                currentPath = {
                    points: [{ x: pos.x, y: pos.y }], // Store normalized coordinates
                    color: drawingColor,
                    lineWidth: normalizedLineWidth, // Normalized line width
                    opacity: effectiveOpacity,
                    isHighlighter: isHighlighterMode
                };
                
                ctx.beginPath();
                ctx.globalAlpha = effectiveOpacity;
                ctx.strokeStyle = drawingColor;
                ctx.lineWidth = effectiveWidth * window.devicePixelRatio;
                
                // Highlighter mode uses different composite mode for overlap
                if (isHighlighterMode) {
                    ctx.globalCompositeOperation = 'multiply';
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                }
                
                ctx.moveTo(pos.canvasX, pos.canvasY);
            };
            
            const draw = (e) => {
                if (!isDrawing || !currentPath) return;
                e.preventDefault();
                const pos = getPos(e);
                currentPath.points.push({ x: pos.x, y: pos.y }); // Store normalized coordinates
                ctx.lineTo(pos.canvasX, pos.canvasY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(pos.canvasX, pos.canvasY);
            };
            
            const stopDrawing = (e) => {
                if (!isDrawing) return;
                e.preventDefault();
                isDrawing = false;
                
                if (currentPath && currentPath.points.length > 1) {
                    if (!drawings[pageNum]) {
                        drawings[pageNum] = [];
                    }
                    drawings[pageNum].push(currentPath);
                    
                    // Save drawings
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'SAVE_DRAWINGS',
                        drawings: drawings
                    }));
                }
                currentPath = null;
            };
            
            // Mouse events
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseleave', stopDrawing);
            
            // Touch events
            canvas.addEventListener('touchstart', startDrawing, { passive: false });
            canvas.addEventListener('touchmove', draw, { passive: false });
            canvas.addEventListener('touchend', stopDrawing, { passive: false });
            canvas.addEventListener('touchcancel', stopDrawing, { passive: false });
        }

        function setDrawingMode(enabled) {
            isDrawingMode = enabled;
            const canvases = document.querySelectorAll('.drawing-canvas');
            canvases.forEach(canvas => {
                if (enabled) {
                    canvas.classList.add('active');
                } else {
                    canvas.classList.remove('active');
                }
            });
            
            // Disable text selection when drawing
            const textLayers = document.querySelectorAll('.textLayer');
            textLayers.forEach(layer => {
                layer.style.pointerEvents = enabled ? 'none' : 'auto';
            });
            
           
        }

        function setDrawingColor(color) {
            drawingColor = color;
        }

        function setLineWidth(width) {
            lineWidth = Math.max(1, Math.min(width, 50)); // Clamp between 1-50
        }

        function setHighlighterMode(enabled) {
            isHighlighterMode = enabled;
        }

        function setDrawingOpacity(opacity) {
            drawingOpacity = Math.max(0.1, Math.min(opacity, 1)); // Clamp between 0.1-1
        }

        function redrawPage(pageNum) {
            const canvas = document.querySelector('.drawing-canvas[data-page="' + pageNum + '"]');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            const pageDrawings = drawings[pageNum] || [];
            pageDrawings.forEach(path => {
                if (path.points.length < 2) return;
                
                // Apply saved opacity and composite mode
                const pathOpacity = path.opacity !== undefined ? path.opacity : 1;
                ctx.globalAlpha = pathOpacity;
                
                if (path.isHighlighter) {
                    ctx.globalCompositeOperation = 'multiply';
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                }
                
                ctx.beginPath();
                ctx.strokeStyle = path.color;
                
                // Scale normalized line width to current canvas size
                const scaledLineWidth = path.lineWidth * canvas.width;
                ctx.lineWidth = scaledLineWidth;
                
                // Convert normalized coordinates to current canvas coordinates
                const firstPoint = path.points[0];
                const firstX = firstPoint.x * canvas.width;
                const firstY = firstPoint.y * canvas.height;
                ctx.moveTo(firstX, firstY);
                
                for (let i = 1; i < path.points.length; i++) {
                    const point = path.points[i];
                    const scaledX = point.x * canvas.width;
                    const scaledY = point.y * canvas.height;
                    ctx.lineTo(scaledX, scaledY);
                }
                ctx.stroke();
            });
            
            // Reset to defaults
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        function undoDrawing() {
            // Use currentPageNum in single page mode
            if (drawings[currentPageNum] && drawings[currentPageNum].length > 0) {
                drawings[currentPageNum].pop();
                redrawPage(currentPageNum);
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'SAVE_DRAWINGS',
                    drawings: drawings
                }));
            }
        }

        function clearAllDrawings() {
            drawings = {};
            document.querySelectorAll('.drawing-canvas').forEach(canvas => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SAVE_DRAWINGS',
                drawings: drawings
            }));
        }

        function applySavedDrawings(pageNum) {
            const pageDrawings = drawings[pageNum];
            if (!pageDrawings || pageDrawings.length === 0) return;
            
            setTimeout(() => {
                redrawPage(pageNum);
            }, 100);
        }

        function loadSavedDrawings(savedDrawings) {
            drawings = savedDrawings || {};
            // Redraw current page only (single page mode)
            redrawPage(currentPageNum);
        }

        // Load and render PDF - SINGLE PAGE MODE
        async function loadPDF(pdfData) {
            try {
                loadingEl.textContent = 'در حال بارگذاری PDF...';
                
                // Convert base64 to Uint8Array in chunks to reduce memory spike
                const chunkSize = 1024 * 1024; // 1MB chunks for decoding
                let binaryString = '';
                
                // Process in chunks if data is large
                if (pdfData.length > chunkSize) {
                    for (let i = 0; i < pdfData.length; i += chunkSize) {
                        const chunk = pdfData.substring(i, i + chunkSize);
                        binaryString += atob(chunk);
                        await new Promise(r => setTimeout(r, 0));
                    }
                } else {
                    binaryString = atob(pdfData);
                }
                
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                
                // Fill Uint8Array in chunks
                const fillChunkSize = 1024 * 512;
                for (let i = 0; i < len; i += fillChunkSize) {
                    const end = Math.min(i + fillChunkSize, len);
                    for (let j = i; j < end; j++) {
                        bytes[j] = binaryString.charCodeAt(j);
                    }
                    if (i + fillChunkSize < len) {
                        await new Promise(r => setTimeout(r, 0));
                    }
                }
                
                binaryString = null; // Free memory
                
                const loadingTask = pdfjsLib.getDocument({
                    data: bytes,
                    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                    cMapPacked: true,
                });
                
                pdfDoc = await loadingTask.promise;
                
                // Notify React Native that PDF loaded
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PDF_LOADED',
                    pageCount: pdfDoc.numPages
                }));

                // SINGLE PAGE MODE: Just render page 1
                await renderPage(1);
                
                loadingEl.style.display = 'none';
            } catch (error) {
                loadingEl.style.display = 'none';
                document.getElementById('error-msg').style.display = 'block';
                document.getElementById('error-msg').textContent = 'خطا: ' + (error.message || 'بارگذاری ناموفق');
                console.error('PDF load error:', error);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PDF_ERROR',
                    error: error.message || 'Unknown error'
                }));
            }
        }

        // Function to clear all highlights (called from React Native)
        function clearAllHighlights() {
            highlights = [];
            const pageWrapper = document.querySelector('.page-wrapper');
            if (pageWrapper) {
                const highlightLayer = pageWrapper.querySelector('.highlight-layer');
                if (highlightLayer) highlightLayer.innerHTML = '';
            }
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SAVE_HIGHLIGHTS',
                highlights: []
            }));
        }

        // Function to receive highlights from React Native
        function setHighlights(newHighlights) {
            highlights = newHighlights;
            // Re-apply highlights to current page only (single page mode)
            applySavedHighlights(currentPageNum);
        }

        // ========== SEARCH FUNCTIONALITY ==========
        let searchResults = [];
        let currentSearchIndex = -1;

        // Search for text in PDF (searches current page only in single-page mode)
        function getSearchLayer() {
            let layer = document.getElementById('search-layer');
            if (!layer) {
                layer = document.createElement('div');
                layer.id = 'search-layer';
                layer.className = 'search-highlight-layer';
                const pageWrapper = document.querySelector('.page-wrapper');
                if (pageWrapper) {
                    pageWrapper.appendChild(layer);
                }
            }
            return layer;
        }

        function searchText(query) {
            // Clear previous search results
            clearSearchHighlights();
            searchResults = [];
            currentSearchIndex = -1;

            if (!query || query.trim() === '') {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'SEARCH_RESULTS',
                    count: 0,
                    currentIndex: 0,
                    currentPage: currentPageNum
                }));
                return;
            }

            const searchTerm = query.trim();
            const escaped = searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escaped, 'gi');
            const pageWrapper = document.querySelector('.page-wrapper');
            const textLayer = document.querySelector('.textLayer');
            const allSpans = document.querySelectorAll('.textLayer span');
            const searchLayer = getSearchLayer();
            if (!pageWrapper || !textLayer || !searchLayer) return;
            const wrapperRect = pageWrapper.getBoundingClientRect();

            searchLayer.style.left = '0px';
            searchLayer.style.top = '0px';
            searchLayer.style.width = pageWrapper.scrollWidth + 'px';
            searchLayer.style.height = pageWrapper.scrollHeight + 'px';

            allSpans.forEach((span) => {
                const textNode = span.firstChild;
                if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
                const text = textNode.textContent || '';
                if (!text) return;

                if (!regex.test(text)) {
                    regex.lastIndex = 0;
                    return;
                }
                regex.lastIndex = 0;

                let match;
                while ((match = regex.exec(text)) !== null) {
                    const start = match.index;
                    const end = start + match[0].length;
                    const range = document.createRange();
                    range.setStart(textNode, start);
                    range.setEnd(textNode, end);
                    const rect = range.getBoundingClientRect();
                    if (!rect || rect.width === 0 || rect.height === 0) continue;

                    const highlight = document.createElement('div');
                    highlight.className = 'search-match-rect';
                    highlight.style.left = (rect.left - wrapperRect.left + pageWrapper.scrollLeft) + 'px';
                    highlight.style.top = (rect.top - wrapperRect.top + pageWrapper.scrollTop) + 'px';
                    highlight.style.width = rect.width + 'px';
                    highlight.style.height = rect.height + 'px';
                    searchLayer.appendChild(highlight);

                    searchResults.push({
                        element: highlight,
                        page: currentPageNum
                    });
                }

                regex.lastIndex = 0;
            });

            // Navigate to first result if found
            if (searchResults.length > 0) {
                currentSearchIndex = 0;
                highlightCurrentResult();
            }

            // Send result count to React Native (note: this is for current page only)
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SEARCH_RESULTS',
                count: searchResults.length,
                currentIndex: searchResults.length > 0 ? 1 : 0,
                currentPage: currentPageNum
            }));
        }

        // Clear search highlights
        function clearSearchHighlights() {
            const layer = document.getElementById('search-layer');
            if (layer) {
                layer.remove();
            }
        }

        // Highlight current search result
        function highlightCurrentResult() {
            // Remove current class from all
            document.querySelectorAll('.search-match-rect.current').forEach(el => {
                el.classList.remove('current');
            });

            if (searchResults.length > 0 && currentSearchIndex >= 0) {
                const current = searchResults[currentSearchIndex];
                current.element.classList.add('current');
                
                // Scroll to the element
                current.element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }

        // Navigate to next search result
        function nextSearchResult() {
            if (searchResults.length === 0) return;
            
            currentSearchIndex = (currentSearchIndex + 1) % searchResults.length;
            highlightCurrentResult();
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SEARCH_RESULTS',
                count: searchResults.length,
                currentIndex: currentSearchIndex + 1
            }));
        }

        // Navigate to previous search result
        function prevSearchResult() {
            if (searchResults.length === 0) return;
            
            currentSearchIndex = currentSearchIndex - 1;
            if (currentSearchIndex < 0) currentSearchIndex = searchResults.length - 1;
            highlightCurrentResult();
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SEARCH_RESULTS',
                count: searchResults.length,
                currentIndex: currentSearchIndex + 1
            }));
        }

        // Clear search (called from React Native)
        function clearSearch() {
            clearSearchHighlights();
            searchResults = [];
            currentSearchIndex = -1;
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SEARCH_RESULTS',
                count: 0,
                currentIndex: 0
            }));
        }

        // ========== PAGE NAVIGATION (SINGLE PAGE MODE) ==========
        
        // Go to specific page - SINGLE PAGE MODE
        function goToPage(pageNum) {
            const page = parseInt(pageNum);
            if (page < 1 || page > (pdfDoc?.numPages || 0)) return;
            if (page === currentPageNum) return; // Already on this page
            
            // Simply render the new page (renderPage clears the old one)
            renderPage(page);
        }

        // Go to first page
        function goToFirstPage() {
            goToPage(1);
        }

        // Go to last page
        function goToLastPage() {
            goToPage(pdfDoc?.numPages || 1);
        }

        // Go to next page
        function nextPage() {
            if (currentPageNum < (pdfDoc?.numPages || 0)) {
                goToPage(currentPageNum + 1);
            }
        }

        // Go to previous page
        function prevPage() {
            if (currentPageNum > 1) {
                goToPage(currentPageNum - 1);
            }
        }

        // Listen for PDF data from React Native
        window.loadPDFFromBase64 = function(base64Data) {
            loadPDF(base64Data);
        };

        // Signal that WebView is ready to receive PDF data
        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'WEBVIEW_READY'
        }));
    </script>
</body>
</html>
    `, [pdfUrl]);

    const webViewSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

    useEffect(() => {
        if (didRestorePageRef.current) return;
        if (!lastOpenedPage || lastOpenedPage <= 1) return;
        if (!totalPages || lastOpenedPage > totalPages) return;
        webViewRef.current?.injectJavaScript(`goToPage(${lastOpenedPage}); true;`);
        didRestorePageRef.current = true;
    }, [lastOpenedPage, totalPages]);

    useEffect(() => {
        if (!webViewReadyRef.current) return;
        webViewRef.current?.injectJavaScript(`setHighlights(${JSON.stringify(highlights)}); true;`);
    }, [highlights]);

    // Handle messages from WebView
    const onMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            switch (data.type) {
                case 'SAVE_HIGHLIGHTS':
                    saveHighlights(data.highlights);
                    break;
                case 'PDF_LOADED':
                    setLoading(false);
                    setError(null);
                    setTotalPages(data.pageCount);
                    console.log('PDF loaded, pages:', data.pageCount);
                    break;
                case 'PDF_ERROR':
                    setLoading(false);
                    setError(data.error);
                    console.log('PDF error:', data.error);
                    break;
                case 'SEARCH_RESULTS':
                    setSearchResultCount(data.count);
                    setCurrentSearchIndex(data.currentIndex);
                    break;
                case 'PAGE_CHANGED':
                    setCurrentPage(data.currentPage);
                    setTotalPages(data.totalPages);
                    saveLastOpenedPage(data.currentPage);
                    break;
                case 'WEBVIEW_READY':
                    webViewReadyRef.current = true;
                    // WebView is ready, send base64 PDF data in chunks to avoid memory crash
                    if (pdfBase64) {
                        sendPdfInChunks(pdfBase64);
                        // Load saved drawings after a delay to ensure PDF is rendered
                        loadDrawings().then(savedDrawings => {
                            if (savedDrawings && Object.keys(savedDrawings).length > 0) {
                                setTimeout(() => {
                                    webViewRef.current?.injectJavaScript(`loadSavedDrawings(${JSON.stringify(savedDrawings)}); true;`);
                                }, 2000);
                            }
                        });
                    }
                    if (highlights.length > 0) {
                        webViewRef.current?.injectJavaScript(`setHighlights(${JSON.stringify(highlights)}); true;`);
                    }
                    // Initialize drawing settings
                    webViewRef.current?.injectJavaScript(`setLineWidth(${strokeWidth}); true;`);
                    webViewRef.current?.injectJavaScript(`setDrawingOpacity(${drawingOpacity}); true;`);
                    webViewRef.current?.injectJavaScript(`setHighlighterMode(${highlighterMode}); true;`);
                    break;
                case 'CHUNK_RECEIVED':
                    // WebView acknowledged receiving a chunk, continue with next
                    // This is handled by the sendPdfInChunks function
                    break;
                case 'SAVE_DRAWINGS':
                    saveDrawings(data.drawings);
                    break;
                case 'TEXT_SELECTED':
                    setTextSelected(data.hasSelection);
                    break;
            }
        } catch (err) {
            console.log('WebView message parse error:', err);
        }
    };

    // Handle WebView errors
    const onWebViewError = (syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.log('WebView error:', nativeEvent);
        setLoading(false);
        setError('خطا در بارگذاری WebView: ' + (nativeEvent.description || nativeEvent.message || 'Unknown'));
    };

    // Clear all highlights
    const clearHighlights = () => {
        webViewRef.current?.injectJavaScript('clearAllHighlights(); true;');
        saveHighlights([]);
    };

    // Search functions
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim().length > 0) {
            webViewRef.current?.injectJavaScript(`searchText('${query.replace(/'/g, "\\'")}'); true;`);
        } else {
            webViewRef.current?.injectJavaScript('clearSearch(); true;');
            setSearchResultCount(0);
            setCurrentSearchIndex(0);
        }
    };

    const handleNextResult = () => {
        webViewRef.current?.injectJavaScript('nextSearchResult(); true;');
    };

    const handlePrevResult = () => {
        webViewRef.current?.injectJavaScript('prevSearchResult(); true;');
    };

    const handleCloseSearch = () => {
        setShowSearch(false);
        setSearchQuery('');
        setSearchResultCount(0);
        setCurrentSearchIndex(0);
        webViewRef.current?.injectJavaScript('clearSearch(); true;');
        Keyboard.dismiss();
    };

    // Page navigation functions
    const handleGoToPage = (pageNum) => {
        const page = parseInt(pageNum);
        if (page >= 1 && page <= totalPages) {
            webViewRef.current?.injectJavaScript(`goToPage(${page}); true;`);
            setShowPageModal(false);
            setPageInput('');
        }
    };

    const handleGoToFirstPage = () => {
        webViewRef.current?.injectJavaScript('goToFirstPage(); true;');
    };

    const handleGoToLastPage = () => {
        webViewRef.current?.injectJavaScript('goToLastPage(); true;');
    };

    const handleNextPage = () => {
        webViewRef.current?.injectJavaScript('nextPage(); true;');
    };

    const handlePrevPage = () => {
        webViewRef.current?.injectJavaScript('prevPage(); true;');
    };

    const openPageModal = () => {
        setPageInput(currentPage.toString());
        setShowPageModal(true);
    };

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <PdfReaderHeader
                NewStyles={NewStyles}
                styles={styles}
                drawingMode={drawingMode}
                drawingColor={drawingColor}
                strokeWidth={strokeWidth}
                highlighterMode={highlighterMode}
                drawingOpacity={drawingOpacity}
                onToggleDrawingMode={toggleDrawingMode}
                onOpenDrawingColorPicker={() => setShowColorPicker(true)}
                onChangeStrokeWidth={changeStrokeWidth}
                onToggleHighlighterMode={toggleHighlighterMode}
                onChangeDrawingOpacity={changeDrawingOpacity}
                onUndoDrawing={undoDrawing}
                onClearAllDrawings={clearAllDrawings}
                textSelected={textSelected}
                onApplyHighlight={applyHighlight}
                highlightColor={highlightColor}
                onOpenHighlightColorPicker={() => setShowHighlightColorPicker(true)}
                hasHighlights={highlights.length > 0}
                onOpenHighlightsModal={() => setShowHighlightsModal(true)}
                onToggleSearch={() => setShowSearch(!showSearch)}
                onClearHighlights={clearHighlights}
                isBookmarked={isCurrentPageBookmarked()}
                onToggleBookmark={() => toggleBookmark()}
                onBack={() => navigation.goBack()}
                downloadedPdf={downloadedPdf}
                downloadPdf={downloadPdf}
                downloadingPdf={downloadingPdf}
            />

            {showSearch && (
                <PdfSearchBar
                    styles={styles}
                    searchQuery={searchQuery}
                    onChangeSearch={handleSearch}
                    onClearSearch={() => handleSearch('')}
                    searchResultCount={searchResultCount}
                    currentSearchIndex={currentSearchIndex}
                    onPrevResult={handlePrevResult}
                    onNextResult={handleNextResult}
                    onCloseSearch={handleCloseSearch}
                />
            )}

            {/* WebView */}
            <View style={{ flex: 1 }}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
                        <Text style={[NewStyles.text12, { marginTop: 10, color: themeColor0.bgColor(1) }]}>
                            در حال بارگذاری...
                        </Text>
                    </View>
                )}
                {error && (
                    <View style={styles.errorOverlay}>
                        <Text style={[NewStyles.text14, { color: 'red', textAlign: 'center', marginBottom: 10 }]}>
                            خطا در بارگذاری
                        </Text>
                        <Text style={[NewStyles.text12, { color: '#666', textAlign: 'center' }]}>
                            {error}
                        </Text>
                        <TouchableOpacity
                            style={[styles.clearButton, { marginTop: 20 }]}
                            onPress={() => {
                                setError(null);
                                setLoading(true);
                                setPdfBase64(null);
                                setFetchingPdf(true);
                                setRetryCount(prev => prev + 1);
                            }}
                        >
                            <Text style={styles.clearButtonText}>تلاش مجدد</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {fetchingPdf && !pdfBase64 && !error && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
                        <Text style={[NewStyles.text, { marginTop: 10 }]}>در حال دانلود PDF...</Text>
                    </View>
                )}
                {pdfBase64 && (
                    <WebView
                        ref={webViewRef}
                        source={webViewSource}
                        style={{ flex: 1, backgroundColor: themeColor5.bgColor(1) }}
                        onMessage={onMessage}
                        onError={onWebViewError}
                        onHttpError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.log('HTTP error:', nativeEvent.statusCode);
                        }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={false}
                        scalesPageToFit={false}
                        mixedContentMode="always"
                        allowFileAccess={true}
                        allowUniversalAccessFromFileURLs={true}
                        originWhitelist={['*']}
                        textInteractionEnabled={true}
                        automaticallyAdjustContentInsets={false}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        cacheEnabled={true}
                        cacheMode="LOAD_DEFAULT"
                    />
                )}
            </View>

            {totalPages > 0 && !loading && (
                <PdfBottomNav
                    styles={styles}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onGoFirst={handleGoToFirstPage}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
                    onGoLast={handleGoToLastPage}
                    onOpenPageModal={openPageModal}
                    bookmarksCount={bookmarks.length}
                    onOpenBookmarksModal={() => setShowBookmarksModal(true)}
                />
            )}

            {/* Page Scroll Indicator (Side) */}
            {totalPages > 1 && !loading && (
                <View style={styles.scrollIndicatorContainer}>

                    <Text style={styles.scrollPageText}>{currentPage}</Text>
                </View>
            )}

            <PdfModals
                styles={styles}
                NewStyles={NewStyles}
                showPageModal={showPageModal}
                onClosePageModal={() => setShowPageModal(false)}
                pageInput={pageInput}
                onChangePageInput={setPageInput}
                totalPages={totalPages}
                onConfirmPage={() => handleGoToPage(pageInput)}
                showBookmarksModal={showBookmarksModal}
                bookmarks={bookmarks}
                currentPage={currentPage}
                onGoToBookmark={goToBookmark}
                onToggleBookmark={toggleBookmark}
                onCloseBookmarksModal={() => setShowBookmarksModal(false)}
                showColorPicker={showColorPicker}
                drawingColors={drawingColors}
                drawingColor={drawingColor}
                onSelectDrawingColor={changeDrawingColor}
                onCloseColorPicker={() => setShowColorPicker(false)}
                showHighlightColorPicker={showHighlightColorPicker}
                highlightColors={highlightColors}
                highlightColor={highlightColor}
                onSelectHighlightColor={changeHighlightColor}
                onCloseHighlightColorPicker={() => setShowHighlightColorPicker(false)}
                showHighlightsModal={showHighlightsModal}
                highlights={highlights}
                onGoToHighlight={goToHighlight}
                onRemoveHighlight={removeHighlight}
                onClearHighlights={clearHighlights}
                onCloseHighlightsModal={() => setShowHighlightsModal(false)}
            />
        </SafeAreaView>
    );
};

export default PDFReaderWebView;



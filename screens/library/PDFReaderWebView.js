import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, TextInput, Keyboard, Modal, Dimensions, ScrollView } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NewStyles from '../../styles/NewStyles'
import { themeColor0, themeColor4, themeColor5, themeColor10 } from '../../theme/Color'
import BackArrowIcon from '../../assets/svg/BackArrowIcon'
import SearchIcon from '../../assets/svg/SearchIcon'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import { dlUrl, uri } from '../../services/URL'
import { useSelector } from 'react-redux'
import { handleError } from '../../helpers/Common'
import * as FileSystem from 'expo-file-system'

const { width: deviceWidth } = Dimensions.get('window');

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

const PDFReaderWebView = ({ route }) => {
    const params = route?.params;
    const userToken = useSelector(state => state.auth?.token);
    const [data, setData] = useState()

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

    // Use provided PDF URL or fallback to sample PDF for testing
    const pdfUrl = params?.pdfUrl || 'https://dl.solfabook.com/files/cUUOzJA7XTrc2n6Ca5Egv55hdGJ3WMt093x303vP.pdf';
    const fileId = params?.id || 'test-pdf';

    const webViewRef = useRef(null);
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

    // Bookmarks state
    const [bookmarks, setBookmarks] = useState([]);
    const [showBookmarksModal, setShowBookmarksModal] = useState(false);

    // Drawing state
    const [drawingMode, setDrawingMode] = useState(false);
    const [drawingColor, setDrawingColor] = useState('#ff0000');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const drawingColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'];

    // Load saved highlights and bookmarks from AsyncStorage on mount
    useEffect(() => {
        loadHighlights();
        loadBookmarks();
        fetchFiles()
    }, []);

    // Fetch PDF as base64 to bypass CORS
    useEffect(() => {
        const fetchPdfAsBase64 = async () => {
            try {
                setFetchingPdf(true);
                setError(null);

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
                setError('خطا در دانلود PDF: ' + (err.message || 'نامشخص'));
            } finally {
                setFetchingPdf(false);
            }
        };

        if (pdfUrl) {
            fetchPdfAsBase64();
        }
    }, [pdfUrl, retryCount]);

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
    const htmlContent = `
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
        .text-layer {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            line-height: 1.0;
            -webkit-user-select: text;
            user-select: text;
        }
        .text-layer > span {
            color: transparent;
            position: absolute;
            white-space: pre;
            cursor: text;
            transform-origin: 0% 0%;
            -webkit-user-select: text;
            user-select: text;
            pointer-events: auto;
            padding: 2px 0;
        }
        .text-layer > span::selection {
            background: rgba(150, 29, 90, 0.5);
            color: transparent;
        }
        .text-layer > span::-moz-selection {
            background: rgba(150, 29, 90, 0.5);
            color: transparent;
        }
        .highlight {
            background-color: rgba(255, 235, 59, 0.6) !important;
            color: transparent !important;
            border-radius: 2px;
        }
        .search-match {
            background-color: rgba(255, 152, 0, 0.5) !important;
            color: transparent !important;
            border-radius: 2px;
        }
        .search-match.current {
            background-color: rgba(255, 87, 34, 0.8) !important;
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
            pointer-events: none;
        }
        .drawing-canvas.active {
            pointer-events: auto;
            cursor: crosshair;
        }
            box-shadow: 0 0 4px rgba(255, 87, 34, 0.8);
        }
        .highlight-toolbar {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #961d5a;
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
    <div id="pdf-container"></div>
    <div id="highlight-btn" class="highlight-toolbar" onclick="highlightSelection()">هایلایت</div>

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
    <script src="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
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
        let highlights = ${JSON.stringify(highlights)};
        const container = document.getElementById('pdf-container');
        const highlightBtn = document.getElementById('highlight-btn');
        const loadingEl = document.getElementById('loading');
        let selectedSpans = [];

        // Drawing state
        let isDrawingMode = false;
        let drawingColor = '#ff0000';
        let lineWidth = 3;
        let drawings = {}; // { pageNum: [{ points: [], color: string }] }
        let currentPath = null;
        let isDrawing = false;

        // SINGLE PAGE MODE - only 1 page rendered at a time
        let currentPageNum = 1;
        let pageViewports = {};
        let isRendering = false; // Prevent concurrent renders
        let pendingPage = null; // Queue next page if user taps rapidly

        // Track selection
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 0) {
                highlightBtn.classList.add('visible');
                // Track which spans are selected
                selectedSpans = [];
                const range = selection.getRangeAt(0);
                document.querySelectorAll('.text-layer span').forEach(span => {
                    if (selection.containsNode(span, true) || range.intersectsNode(span)) {
                        selectedSpans.push(span);
                    }
                });
            } else {
                highlightBtn.classList.remove('visible');
                selectedSpans = [];
            }
        });

        // Highlight the selected text
        function highlightSelection() {
            if (selectedSpans.length === 0) {
                // Fallback: try to get from current selection
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                
                const range = selection.getRangeAt(0);
                document.querySelectorAll('.text-layer span').forEach(span => {
                    if (selection.containsNode(span, true) || range.intersectsNode(span)) {
                        selectedSpans.push(span);
                    }
                });
            }
            
            if (selectedSpans.length === 0) return;

            selectedSpans.forEach(span => {
                span.classList.add('highlight');
                
                // Save highlight data
                const pageWrapper = span.closest('.page-wrapper');
                const pageNum = pageWrapper ? pageWrapper.dataset.page : 0;
                const spanIndex = span.dataset.index || Array.from(span.parentNode.children).indexOf(span);
                const highlightData = {
                    page: parseInt(pageNum),
                    text: span.textContent,
                    spanIndex: parseInt(spanIndex)
                };
                
                // Check if not already saved
                const exists = highlights.find(h => 
                    h.page === highlightData.page && 
                    h.spanIndex === highlightData.spanIndex
                );
                
                if (!exists) {
                    highlights.push(highlightData);
                }
            });

            // Send highlights to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SAVE_HIGHLIGHTS',
                highlights: highlights
            }));

            // Clear selection
            const selection = window.getSelection();
            if (selection) selection.removeAllRanges();
            selectedSpans = [];
            highlightBtn.classList.remove('visible');
        }

        // Apply saved highlights to rendered page
        function applySavedHighlights(pageNum) {
            const pageHighlights = highlights.filter(h => h.page === pageNum);
            const pageWrapper = document.querySelector('.page-wrapper');
            if (!pageWrapper) return;

            const spans = pageWrapper.querySelectorAll('.text-layer span');
            pageHighlights.forEach(h => {
                // Find by data-index attribute first
                const span = pageWrapper.querySelector('.text-layer span[data-index="' + h.spanIndex + '"]');
                if (span) {
                    span.classList.add('highlight');
                } else if (spans[h.spanIndex]) {
                    spans[h.spanIndex].classList.add('highlight');
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
            
            // Use lower scale for better performance
            const scale = Math.min(window.devicePixelRatio, 1.5); // Lower scale
            const viewport = page.getViewport({ scale });

            // Clear container now that we have page data
            container.innerHTML = '';
            
            // Create page wrapper
            const pageWrapper = document.createElement('div');
            pageWrapper.className = 'page-wrapper';
            pageWrapper.dataset.page = pageNum;
            pageWrapper.style.width = (viewport.width / scale) + 'px';
            pageWrapper.style.height = (viewport.height / scale) + 'px';

            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.className = 'pdf-canvas';
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.width = (viewport.width / scale) + 'px';
            canvas.style.height = (viewport.height / scale) + 'px';
            pageWrapper.appendChild(canvas);

            // Create text layer
            const textLayer = document.createElement('div');
            textLayer.className = 'text-layer';
            textLayer.style.width = (viewport.width / scale) + 'px';
            textLayer.style.height = (viewport.height / scale) + 'px';
            pageWrapper.appendChild(textLayer);

            // Create drawing canvas
            const drawingCanvas = document.createElement('canvas');
            drawingCanvas.className = 'drawing-canvas';
            if (isDrawingMode) drawingCanvas.classList.add('active');
            drawingCanvas.dataset.page = pageNum;
            drawingCanvas.width = viewport.width;
            drawingCanvas.height = viewport.height;
            drawingCanvas.style.width = (viewport.width / scale) + 'px';
            drawingCanvas.style.height = (viewport.height / scale) + 'px';
            pageWrapper.appendChild(drawingCanvas);

            // Add to container
            container.appendChild(pageWrapper);

            // Setup drawing events
            setupDrawingEvents(drawingCanvas, pageNum);

            // Render canvas
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Get text content (limit to 300 items for performance)
            const textContent = await page.getTextContent();
            const textItems = textContent.items;
            const maxTextItems = 300;
            const itemsToRender = textItems.length > maxTextItems ? textItems.slice(0, maxTextItems) : textItems;

            itemsToRender.forEach((item, index) => {
                if (!item.str || item.str.trim() === '') return;
                
                const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
                const span = document.createElement('span');
                span.textContent = item.str;
                span.dataset.index = index;
                
                const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]) / scale;
                const left = tx[4] / scale;
                const top = tx[5] / scale;
                
                span.style.left = left + 'px';
                span.style.top = top + 'px';
                span.style.fontSize = fontSize + 'px';
                span.style.fontFamily = item.fontName || 'sans-serif';
                
                if (item.width) {
                    span.style.width = (item.width * viewport.scale / scale) + 'px';
                }
                
                span.style.transform = 'scaleX(' + (item.transform[0] < 0 ? -1 : 1) + ')';
                
                textLayer.appendChild(span);
            });

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
        

        // Drawing functions
        function setupDrawingEvents(canvas, pageNum) {
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            const getPos = (e) => {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                
                if (e.touches && e.touches.length > 0) {
                    return {
                        x: (e.touches[0].clientX - rect.left) * scaleX,
                        y: (e.touches[0].clientY - rect.top) * scaleY
                    };
                }
                return {
                    x: (e.clientX - rect.left) * scaleX,
                    y: (e.clientY - rect.top) * scaleY
                };
            };
            
            const startDrawing = (e) => {
                if (!isDrawingMode) return;
                e.preventDefault();
                isDrawing = true;
                const pos = getPos(e);
                currentPath = {
                    points: [pos],
                    color: drawingColor,
                    lineWidth: lineWidth * window.devicePixelRatio
                };
                ctx.beginPath();
                ctx.strokeStyle = drawingColor;
                ctx.lineWidth = lineWidth * window.devicePixelRatio;
                ctx.moveTo(pos.x, pos.y);
            };
            
            const draw = (e) => {
                if (!isDrawing || !currentPath) return;
                e.preventDefault();
                const pos = getPos(e);
                currentPath.points.push(pos);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
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
            const textLayers = document.querySelectorAll('.text-layer');
            textLayers.forEach(layer => {
                layer.style.pointerEvents = enabled ? 'none' : 'auto';
            });
            
            // Hide highlight button in drawing mode
            if (enabled) {
                highlightBtn.classList.remove('visible');
            }
        }

        function setDrawingColor(color) {
            drawingColor = color;
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
                ctx.beginPath();
                ctx.strokeStyle = path.color;
                ctx.lineWidth = path.lineWidth;
                ctx.moveTo(path.points[0].x, path.points[0].y);
                for (let i = 1; i < path.points.length; i++) {
                    ctx.lineTo(path.points[i].x, path.points[i].y);
                }
                ctx.stroke();
            });
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
            document.querySelectorAll('.highlight').forEach(el => {
                el.classList.remove('highlight');
            });
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

            const searchTerm = query.trim().toLowerCase();
            const allSpans = document.querySelectorAll('.text-layer span');

            allSpans.forEach((span, index) => {
                const text = span.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    span.classList.add('search-match');
                    searchResults.push({
                        element: span,
                        index: index,
                        page: currentPageNum
                    });
                }
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
            document.querySelectorAll('.search-match').forEach(el => {
                el.classList.remove('search-match');
                el.classList.remove('current');
            });
        }

        // Highlight current search result
        function highlightCurrentResult() {
            // Remove current class from all
            document.querySelectorAll('.search-match.current').forEach(el => {
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
    `;

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
                    break;
                case 'WEBVIEW_READY':
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
                    break;
                case 'CHUNK_RECEIVED':
                    // WebView acknowledged receiving a chunk, continue with next
                    // This is handled by the sendPdfInChunks function
                    break;
                case 'SAVE_DRAWINGS':
                    saveDrawings(data.drawings);
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
            {/* Header */}
            <View style={styles.header}>
                <View style={NewStyles.row}>
                    {/* Drawing Toggle Button */}
                    <TouchableOpacity
                        style={[styles.iconButton, drawingMode && styles.iconButtonActive]}
                        onPress={toggleDrawingMode}
                    >
                        <Text style={{ fontSize: 18 }}>✏️</Text>
                    </TouchableOpacity>

                    {/* Drawing Controls - Only show when drawing mode is active */}
                    {drawingMode && (
                        <>
                            <TouchableOpacity
                                style={[styles.colorPickerBtn, { backgroundColor: drawingColor }]}
                                onPress={() => setShowColorPicker(true)}
                            />
                            <TouchableOpacity style={styles.iconButton} onPress={undoDrawing}>
                                <Text style={{ fontSize: 16 }}>↩️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={clearAllDrawings}>
                                <Text style={{ fontSize: 16 }}>🗑️</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(!showSearch)}>
                        <SearchIcon color={themeColor0.bgColor(1)} />
                    </TouchableOpacity>
                    {highlights.length > 0 && (
                        <TouchableOpacity style={styles.clearButton} onPress={clearHighlights}>
                            <Text style={styles.clearButtonText}>پاک کردن</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <BackArrowIcon color={themeColor0.bgColor(1)} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            {showSearch && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="جستجو در PDF..."
                            placeholderTextColor={themeColor0.bgColor(0.5)}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoFocus={true}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity style={styles.clearSearchBtn} onPress={() => handleSearch('')}>
                                <Text style={{ color: themeColor0.bgColor(1), fontSize: 18 }}>×</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {searchResultCount > 0 && (
                        <View style={styles.searchNavigation}>
                            <Text style={styles.searchResultText}>
                                {currentSearchIndex} از {searchResultCount}
                            </Text>
                            <TouchableOpacity style={styles.navButton} onPress={handlePrevResult}>
                                <Text style={styles.navButtonText}>▲</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navButton} onPress={handleNextResult}>
                                <Text style={styles.navButtonText}>▼</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {searchQuery.length > 0 && searchResultCount === 0 && (
                        <Text style={styles.noResultText}>نتیجه‌ای یافت نشد</Text>
                    )}

                    <TouchableOpacity style={styles.closeSearchBtn} onPress={handleCloseSearch}>
                        <Text style={styles.closeSearchText}>بستن</Text>
                    </TouchableOpacity>
                </View>
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
                        source={{ html: htmlContent }}
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

            {/* Bottom Navigation Bar */}
            {totalPages > 0 && !loading && (
                <View style={styles.bottomNavBar}>
                    <ScrollView horizontal contentContainerStyle={{ gap: 15, paddingHorizontal: 20, }} showsHorizontalScrollIndicator={false}>
                        {/* Bookmark Button */}
                        <TouchableOpacity
                            style={[styles.navBtn, isCurrentPageBookmarked() && styles.bookmarkActive]}
                            onPress={() => toggleBookmark()}
                        >
                            <Text style={[styles.navBtnText, isCurrentPageBookmarked() && styles.bookmarkActiveText]}>
                                {isCurrentPageBookmarked() ? '🔖' : '📑'}
                            </Text>
                        </TouchableOpacity>

                        {/* First Page Button */}
                        <TouchableOpacity
                            style={[styles.navBtn, currentPage === 1 && styles.navBtnDisabled]}
                            onPress={handleGoToFirstPage}
                            disabled={currentPage === 1}
                        >
                            <Text style={[styles.navBtnText, currentPage === 1 && styles.navBtnTextDisabled]}>⏮</Text>
                        </TouchableOpacity>

                        {/* Previous Page Button */}
                        <TouchableOpacity
                            style={[styles.navBtn, currentPage === 1 && styles.navBtnDisabled]}
                            onPress={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            <Text style={[styles.navBtnText, currentPage === 1 && styles.navBtnTextDisabled]}>◀</Text>
                        </TouchableOpacity>

                        {/* Page Indicator (Tappable) */}
                        <TouchableOpacity style={styles.pageIndicator} onPress={openPageModal}>
                            <Text style={styles.pageIndicatorText}>
                                {currentPage} / {totalPages}
                            </Text>
                        </TouchableOpacity>

                        {/* Next Page Button */}
                        <TouchableOpacity
                            style={[styles.navBtn, currentPage === totalPages && styles.navBtnDisabled]}
                            onPress={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <Text style={[styles.navBtnText, currentPage === totalPages && styles.navBtnTextDisabled]}>▶</Text>
                        </TouchableOpacity>

                        {/* Last Page Button */}
                        <TouchableOpacity
                            style={[styles.navBtn, currentPage === totalPages && styles.navBtnDisabled]}
                            onPress={handleGoToLastPage}
                            disabled={currentPage === totalPages}
                        >
                            <Text style={[styles.navBtnText, currentPage === totalPages && styles.navBtnTextDisabled]}>⏭</Text>
                        </TouchableOpacity>

                        {/* View Bookmarks Button */}
                        {bookmarks.length > 0 && (
                            <TouchableOpacity
                                style={styles.navBtn}
                                onPress={() => setShowBookmarksModal(true)}
                            >
                                <Text style={styles.navBtnText}>📚</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            )}

            {/* Page Scroll Indicator (Side) */}
            {totalPages > 1 && !loading && (
                <View style={styles.scrollIndicatorContainer}>
                    
                    <Text style={styles.scrollPageText}>{currentPage}</Text>
                </View>
            )}

            {/* Page Number Modal */}
            <Modal
                visible={showPageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPageModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPageModal(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>رفتن به صفحه</Text>
                        <TextInput
                            style={styles.pageInput}
                            placeholder={`1 - ${totalPages}`}
                            placeholderTextColor={themeColor0.bgColor(0.4)}
                            value={pageInput}
                            onChangeText={setPageInput}
                            keyboardType="number-pad"
                            autoFocus={true}
                            selectTextOnFocus={true}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setShowPageModal(false)}
                            >
                                <Text style={styles.modalCancelText}>انصراف</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmBtn}
                                onPress={() => handleGoToPage(pageInput)}
                            >
                                <Text style={styles.modalConfirmText}>برو</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Bookmarks Modal */}
            <Modal
                visible={showBookmarksModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowBookmarksModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowBookmarksModal(false)}
                >
                    <View style={styles.bookmarksModalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>صفحات نشان‌شده</Text>

                        {bookmarks.length === 0 ? (
                            <Text style={styles.noBookmarksText}>هیچ صفحه‌ای نشان نشده است</Text>
                        ) : (
                            <ScrollView style={styles.bookmarksList}>
                                {bookmarks.sort((a, b) => a - b).map((pageNum) => (
                                    <TouchableOpacity
                                        key={pageNum}
                                        style={[
                                            styles.bookmarkItem,
                                            currentPage === pageNum && styles.bookmarkItemActive
                                        ]}
                                        onPress={() => goToBookmark(pageNum)}
                                    >
                                        <Text style={styles.bookmarkItemText}>
                                            📄 صفحه {pageNum}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.removeBookmarkBtn}
                                            onPress={() => toggleBookmark(pageNum)}
                                        >
                                            <Text style={styles.removeBookmarkText}>✕</Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={() => setShowBookmarksModal(false)}
                        >
                            <Text style={styles.modalCancelText}>بستن</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Color Picker Modal */}
            <Modal
                visible={showColorPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowColorPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowColorPicker(false)}
                >
                    <View style={styles.colorPickerModalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>انتخاب رنگ</Text>
                        <View style={styles.colorGrid}>
                            {drawingColors.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        drawingColor === color && styles.colorOptionSelected
                                    ]}
                                    onPress={() => changeDrawingColor(color)}
                                />
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={() => setShowColorPicker(false)}
                        >
                            <Text style={styles.modalCancelText}>بستن</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

export default PDFReaderWebView;

const styles = StyleSheet.create({
    header: {
        ...NewStyles.rowWrapper,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: themeColor4.bgColor(0.2),
    },
    backButton: {
        padding: 5,
    },
    iconButton: {
        padding: 8,
        marginRight: 5,
    },
    iconButtonActive: {
        backgroundColor: themeColor0.bgColor(0.2),
        borderRadius: 8,
    },
    colorPickerBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 5,
        borderWidth: 2,
        borderColor: themeColor0.bgColor(0.3),
    },
    clearButton: {
        backgroundColor: themeColor0.bgColor(0.1),
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    clearButtonText: {
        color: themeColor0.bgColor(1),
        fontFamily: 'iransans',
        fontSize: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: themeColor4.bgColor(0.1),
        borderBottomWidth: 1,
        borderBottomColor: themeColor4.bgColor(0.2),
        flexWrap: 'wrap',
        gap: 8,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColor5.bgColor(1),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: themeColor0.bgColor(0.3),
        minWidth: 150,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontFamily: 'iransans',
        fontSize: 14,
        textAlign: 'right',
        color: themeColor0.bgColor(1),
    },
    clearSearchBtn: {
        padding: 8,
    },
    searchNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    searchResultText: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor0.bgColor(1),
        marginRight: 5,
    },
    navButton: {
        backgroundColor: themeColor0.bgColor(0.1),
        padding: 6,
        borderRadius: 4,
    },
    navButtonText: {
        color: themeColor0.bgColor(1),
        fontSize: 10,
    },
    noResultText: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor0.bgColor(0.6),
    },
    closeSearchBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    closeSearchText: {
        fontFamily: 'iransans',
        fontSize: 12,
        color: themeColor0.bgColor(1),
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themeColor5.bgColor(0.9),
        zIndex: 10,
    },
    errorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themeColor5.bgColor(1),
        zIndex: 20,
        paddingHorizontal: 20,
    },
    // Bottom Navigation Bar Styles
    bottomNavBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,

        backgroundColor: themeColor5.bgColor(1),
        borderTopWidth: 1,
        borderTopColor: themeColor4.bgColor(0.2),

    },
    navBtn: {
        backgroundColor: themeColor0.bgColor(0.1),
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    navBtnDisabled: {
        backgroundColor: themeColor4.bgColor(0.1),
    },
    navBtnText: {
        color: themeColor0.bgColor(1),
        fontSize: 16,
    },
    navBtnTextDisabled: {
        color: themeColor4.bgColor(0.5),
    },
    pageIndicator: {
        backgroundColor: themeColor0.bgColor(1),
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        minWidth: 100,
        alignItems: 'center',
    },
    pageIndicatorText: {
        color: themeColor5.bgColor(1),
        fontFamily: 'iransans',
        fontSize: 14,
        fontWeight: 'bold',
    },
    // Scroll Indicator Styles
    scrollIndicatorContainer: {
        position: 'absolute',
        right: 5,
        top: '20%',
        bottom: '20%',
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollTrack: {
        width: 4,
        height: '100%',
        backgroundColor: themeColor4.bgColor(0.3),
        borderRadius: 2,
        position: 'relative',
    },
    scrollThumb: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: themeColor0.bgColor(1),
        left: -4,
        marginTop: -6,
    },
    scrollPageText: {
        position: 'absolute',
        right: 18,
        backgroundColor: themeColor0.bgColor(0.9),
        color: themeColor5.bgColor(1),
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 10,
        fontFamily: 'iransans',
    },
    // Page Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: themeColor5.bgColor(1),
        borderRadius: 15,
        padding: 25,
        width: deviceWidth * 0.8,
        maxWidth: 300,
        alignItems: 'center',
    },
    modalTitle: {
        fontFamily: 'iransans',
        fontSize: 16,
        color: themeColor0.bgColor(1),
        marginBottom: 20,
    },
    pageInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: themeColor0.bgColor(0.3),
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'iransans',
        color: themeColor0.bgColor(1),
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: themeColor4.bgColor(0.2),
        alignItems: 'center',
    },
    modalCancelText: {
        fontFamily: 'iransans',
        fontSize: 14,
        color: themeColor0.bgColor(0.7),
    },
    modalConfirmBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: themeColor0.bgColor(1),
        alignItems: 'center',
    },
    modalConfirmText: {
        fontFamily: 'iransans',
        fontSize: 14,
        color: themeColor5.bgColor(1),
        fontWeight: 'bold',
    },
    // Bookmark styles
    bookmarkActive: {
        backgroundColor: themeColor0.bgColor(0.2),
    },
    bookmarkActiveText: {
        color: themeColor0.bgColor(1),
    },
    bookmarksModalContent: {
        backgroundColor: themeColor5.bgColor(1),
        borderRadius: 15,
        padding: 20,
        width: deviceWidth * 0.85,
        maxWidth: 350,
        maxHeight: '70%',
        alignItems: 'center',
    },
    noBookmarksText: {
        fontFamily: 'iransans',
        fontSize: 14,
        color: themeColor4.bgColor(0.6),
        textAlign: 'center',
        paddingVertical: 30,
    },
    bookmarksList: {
        width: '100%',
        marginBottom: 15,
    },
    bookmarkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: themeColor4.bgColor(0.1),
        marginBottom: 8,
    },
    bookmarkItemActive: {
        backgroundColor: themeColor0.bgColor(0.15),
        borderWidth: 1,
        borderColor: themeColor0.bgColor(0.3),
    },
    bookmarkItemText: {
        fontFamily: 'iransans',
        fontSize: 14,
        color: themeColor0.bgColor(1),
    },
    removeBookmarkBtn: {
        padding: 5,
    },
    removeBookmarkText: {
        fontSize: 16,
        color: themeColor4.bgColor(0.6),
    },
    // Color Picker styles
    colorPickerModalContent: {
        backgroundColor: themeColor5.bgColor(1),
        borderRadius: 15,
        padding: 20,
        width: deviceWidth * 0.8,
        maxWidth: 300,
        alignItems: 'center',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 20,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: themeColor4.bgColor(0.3),
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: themeColor0.bgColor(1),
        transform: [{ scale: 1.1 }],
    },
});

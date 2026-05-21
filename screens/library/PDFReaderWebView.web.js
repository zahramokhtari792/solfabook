import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { dlUrl, mainUri, uri } from '../../services/URL';
import { handleError } from '../../helpers/Common';
import makeStyles, { langIsRTL } from '../../styles/NewStyles';
import { themeColor0, themeColor4, themeColor5 } from '../../theme/Color';
import PdfReaderHeader from './pdfReaderWebView/components/PdfReaderHeader';
import PdfModals from './pdfReaderWebView/components/PdfModals';
import { styles as readerStyles } from './pdfReaderWebView/styles';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildViewerHtml = (sourceUrl, initialScale) => {
  const safeSourceUrl = JSON.stringify(sourceUrl || '');
  const safeInitialScale = Number.isFinite(initialScale) ? initialScale : 1;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    :root {
      color-scheme: light;
    }
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #f7f7fb;
      font-family: Arial, sans-serif;
    }
    #viewer {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
      background: linear-gradient(180deg, #f7f7fb 0%, #ececf4 100%);
    }
    #pages {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      padding: 18px 12px 48px;
      box-sizing: border-box;
      min-height: 100%;
    }
    .page {
      position: relative;
      background: #fff;
      box-shadow: 0 10px 35px rgba(15, 23, 42, 0.12);
      border-radius: 12px;
      overflow: hidden;
      transform-origin: top center;
    }
    .page-canvas {
      display: block;
      width: 100%;
      height: auto;
    }
    .annotation-canvas {
      position: absolute;
      inset: 0;
      z-index: 2;
      touch-action: none;
      pointer-events: none;
    }
    .annotation-canvas.active {
      pointer-events: auto;
      cursor: crosshair;
    }
    .page-label {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 2;
      background: rgba(17, 24, 39, 0.78);
      color: #fff;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      letter-spacing: 0.2px;
    }
    #status {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #961d5a;
      font-size: 14px;
      background: rgba(247, 247, 251, 0.92);
      z-index: 10;
    }
    #status.hidden {
      display: none;
    }
    #error {
      display: none;
      padding: 24px;
      color: #b42318;
      text-align: center;
      line-height: 1.6;
    }
  </style>
  <script src="https://solfabook.com/pdf/js/pdf.min.js" ></script>
</head>
<body>
  <div id="viewer">
    <div id="status">Loading PDF...</div>
    <div id="error"></div>
    <div id="pages"></div>
  </div>
  <script>
    (function () {
      const SOURCE_URL = ${safeSourceUrl};
      let currentScale = ${safeInitialScale};
      let pdfDoc = null;
      let currentPage = 1;
      let totalPages = 0;
      let renderToken = 0;
      let scrollTimer = null;
      let drawings = {};
      let currentPath = null;
      let isDrawingMode = false;
      let drawingColor = '#ff0000';
      let lineWidth = 3;
      let isHighlighterMode = false;
      let drawingOpacity = 1;
      let currentPageCanvas = 1;

      const viewer = document.getElementById('viewer');
      const pages = document.getElementById('pages');
      const status = document.getElementById('status');
      const errorEl = document.getElementById('error');

      function postMessage(type, payload) {
        window.parent.postMessage(JSON.stringify(Object.assign({ type: type }, payload || {})), '*');
      }

      function showError(message) {
        errorEl.style.display = 'block';
        errorEl.textContent = message;
        status.classList.add('hidden');
      }

      function hideStatus() {
        status.classList.add('hidden');
      }

      function debounceScrollUpdate() {
        if (scrollTimer) {
          clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(function () {
          updateCurrentPageFromScroll();
        }, 80);
      }

      function updateCurrentPageFromScroll() {
        const pageNodes = Array.from(document.querySelectorAll('.page'));
        if (!pageNodes.length) return;

        const viewerRect = viewer.getBoundingClientRect();
        let bestPage = currentPage;
        let bestScore = Infinity;

        for (let i = 0; i < pageNodes.length; i++) {
          const node = pageNodes[i];
          const rect = node.getBoundingClientRect();
          const delta = Math.abs(rect.top - viewerRect.top);
          if (delta < bestScore) {
            bestScore = delta;
            bestPage = Number(node.dataset.page || currentPage);
          }
        }

        if (bestPage !== currentPage) {
          currentPage = bestPage;
          currentPageCanvas = bestPage;
          postMessage('PAGE_CHANGED', { currentPage: currentPage, totalPages: totalPages });
        }
      }

      function getCanvasPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const point = event.touches && event.touches.length > 0 ? event.touches[0] : event;
        const canvasX = (point.clientX - rect.left) * scaleX;
        const canvasY = (point.clientY - rect.top) * scaleY;
        return {
          x: canvasX / canvas.width,
          y: canvasY / canvas.height,
          canvasX: canvasX,
          canvasY: canvasY,
        };
      }

      function redrawPage(pageNumber) {
        const canvas = document.querySelector('.annotation-canvas[data-page="' + pageNumber + '"]');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const pageDrawings = drawings[pageNumber] || [];
        pageDrawings.forEach(function (path) {
          if (!path.points || path.points.length < 2) return;

          ctx.globalAlpha = path.opacity !== undefined ? path.opacity : 1;
          ctx.globalCompositeOperation = path.isHighlighter ? 'multiply' : 'source-over';
          ctx.beginPath();
          ctx.strokeStyle = path.color;
          ctx.lineWidth = (path.lineWidth || 0.01) * canvas.width;

          ctx.moveTo(path.points[0].x * canvas.width, path.points[0].y * canvas.height);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x * canvas.width, path.points[i].y * canvas.height);
          }
          ctx.stroke();
        });

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }

      function redrawAllPages() {
        Object.keys(drawings).forEach(function (pageNumber) {
          redrawPage(Number(pageNumber));
        });
      }

      function postDrawings() {
        postMessage('SAVE_DRAWINGS', { drawings: drawings });
      }

      function setupDrawingEvents(canvas, pageNumber) {
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const startDrawing = function (event) {
          if (!isDrawingMode) return;
          event.preventDefault();
          currentPageCanvas = pageNumber;
          const pos = getCanvasPosition(canvas, event);
          const effectiveWidth = isHighlighterMode ? lineWidth * 6 : lineWidth;
          const effectiveOpacity = isHighlighterMode ? Math.min(drawingOpacity * 0.4, 0.5) : drawingOpacity;

          currentPath = {
            points: [{ x: pos.x, y: pos.y }],
            color: drawingColor,
            lineWidth: (effectiveWidth * window.devicePixelRatio) / canvas.width,
            opacity: effectiveOpacity,
            isHighlighter: isHighlighterMode,
          };

          ctx.beginPath();
          ctx.globalAlpha = effectiveOpacity;
          ctx.globalCompositeOperation = isHighlighterMode ? 'multiply' : 'source-over';
          ctx.strokeStyle = drawingColor;
          ctx.lineWidth = effectiveWidth * window.devicePixelRatio;
          ctx.moveTo(pos.canvasX, pos.canvasY);
        };

        const draw = function (event) {
          if (!isDrawingMode || !currentPath) return;
          event.preventDefault();
          const pos = getCanvasPosition(canvas, event);
          currentPath.points.push({ x: pos.x, y: pos.y });
          ctx.lineTo(pos.canvasX, pos.canvasY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(pos.canvasX, pos.canvasY);
        };

        const stopDrawing = function (event) {
          if (!currentPath) return;
          event.preventDefault();
          if (currentPath.points.length > 1) {
            if (!drawings[pageNumber]) {
              drawings[pageNumber] = [];
            }
            drawings[pageNumber].push(currentPath);
            postDrawings();
          }
          currentPath = null;
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing, { passive: false });
        canvas.addEventListener('touchcancel', stopDrawing, { passive: false });
      }

      function getAvailableWidth() {
        const rawWidth = viewer.clientWidth || window.innerWidth || 0;
        return Math.max(1, rawWidth - 24);
      }

      async function renderPage(pageNumber) {
        const page = await pdfDoc.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = getAvailableWidth();
        const fitScale = Math.min(availableWidth / baseViewport.width, 1);
        const scale = Math.max(0.1, fitScale * currentScale);
        const viewport = page.getViewport({ scale: scale });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const renderViewport = page.getViewport({ scale: scale * dpr });

        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'page';
        pageWrapper.dataset.page = String(pageNumber);
        pageWrapper.style.width = viewport.width + 'px';
        pageWrapper.style.height = viewport.height + 'px';

        const label = document.createElement('div');
        label.className = 'page-label';
        label.textContent = pageNumber + ' / ' + totalPages;
        pageWrapper.appendChild(label);

        const canvas = document.createElement('canvas');
        canvas.className = 'page-canvas';
        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';
        pageWrapper.appendChild(canvas);

        const annotationCanvas = document.createElement('canvas');
        annotationCanvas.className = 'annotation-canvas' + (isDrawingMode ? ' active' : '');
        annotationCanvas.dataset.page = String(pageNumber);
        annotationCanvas.width = Math.floor(renderViewport.width);
        annotationCanvas.height = Math.floor(renderViewport.height);
        annotationCanvas.style.width = viewport.width + 'px';
        annotationCanvas.style.height = viewport.height + 'px';
        pageWrapper.appendChild(annotationCanvas);

        setupDrawingEvents(annotationCanvas, pageNumber);

        pages.appendChild(pageWrapper);

        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport: renderViewport }).promise;

        redrawPage(pageNumber);
      }

      async function renderAllPages() {
        if (!pdfDoc) return;

        const availableWidth = getAvailableWidth();
        if (!availableWidth || availableWidth <= 1) {
          requestAnimationFrame(function () {
            renderAllPages();
          });
          return;
        }

        const token = ++renderToken;
        pages.innerHTML = '';
        status.classList.remove('hidden');
        status.textContent = 'Rendering PDF...';

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
          if (token !== renderToken) {
            return;
          }
          await renderPage(pageNumber);
        }

        hideStatus();
        postMessage('PAGE_CHANGED', { currentPage: currentPage, totalPages: totalPages });
        updateCurrentPageFromScroll();
      }

      function goToPage(pageNumber) {
        const targetPage = Math.max(1, Math.min(totalPages, pageNumber));
        const target = document.querySelector('.page[data-page="' + targetPage + '"]');
        if (!target) return;
        currentPage = targetPage;
        currentPageCanvas = targetPage;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        postMessage('PAGE_CHANGED', { currentPage: currentPage, totalPages: totalPages });
      }

      function setZoom(nextScale) {
        currentScale = Math.max(0.5, Math.min(3, nextScale));
        renderAllPages();
      }

      function fitWidth() {
        currentScale = 1;
        renderAllPages();
      }

      function setDrawingMode(enabled) {
        isDrawingMode = !!enabled;
        const canvases = document.querySelectorAll('.annotation-canvas');
        canvases.forEach(function (canvas) {
          if (isDrawingMode) {
            canvas.classList.add('active');
          } else {
            canvas.classList.remove('active');
          }
        });
      }

      function setDrawingColor(color) {
        drawingColor = color || drawingColor;
      }

      function setLineWidth(nextWidth) {
        lineWidth = Math.max(1, Math.min(Number(nextWidth) || 1, 50));
      }

      function setHighlighterMode(enabled) {
        isHighlighterMode = !!enabled;
      }

      function setDrawingOpacity(nextOpacity) {
        drawingOpacity = Math.max(0.1, Math.min(Number(nextOpacity) || 1, 1));
      }

      function undoDrawing() {
        const pageDrawings = drawings[currentPageCanvas] || [];
        if (pageDrawings.length === 0) return;
        pageDrawings.pop();
        drawings[currentPageCanvas] = pageDrawings;
        redrawPage(currentPageCanvas);
        postDrawings();
      }

      function clearAllDrawings() {
        drawings = {};
        redrawAllPages();
        postDrawings();
      }

      function loadSavedDrawings(savedDrawings) {
        drawings = savedDrawings || {};
        redrawAllPages();
      }

      function requestFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen().catch(function () {});
        }
      }

      async function loadPdf() {
        try {
          if (!window.pdfjsLib) {
            throw new Error('PDF.js failed to load');
          }

          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://solfabook.com/pdf/js/pdf.worker.min.js';
          const loadingTask = window.pdfjsLib.getDocument({
            url: SOURCE_URL,
            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
          });

          pdfDoc = await loadingTask.promise;
          totalPages = pdfDoc.numPages;
          currentPage = 1;
          postMessage('PDF_LOADED', { pageCount: totalPages });
          await renderAllPages();
        } catch (error) {
          status.classList.add('hidden');
          showError('Error loading PDF: ' + (error && error.message ? error.message : 'Unknown error'));
          postMessage('PDF_ERROR', { error: error && error.message ? error.message : 'Unknown error' });
        }
      }

      viewer.addEventListener('scroll', debounceScrollUpdate, { passive: true });
      window.addEventListener('resize', function () {
        if (pdfDoc) {
          renderAllPages();
        }
      });

      window.addEventListener('message', function (event) {
        var message = event.data;
        try {
          if (typeof message === 'string') {
            message = JSON.parse(message);
          }
        } catch (e) {
          return;
        }

        if (!message || !message.type) return;

        switch (message.type) {
          case 'SET_PAGE':
            goToPage(Number(message.page || 1));
            break;
          case 'SET_ZOOM':
            if (typeof message.scale === 'number') {
              setZoom(message.scale);
            }
            break;
          case 'ZOOM_IN':
            setZoom(currentScale + 0.25);
            break;
          case 'ZOOM_OUT':
            setZoom(currentScale - 0.25);
            break;
          case 'FIT_WIDTH':
            fitWidth();
            break;
          case 'FULLSCREEN':
            requestFullscreen();
            break;
          case 'REFRESH':
            renderAllPages();
            break;
          case 'SET_DRAWING_MODE':
            setDrawingMode(message.enabled);
            break;
          case 'SET_DRAWING_COLOR':
            setDrawingColor(message.color);
            break;
          case 'SET_LINE_WIDTH':
            setLineWidth(message.width);
            break;
          case 'SET_HIGHLIGHTER_MODE':
            setHighlighterMode(message.enabled);
            break;
          case 'SET_DRAWING_OPACITY':
            setDrawingOpacity(message.opacity);
            break;
          case 'UNDO_DRAWING':
            undoDrawing();
            break;
          case 'CLEAR_ALL_DRAWINGS':
            clearAllDrawings();
            break;
          case 'LOAD_DRAWINGS':
            loadSavedDrawings(message.drawings);
            break;
          default:
            break;
        }
      });

      postMessage('READY', {});
      loadPdf();
    })();
  </script>
</body>
</html>`;
};

export default function PDFReaderWebView({ route }) {
  const params = route?.params;
  const userToken = useSelector((state) => state.auth?.token);
  const { i18n, t } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const NewStyles = useMemo(() => makeStyles(lang), [lang]);

  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [highlighterMode, setHighlighterMode] = useState(false);
  const [drawingOpacity, setDrawingOpacity] = useState(1);
  const [drawings, setDrawings] = useState({});
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const iframeRef = useRef(null);
  const navigation = useNavigation();
  const fileId = params?.id;

  useEffect(() => {
    if (!params?.id || !userToken || params?.pdfUrl) {
      return;
    }

    axios.post(`${uri}/fetchFiles`, { id: params.id }, { headers: { Accept: 'application/json', Authorization: `Bearer ${userToken}` } })
      .then((res) => {
        setData(`${dlUrl}/${res?.data?.file_pdf?.[0]?.file_path}`);
      })
      .catch((err) => {
        handleError(err);
        setError(t('Error on loading'));
      });
  }, [params?.id, params?.pdfUrl, userToken, t]);

  const pdfSource = params?.localUri || params?.pdfUrl || data;
  const viewerHtml = useMemo(() => buildViewerHtml(pdfSource, 1), [pdfSource]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setTotalPages(0);
    setPageInput('1');
    setInitialLoadComplete(false);
  }, [pdfSource]);

  useEffect(() => {
    if (!fileId) return;

    AsyncStorage.getItem(`pdf_last_page_${fileId}`)
      .then((saved) => {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setCurrentPage(parsed);
          setPageInput(String(parsed));
        }
      })
      .catch(() => undefined);
  }, [fileId]);

  useEffect(() => {
    if (!fileId) return;

    AsyncStorage.getItem(`pdf_bookmarks_${fileId}`)
      .then((saved) => {
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      })
      .catch(() => undefined);
  }, [fileId]);

  useEffect(() => {
    if (!fileId) return;

    AsyncStorage.getItem(`pdf_drawings_${fileId}`)
      .then((saved) => {
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setDrawings(parsed);
        }
      })
      .catch(() => undefined);
  }, [fileId]);

  useEffect(() => {
    const handleMessage = (event) => {
      const message = event?.data;
      let parsed = message;
      if (typeof message === 'string') {
        try {
          parsed = JSON.parse(message);
        } catch {
          return;
        }
      }

      if (!parsed || !parsed.type) return;

      switch (parsed.type) {
        case 'READY':
          setInitialLoadComplete(true);
          break;
        case 'PDF_LOADED':
          setLoading(false);
          setError(null);
          setTotalPages(parsed.pageCount || 0);
          break;
        case 'PDF_ERROR':
          setLoading(false);
          setError(parsed.error || t('Error on loading'));
          break;
        case 'PAGE_CHANGED':
          if (parsed.currentPage) {
            setCurrentPage(parsed.currentPage);
            setPageInput(String(parsed.currentPage));
            if (fileId) {
              AsyncStorage.setItem(`pdf_last_page_${fileId}`, String(parsed.currentPage)).catch(() => undefined);
            }
          }
          if (parsed.totalPages) {
            setTotalPages(parsed.totalPages);
          }
          break;
        case 'SAVE_DRAWINGS':
          if (parsed.drawings && fileId) {
            setDrawings(parsed.drawings);
            AsyncStorage.setItem(`pdf_drawings_${fileId}`, JSON.stringify(parsed.drawings)).catch(() => undefined);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fileId, t]);

  useEffect(() => {
    if (!initialLoadComplete || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(JSON.stringify({ type: 'SET_PAGE', page: currentPage }), '*');
  }, [initialLoadComplete]);

  useEffect(() => {
    if (!initialLoadComplete || !iframeRef.current?.contentWindow) return;
    sendCommand({ type: 'SET_DRAWING_MODE', enabled: drawingMode });
    sendCommand({ type: 'SET_DRAWING_COLOR', color: drawingColor });
    sendCommand({ type: 'SET_LINE_WIDTH', width: strokeWidth });
    sendCommand({ type: 'SET_HIGHLIGHTER_MODE', enabled: highlighterMode });
    sendCommand({ type: 'SET_DRAWING_OPACITY', opacity: drawingOpacity });
  }, [initialLoadComplete, drawingMode, drawingColor, strokeWidth, highlighterMode, drawingOpacity]);

  useEffect(() => {
    if (!initialLoadComplete || !iframeRef.current?.contentWindow) return;
    if (drawings && Object.keys(drawings).length > 0) {
      sendCommand({ type: 'LOAD_DRAWINGS', drawings });
    }
  }, [initialLoadComplete, drawings]);

  const sendCommand = (payload) => {
    const contentWindow = iframeRef.current?.contentWindow;
    if (!contentWindow) return;
    contentWindow.postMessage(JSON.stringify(payload), '*');
  };

  const handleGoToPage = () => {
    const page = clamp(parseInt(pageInput, 10) || 1, 1, totalPages || 1);
    setPageInput(String(page));
    sendCommand({ type: 'SET_PAGE', page });
  };

  const handleToggleDrawingMode = () => {
    const nextMode = !drawingMode;
    setDrawingMode(nextMode);
    sendCommand({ type: 'SET_DRAWING_MODE', enabled: nextMode });
  };

  const handleOpenDrawingColorPicker = () => {
    setShowColorPicker(true);
  };

  const handleChangeStrokeWidth = (nextWidth) => {
    const width = Math.max(1, Math.min(nextWidth, 50));
    setStrokeWidth(width);
    sendCommand({ type: 'SET_LINE_WIDTH', width });
  };

  const handleToggleHighlighterMode = () => {
    const nextMode = !highlighterMode;
    setHighlighterMode(nextMode);
    sendCommand({ type: 'SET_HIGHLIGHTER_MODE', enabled: nextMode });
  };

  const handleChangeDrawingOpacity = (nextOpacity) => {
    const opacity = Math.max(0.1, Math.min(nextOpacity, 1));
    setDrawingOpacity(opacity);
    sendCommand({ type: 'SET_DRAWING_OPACITY', opacity });
  };

  const handleUndoDrawing = () => {
    sendCommand({ type: 'UNDO_DRAWING' });
  };

  const handleClearAllDrawings = () => {
    sendCommand({ type: 'CLEAR_ALL_DRAWINGS' });
    setDrawings({});
    if (fileId) {
      AsyncStorage.setItem(`pdf_drawings_${fileId}`, JSON.stringify({})).catch(() => undefined);
    }
  };

  const handleSelectDrawingColor = (color) => {
    setDrawingColor(color);
    setShowColorPicker(false);
    sendCommand({ type: 'SET_DRAWING_COLOR', color });
  };

  const toggleBookmark = (pageNum = currentPage) => {
    const page = parseInt(pageNum, 10);
    if (!page || Number.isNaN(page)) return;

    const nextBookmarks = bookmarks.includes(page)
      ? bookmarks.filter((item) => item !== page)
      : [...bookmarks, page].sort((left, right) => left - right);

    setBookmarks(nextBookmarks);
    if (fileId) {
      AsyncStorage.setItem(`pdf_bookmarks_${fileId}`, JSON.stringify(nextBookmarks)).catch(() => undefined);
    }
  };

  const isCurrentPageBookmarked = () => bookmarks.includes(currentPage);

  const goToBookmark = (pageNum) => {
    const page = clamp(parseInt(pageNum, 10) || 1, 1, totalPages || 1);
    setPageInput(String(page));
    sendCommand({ type: 'SET_PAGE', page });
    setShowBookmarksModal(false);
  };

  const handleDownload = () => {
    if (!pdfSource) return;

    const anchor = document.createElement('a');
    anchor.href = pdfSource;
    anchor.download = (params?.id ? `solfabook-${params.id}.pdf` : 'solfabook.pdf');
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handlePageBack = () => {
    sendCommand({ type: 'SET_PAGE', page: currentPage - 1 });
  };

  const handlePageForward = () => {
    sendCommand({ type: 'SET_PAGE', page: currentPage + 1 });
  };

  const handleGoFirst = () => {
    sendCommand({ type: 'SET_PAGE', page: 1 });
  };

  const handleGoLast = () => {
    sendCommand({ type: 'SET_PAGE', page: totalPages || 1 });
  };

  const handleFullscreen = () => {
    const iframeElement = iframeRef.current;
    if (iframeElement?.requestFullscreen) {
      iframeElement.requestFullscreen().catch(() => undefined);
      return;
    }

    sendCommand({ type: 'FULLSCREEN' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <PdfReaderHeader
        NewStyles={NewStyles}
        styles={readerStyles}
        drawingMode={drawingMode}
        drawingColor={drawingColor}
        strokeWidth={strokeWidth}
        highlighterMode={highlighterMode}
        drawingOpacity={drawingOpacity}
        onToggleDrawingMode={handleToggleDrawingMode}
        onOpenDrawingColorPicker={handleOpenDrawingColorPicker}
        onChangeStrokeWidth={handleChangeStrokeWidth}
        onToggleHighlighterMode={handleToggleHighlighterMode}
        onChangeDrawingOpacity={handleChangeDrawingOpacity}
        onUndoDrawing={handleUndoDrawing}
        onClearAllDrawings={handleClearAllDrawings}
        hasHighlights={false}
        onToggleSearch={undefined}
        isBookmarked={isCurrentPageBookmarked()}
        onToggleBookmark={() => toggleBookmark()}
        onBack={() => navigation.goBack()}
        downloadedPdf={Boolean(params?.localUri || params?.preferLocal)}
        downloadPdf={handleDownload}
        downloadingPdf={false}
      />

      <View style={styles.toolbar}>
        <Pressable style={styles.toolbarButton} onPress={handlePageBack} disabled={currentPage <= 1}>
          <Ionicons name="chevron-back" size={18} color={currentPage <= 1 ? themeColor4.bgColor(0.5) : themeColor0.bgColor(1)} />
        </Pressable>

        <View style={styles.pageInputWrap}>
          <TextInput
            value={pageInput}
            onChangeText={setPageInput}
            keyboardType="number-pad"
            onSubmitEditing={handleGoToPage}
            style={[styles.pageInput, NewStyles.text10, Platform.OS === 'web' && NewStyles.noZoomInput]}
          />
          <Text style={[NewStyles.text10, { color: themeColor4.bgColor(1), marginHorizontal: 6 }]}>/ {totalPages || '-'}</Text>
        </View>

        <Pressable style={styles.toolbarButton} onPress={handlePageForward} disabled={currentPage >= totalPages}>
          <Ionicons name="chevron-forward" size={18} color={currentPage >= totalPages ? themeColor4.bgColor(0.5) : themeColor0.bgColor(1)} />
        </Pressable>

        <Pressable style={styles.toolbarButton} onPress={() => {
          const nextZoom = clamp(Number((zoom + 0.25).toFixed(2)), 0.5, 3);
          setZoom(nextZoom);
          sendCommand({ type: 'SET_ZOOM', scale: nextZoom });
        }}>
          <Ionicons name="add" size={18} color={themeColor0.bgColor(1)} />
        </Pressable>

        <Pressable style={styles.toolbarButton} onPress={() => {
          const nextZoom = clamp(Number((zoom - 0.25).toFixed(2)), 0.5, 3);
          setZoom(nextZoom);
          sendCommand({ type: 'SET_ZOOM', scale: nextZoom });
        }}>
          <Ionicons name="remove" size={18} color={themeColor0.bgColor(1)} />
        </Pressable>

        <Pressable style={styles.toolbarButton} onPress={() => {
          setZoom(1);
          sendCommand({ type: 'SET_ZOOM', scale: 1 });
        }}>
          <Ionicons name="resize-outline" size={18} color={themeColor0.bgColor(1)} />
        </Pressable>
      </View>

      <View style={[styles.toolbar, { justifyContent: 'space-between' }]}>
        <Pressable style={styles.toolbarButton} onPress={handleGoFirst} disabled={currentPage <= 1}>
          <Ionicons name="play-skip-back" size={18} color={currentPage <= 1 ? themeColor4.bgColor(0.5) : themeColor0.bgColor(1)} />
        </Pressable>

        <Pressable style={styles.toolbarButton} onPress={handleFullscreen}>
          <Ionicons name="scan-outline" size={18} color={themeColor0.bgColor(1)} />
        </Pressable>

        <Pressable style={styles.toolbarButton} onPress={handleGoLast} disabled={currentPage >= totalPages}>
          <Ionicons name="play-skip-forward" size={18} color={currentPage >= totalPages ? themeColor4.bgColor(0.5) : themeColor0.bgColor(1)} />
        </Pressable>

        <Pressable style={styles.toolbarButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={18} color={themeColor0.bgColor(1)} />
        </Pressable>

        {bookmarks.length > 0 && (
          <Pressable style={styles.toolbarButton} onPress={() => setShowBookmarksModal(true)}>
            <Ionicons name="bookmarks-outline" size={18} color={themeColor0.bgColor(1)} />
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.text10, { marginTop: 10, color: themeColor0.bgColor(1) }]}>Loading PDF...</Text>
          </View>
        )}

        {error ? (
          <View style={styles.overlay}>
            <Text style={[NewStyles.text6, { color: '#b42318', textAlign: 'center', marginBottom: 14 }]}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => window.location.reload()}>
              <Text style={styles.retryButtonText}>{t('Retry')}</Text>
            </Pressable>
          </View>
        ) : null}

        {!pdfSource && !error && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={themeColor0.bgColor(1)} />
            <Text style={[NewStyles.text10, { marginTop: 10, color: themeColor0.bgColor(1) }]}>{t('Loading...')}</Text>
          </View>
        )}

        {pdfSource ? (
          <iframe
            ref={iframeRef}
            title="PDF Reader"
            srcDoc={viewerHtml}
            style={styles.iframe}
            allow="fullscreen"
            tabIndex={0}
          />
        ) : null}
      </View>

      <PdfModals
        styles={readerStyles}
        NewStyles={NewStyles}
        showPageModal={false}
        onClosePageModal={() => undefined}
        pageInput={pageInput}
        onChangePageInput={setPageInput}
        totalPages={totalPages}
        onConfirmPage={handleGoToPage}
        showBookmarksModal={showBookmarksModal}
        bookmarks={[...bookmarks]}
        currentPage={currentPage}
        onGoToBookmark={goToBookmark}
        onToggleBookmark={toggleBookmark}
        onCloseBookmarksModal={() => setShowBookmarksModal(false)}
        showColorPicker={showColorPicker}
        drawingColors={['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff']}
        drawingColor={drawingColor}
        onSelectDrawingColor={handleSelectDrawingColor}
        onCloseColorPicker={() => setShowColorPicker(false)}
        showHighlightColorPicker={false}
        highlightColors={[]}
        highlightColor={'#ffeb3b'}
        onSelectHighlightColor={() => undefined}
        onCloseHighlightColorPicker={() => undefined}
        showHighlightsModal={false}
        highlights={[]}
        onGoToHighlight={() => undefined}
        onRemoveHighlight={() => undefined}
        onClearHighlights={() => undefined}
        onCloseHighlightsModal={() => undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColor5.bgColor(1),
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.35)',
    backgroundColor: '#fff',
    gap: 6,
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: themeColor0.bgColor(0.08),
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.28)',
  },
  toolbarButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColor0.bgColor(0.08),
  },
  pageInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColor4.bgColor(0.12),
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 38,
  },
  pageInput: {
    minWidth: 56,
    paddingVertical: 0,
    textAlign: 'center',
    color: '#111827',
  },
  body: {
    flex: 1,
    position: 'relative',
  },
  iframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: themeColor5.bgColor(1),
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247, 247, 251, 0.92)',
    zIndex: 2,
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: themeColor0.bgColor(1),
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
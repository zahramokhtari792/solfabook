import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
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
          postMessage('PAGE_CHANGED', { currentPage: currentPage, totalPages: totalPages });
        }
      }

      async function renderPage(pageNumber) {
        const page = await pdfDoc.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const cssWidth = Math.min(viewer.clientWidth - 24, baseViewport.width * currentScale);
        const scale = cssWidth / baseViewport.width;
        const viewport = page.getViewport({ scale: scale });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const renderViewport = page.getViewport({ scale: scale * dpr });

        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'page';
        pageWrapper.dataset.page = String(pageNumber);
        pageWrapper.style.width = viewport.width + 'px';

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

        pages.appendChild(pageWrapper);

        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport: renderViewport }).promise;
      }

      async function renderAllPages() {
        if (!pdfDoc) return;

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
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        postMessage('PAGE_CHANGED', { currentPage: currentPage, totalPages: totalPages });
      }

      function setZoom(nextScale) {
        currentScale = Math.max(0.5, Math.min(3, nextScale));
        renderAllPages();
      }

      function fitWidth() {
        renderAllPages();
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
      <View style={[styles.header, NewStyles.rowWrapper]}>
        <Pressable style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name={langIsRTL(lang) ? "arrow-forward" : "arrow-back"} size={20} color={themeColor0.bgColor(1)} />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <Text style={[NewStyles.text10, { textAlign: 'center' }]} numberOfLines={1}>
            {t('PDF Reader')}
          </Text>
        </View>
        <Pressable style={styles.headerButton} onPress={handleFullscreen}>
          <Ionicons name="scan-outline" size={20} color={themeColor0.bgColor(1)} />
        </Pressable>
        <Pressable style={styles.headerButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={20} color={themeColor0.bgColor(1)} />
        </Pressable>
      </View>

      <View style={styles.toolbar}>
        <Pressable style={styles.toolbarButton} onPress={() => sendCommand({ type: 'SET_PAGE', page: currentPage - 1 })} disabled={currentPage <= 1}>
          <Ionicons name="chevron-back" size={18} color={currentPage <= 1 ? themeColor4.bgColor(0.5) : themeColor0.bgColor(1)} />
        </Pressable>

        <View style={styles.pageInputWrap}>
          <TextInput
            value={pageInput}
            onChangeText={setPageInput}
            keyboardType="number-pad"
            onSubmitEditing={handleGoToPage}
            style={[styles.pageInput, NewStyles.text10]}
          />
          <Text style={[NewStyles.text10, { color: themeColor4.bgColor(1), marginHorizontal: 6 }]}>/ {totalPages || '-'}</Text>
        </View>

        <Pressable style={styles.toolbarButton} onPress={() => sendCommand({ type: 'SET_PAGE', page: currentPage + 1 })} disabled={currentPage >= totalPages}>
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
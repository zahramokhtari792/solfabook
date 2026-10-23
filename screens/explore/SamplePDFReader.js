import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';

import { useNewStyles } from '../../styles/NewStyles';
import { useAppTheme } from '../../context/ThemeProvider';
import { dlUrl } from '../../services/URL';
import { CaptureProtection } from '../../helpers/CaptureProtection';

const PDF_JS_VERSION = '3.11.174';

const PDF_JS_BASE_URL =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_JS_VERSION}`;

const PDF_JS_URL =
    `${PDF_JS_BASE_URL}/legacy/build/pdf.min.js`;

const PDF_WORKER_URL =
    `${PDF_JS_BASE_URL}/legacy/build/pdf.worker.min.js`;

const PDF_CMAP_URL =
    `${PDF_JS_BASE_URL}/cmaps/`;

const PDF_STANDARD_FONTS_URL =
    `${PDF_JS_BASE_URL}/standard_fonts/`;

/*
 * اندازه واقعی فایل بر اساس بایت خوانده می‌شود.
 * Base64 خروجی کمی بزرگ‌تر خواهد بود.
 */
const PDF_CHUNK_SIZE = 128 * 1024;

const PDF_VIEWER_HTML = `
<!doctype html>
<html lang="fa">
<head>
    <meta charset="UTF-8" />

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=4, user-scalable=yes"
    />

    <style>
        * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        html,
        body {
            width: 100%;
            min-height: 100%;
            margin: 0;
            padding: 0;

            background: #e9e9e9;

            font-family:
                Tahoma,
                Arial,
                sans-serif;
        }

        body {
            overflow-x: auto;
            overflow-y: auto;
            overscroll-behavior: none;
        }

        #toolbar {
            position: sticky;
            top: 0;
            z-index: 1000;

            width: 100%;
            height: 56px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            padding: 8px 12px;

            direction: rtl;

            color: #ffffff;
            background: rgba(26, 26, 26, 0.98);

            box-shadow:
                0 2px 8px rgba(0, 0, 0, 0.25);
        }

        #page-information {
            min-width: 90px;

            direction: rtl;

            font-size: 13px;
            text-align: right;
            white-space: nowrap;
        }

        #zoom-controls {
            display: flex;
            align-items: center;
            justify-content: center;

            gap: 8px;

            direction: ltr;
        }

        .zoom-button {
            width: 40px;
            height: 38px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin: 0;
            padding: 0;

            border: 0;
            border-radius: 8px;

            color: #222222;
            background: #ffffff;

            font-family: Arial, sans-serif;
            font-size: 23px;
            font-weight: 700;
        }

        .zoom-button:disabled {
            opacity: 0.45;
        }

        #zoom-value {
            min-width: 58px;

            direction: ltr;

            font-size: 13px;
            text-align: center;
        }

        /*
         * جهت بخش PDF حتماً LTR می‌ماند.
         * RTL کردن Canvas می‌تواند موقعیت صفحات را خراب کند.
         */
        #pdf-container {
            width: 100%;

            padding:
                10px
                8px
                32px;

            direction: ltr;
        }

        .pdf-page {
            display: table;

            margin:
                0
                auto
                12px;

            overflow: hidden;

            direction: ltr;

            background: #ffffff;
            border-radius: 3px;

            box-shadow:
                0 3px 12px rgba(0, 0, 0, 0.20);
        }

        canvas {
            display: block;

            direction: ltr;

            background: #ffffff;

            image-rendering: auto;
        }

        #status-container {
            position: fixed;
            top: 56px;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 900;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 24px;

            direction: rtl;

            color: #444444;
            background: #e9e9e9;

            font-size: 14px;
            line-height: 1.8;
            text-align: center;
        }

        #status-container.hidden {
            display: none;
        }

        #error-box {
            width: 100%;
            max-width: 420px;

            padding: 16px;

            direction: rtl;

            color: #b42318;
            background: #fff4f2;

            border:
                1px
                solid
                #f1b7b1;

            border-radius: 10px;

            line-height: 1.9;
            text-align: center;
        }
    </style>

    <script>
        function sendToNative(type, payload) {
            if (!window.ReactNativeWebView) {
                return;
            }

            window.ReactNativeWebView.postMessage(
                JSON.stringify({
                    type: type,
                    payload: payload || null
                })
            );
        }

        window.onerror = function (
            message,
            source,
            line,
            column,
            error
        ) {
            var details = {
                message: String(
                    message || 'خطای نامشخص در WebView'
                ),
                source: source || '',
                line: line || 0,
                column: column || 0,
                stack: error && error.stack
                    ? String(error.stack)
                    : ''
            };

            // A cross-origin "Script error." has no useful details.
            // It does not, by itself, prove that PDF rendering failed.
            // Real PDF.js load/render failures are reported separately.
            if (
                details.message === 'Script error.' &&
                !details.source &&
                details.line === 0
            ) {
                sendToNative('SCRIPT_WARNING', details);
                return;
            }

            sendToNative('ERROR', details);
        };

        window.onunhandledrejection = function (event) {
            var reason =
                event && event.reason;

            sendToNative('ERROR', {
                message:
                    reason && reason.message
                        ? String(reason.message)
                        : String(
                            reason ||
                            'خطای نامشخص در پردازش PDF'
                        )
            });
        };
    </script>

    <script
        src="${PDF_JS_URL}"
        crossorigin="anonymous"
        onerror="sendToNative('ERROR', { message: 'کتابخانه PDF.js بارگذاری نشد.' })"
    ></script>
</head>

<body>
    <div id="toolbar">
        <div id="page-information">
            تعداد صفحات:
            <span id="total-pages">0</span>
        </div>

        <div id="zoom-controls">
            <button
                id="zoom-out"
                class="zoom-button"
                type="button"
            >
                −
            </button>

            <span id="zoom-value">
                100%
            </span>

            <button
                id="zoom-in"
                class="zoom-button"
                type="button"
            >
                +
            </button>
        </div>
    </div>

    <div id="status-container">
        در حال آماده‌سازی نمایشگر PDF...
    </div>

    <div id="pdf-container"></div>

    <script>
        (function () {
            var pdfDocument = null;

            var receivedChunks = [];
            var receivedChunkCount = 0;
            var expectedChunkCount = 0;

            var currentZoom = 1;
            var renderGeneration = 0;
            var resizeTimer = null;

            var pdfContainer =
                document.getElementById(
                    'pdf-container'
                );

            var statusContainer =
                document.getElementById(
                    'status-container'
                );

            var totalPagesElement =
                document.getElementById(
                    'total-pages'
                );

            var zoomValueElement =
                document.getElementById(
                    'zoom-value'
                );

            var zoomInButton =
                document.getElementById(
                    'zoom-in'
                );

            var zoomOutButton =
                document.getElementById(
                    'zoom-out'
                );

            function showStatus(message) {
                statusContainer.textContent =
                    String(message);

                statusContainer.classList.remove(
                    'hidden'
                );
            }

            function hideStatus() {
                statusContainer.classList.add(
                    'hidden'
                );
            }

            function showError(message) {
                statusContainer.innerHTML = '';

                var errorBox =
                    document.createElement('div');

                errorBox.id =
                    'error-box';

                errorBox.textContent =
                    String(message);

                statusContainer.appendChild(
                    errorBox
                );

                statusContainer.classList.remove(
                    'hidden'
                );

                sendToNative('ERROR', {
                    message:
                        String(message)
                });
            }

            function base64ToBytes(base64Value) {
                var binaryString =
                    window.atob(base64Value);

                var bytes =
                    new Uint8Array(
                        binaryString.length
                    );

                var index;

                for (
                    index = 0;
                    index < binaryString.length;
                    index += 1
                ) {
                    bytes[index] =
                        binaryString.charCodeAt(
                            index
                        );
                }

                return bytes;
            }

            function mergeByteChunks(chunks) {
                var totalLength = 0;
                var offset = 0;
                var index;

                for (
                    index = 0;
                    index < chunks.length;
                    index += 1
                ) {
                    totalLength +=
                        chunks[index].length;
                }

                var result =
                    new Uint8Array(totalLength);

                for (
                    index = 0;
                    index < chunks.length;
                    index += 1
                ) {
                    result.set(
                        chunks[index],
                        offset
                    );

                    offset +=
                        chunks[index].length;
                }

                return result;
            }

            function getOutputScale(viewport) {
                var deviceScale =
                    Math.min(
                        window.devicePixelRatio || 1,
                        2
                    );

                var maximumPixels =
                    16000000;

                var pagePixels =
                    viewport.width *
                    viewport.height *
                    deviceScale *
                    deviceScale;

                if (
                    pagePixels <=
                    maximumPixels
                ) {
                    return deviceScale;
                }

                return Math.max(
                    1,
                    Math.sqrt(
                        maximumPixels /
                        (
                            viewport.width *
                            viewport.height
                        )
                    )
                );
            }

            async function renderAllPages() {
                if (!pdfDocument) {
                    return;
                }

                var activeGeneration =
                    ++renderGeneration;

                var oldDocumentHeight =
                    Math.max(
                        document.documentElement.scrollHeight,
                        document.body.scrollHeight,
                        1
                    );

                var oldScrollRatio =
                    window.scrollY /
                    oldDocumentHeight;

                var screenWidth =
                    document.documentElement.clientWidth ||
                    window.innerWidth ||
                    320;

                var availableWidth =
                    Math.max(
                        screenWidth - 16,
                        280
                    );

                var pageNumber;

                zoomInButton.disabled =
                    true;

                zoomOutButton.disabled =
                    true;

                pdfContainer.innerHTML = '';

                showStatus(
                    'در حال نمایش صفحات PDF...'
                );

                try {
                    for (
                        pageNumber = 1;
                        pageNumber <= pdfDocument.numPages;
                        pageNumber += 1
                    ) {
                        if (
                            activeGeneration !==
                            renderGeneration
                        ) {
                            return;
                        }

                        var page =
                            await pdfDocument.getPage(
                                pageNumber
                            );

                        var originalViewport =
                            page.getViewport({
                                scale: 1
                            });

                        var fitScale =
                            availableWidth /
                            originalViewport.width;

                        var viewport =
                            page.getViewport({
                                scale:
                                    fitScale *
                                    currentZoom
                            });

                        var outputScale =
                            getOutputScale(
                                viewport
                            );

                        var pageWrapper =
                            document.createElement(
                                'div'
                            );

                        var canvas =
                            document.createElement(
                                'canvas'
                            );

                        var canvasContext =
                            canvas.getContext(
                                '2d',
                                {
                                    alpha: false
                                }
                            );

                        if (!canvasContext) {
                            throw new Error(
                                'Canvas در WebView در دسترس نیست.'
                            );
                        }

                        pageWrapper.className =
                            'pdf-page';

                        canvas.width =
                            Math.max(
                                1,
                                Math.floor(
                                    viewport.width *
                                    outputScale
                                )
                            );

                        canvas.height =
                            Math.max(
                                1,
                                Math.floor(
                                    viewport.height *
                                    outputScale
                                )
                            );

                        canvas.style.width =
                            Math.floor(
                                viewport.width
                            ) + 'px';

                        canvas.style.height =
                            Math.floor(
                                viewport.height
                            ) + 'px';

                        pageWrapper.appendChild(
                            canvas
                        );

                        pdfContainer.appendChild(
                            pageWrapper
                        );

                        var renderContext = {
                            canvasContext:
                                canvasContext,

                            viewport:
                                viewport
                        };

                        if (outputScale !== 1) {
                            renderContext.transform = [
                                outputScale,
                                0,
                                0,
                                outputScale,
                                0,
                                0
                            ];
                        }

                        await page.render(
                            renderContext
                        ).promise;
                    }

                    if (
                        activeGeneration !==
                        renderGeneration
                    ) {
                        return;
                    }

                    hideStatus();

                    window.requestAnimationFrame(
                        function () {
                            var newDocumentHeight =
                                Math.max(
                                    document.documentElement.scrollHeight,
                                    document.body.scrollHeight,
                                    1
                                );

                            window.scrollTo(
                                0,
                                oldScrollRatio *
                                newDocumentHeight
                            );
                        }
                    );

                    sendToNative('RENDERED', {
                        pages:
                            pdfDocument.numPages
                    });
                } catch (error) {
                    console.error(
                        'PDF render error:',
                        error
                    );

                    showError(
                        error && error.message
                            ? error.message
                            : 'نمایش PDF ناموفق بود.'
                    );
                } finally {
                    if (
                        activeGeneration ===
                        renderGeneration
                    ) {
                        zoomInButton.disabled =
                            false;

                        zoomOutButton.disabled =
                            false;
                    }
                }
            }

            async function openPdf(pdfBytes) {
                try {
                    showStatus(
                        'در حال پردازش فونت‌ها و صفحات PDF...'
                    );

                    var loadingTask =
                        window.pdfjsLib.getDocument({
                            data:
                                pdfBytes,

                            cMapUrl:
                                '${PDF_CMAP_URL}',

                            cMapPacked:
                                true,

                            standardFontDataUrl:
                                '${PDF_STANDARD_FONTS_URL}',

                            useSystemFonts:
                                true,

                            disableFontFace:
                                false,

                            useWorkerFetch:
                                true,

                            stopAtErrors:
                                false,

                            fontExtraProperties:
                                true
                        });

                    loadingTask.onPassword =
                        function () {
                            showError(
                                'این فایل PDF دارای رمز عبور است.'
                            );
                        };

                    pdfDocument =
                        await loadingTask.promise;

                    totalPagesElement.textContent =
                        String(
                            pdfDocument.numPages
                        );

                    await renderAllPages();
                } catch (error) {
                    console.error(
                        'PDF open error:',
                        error
                    );

                    showError(
                        error && error.message
                            ? error.message
                            : 'فایل PDF قابل پردازش نیست.'
                    );
                }
            }

            window.receivePdfChunk = function (
                base64Value,
                chunkIndex,
                totalChunks
            ) {
                try {
                    if (
                        !Number.isInteger(chunkIndex) ||
                        !Number.isInteger(totalChunks) ||
                        chunkIndex < 0 ||
                        totalChunks <= 0 ||
                        chunkIndex >= totalChunks
                    ) {
                        throw new Error(
                            'اطلاعات بخش PDF معتبر نیست.'
                        );
                    }

                    if (
                        expectedChunkCount !==
                            totalChunks ||
                        receivedChunks.length !==
                            totalChunks
                    ) {
                        receivedChunks =
                            new Array(totalChunks);

                        receivedChunkCount =
                            0;

                        expectedChunkCount =
                            totalChunks;
                    }

                    if (
                        !receivedChunks[
                            chunkIndex
                        ]
                    ) {
                        receivedChunks[
                            chunkIndex
                        ] =
                            base64ToBytes(
                                base64Value
                            );

                        receivedChunkCount +=
                            1;
                    }

                    sendToNative(
                        'CHUNK_RECEIVED',
                        {
                            index:
                                chunkIndex
                        }
                    );

                    if (
                        receivedChunkCount ===
                        expectedChunkCount
                    ) {
                        var completeBytes =
                            mergeByteChunks(
                                receivedChunks
                            );

                        receivedChunks = [];
                        receivedChunkCount = 0;
                        expectedChunkCount = 0;

                        openPdf(
                            completeBytes
                        );
                    }
                } catch (error) {
                    console.error(
                        'PDF chunk error:',
                        error
                    );

                    showError(
                        error && error.message
                            ? error.message
                            : 'انتقال اطلاعات PDF ناموفق بود.'
                    );
                }
            };

            function changeZoom(changeAmount) {
                if (!pdfDocument) {
                    return;
                }

                var nextZoom =
                    Math.max(
                        0.5,
                        Math.min(
                            currentZoom +
                            changeAmount,
                            2.5
                        )
                    );

                if (
                    nextZoom ===
                    currentZoom
                ) {
                    return;
                }

                currentZoom =
                    nextZoom;

                zoomValueElement.textContent =
                    Math.round(
                        currentZoom * 100
                    ) + '%';

                renderAllPages();
            }

            zoomInButton.addEventListener(
                'click',
                function () {
                    changeZoom(0.25);
                }
            );

            zoomOutButton.addEventListener(
                'click',
                function () {
                    changeZoom(-0.25);
                }
            );

            window.addEventListener(
                'resize',
                function () {
                    clearTimeout(
                        resizeTimer
                    );

                    resizeTimer =
                        setTimeout(
                            function () {
                                if (
                                    pdfDocument
                                ) {
                                    renderAllPages();
                                }
                            },
                            300
                        );
                }
            );

            if (!window.pdfjsLib) {
                showError(
                    'کتابخانه PDF.js بارگذاری نشد.'
                );

                return;
            }

            window.pdfjsLib
                .GlobalWorkerOptions
                .workerSrc =
                    '${PDF_WORKER_URL}';

            sendToNative('READY');
        })();
    </script>
</body>
</html>
`;

const createPdfUrl = filePath => {
    if (!filePath) {
        return null;
    }

    const normalizedPath =
        String(filePath).trim();

    if (!normalizedPath) {
        return null;
    }

    if (
        /^https?:\/\//i.test(
            normalizedPath
        )
    ) {
        return encodeURI(
            normalizedPath
        );
    }

    const normalizedBaseUrl =
        String(dlUrl || '')
            .trim()
            .replace(/\/+$/, '');

    const normalizedRelativePath =
        normalizedPath.replace(
            /^\/+/,
            ''
        );

    if (
        !normalizedBaseUrl ||
        !normalizedRelativePath
    ) {
        return null;
    }

    return encodeURI(
        `${normalizedBaseUrl}/${normalizedRelativePath}`
    );
};

const SamplePDFReader = ({ route }) => {
    const webViewRef =
        useRef(null);

    const isMountedRef =
        useRef(true);

    const activeSessionRef =
        useRef(0);

    const viewerReadyRef =
        useRef(false);

    const fileReadyRef =
        useRef(false);

    const cachedFileUriRef =
        useRef(null);

    const fileSizeRef =
        useRef(0);

    const totalChunksRef =
        useRef(0);

    const nextChunkIndexRef =
        useRef(0);

    const awaitingChunkAckRef =
        useRef(false);

    const ackTimerRef =
        useRef(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [reloadToken, setReloadToken] =
        useState(0);

    const sampleFile =
        route?.params
            ?.sample_files?.[0];

    const { i18n } =
        useTranslation();

    const lang =
        i18n.resolvedLanguage ||
        i18n.language ||
        'en';

    const NewStyles = useNewStyles(lang);
    const { colors } = useAppTheme();
    const themedStyles = useMemo(() => getSampleReaderStyles(colors), [colors]);
    // Update only the blank workspace around PDF pages, never page canvases.
    // injectJavaScript avoids recreating the WebView and losing its state.
    const syncReaderChromeTheme = useCallback(() => {
        webViewRef.current?.injectJavaScript(`
            document.documentElement.style.backgroundColor = ${JSON.stringify(colors.background === '#121212' ? '#121212' : '#e9e9e9')};
            if (document.body) document.body.style.backgroundColor = ${JSON.stringify(colors.background === '#121212' ? '#121212' : '#e9e9e9')};
            var status = document.getElementById('status-container');
            if (status) {
                status.style.backgroundColor = ${JSON.stringify(colors.background === '#121212' ? '#121212' : '#e9e9e9')};
                status.style.color = ${JSON.stringify(colors.background === '#121212' ? '#F5F5F5' : '#444444')};
            }
            true;
        `);
    }, [colors]);
    useEffect(() => { syncReaderChromeTheme(); }, [syncReaderChromeTheme]);

    const pdfUrl =
        useMemo(
            () =>
                createPdfUrl(
                    sampleFile?.file_path
                ),
            [sampleFile?.file_path]
        );

    const clearAckTimer =
        useCallback(() => {
            if (
                ackTimerRef.current
            ) {
                clearTimeout(
                    ackTimerRef.current
                );

                ackTimerRef.current =
                    null;
            }
        }, []);

    const removeCachedFile =
        useCallback(
            async uri => {
                const targetUri =
                    uri ||
                    cachedFileUriRef.current;

                if (!targetUri) {
                    return;
                }

                if (
                    cachedFileUriRef.current ===
                    targetUri
                ) {
                    cachedFileUriRef.current =
                        null;
                }

                try {
                    await FileSystem.deleteAsync(
                        targetUri,
                        {
                            idempotent: true,
                        }
                    );
                } catch (
                    deleteError
                ) {
                    console.warn(
                        'PDF cache cleanup error:',
                        deleteError
                    );
                }
            },
            []
        );

    const resetTransfer =
        useCallback(() => {
            clearAckTimer();

            viewerReadyRef.current =
                false;

            fileReadyRef.current =
                false;

            fileSizeRef.current =
                0;

            totalChunksRef.current =
                0;

            nextChunkIndexRef.current =
                0;

            awaitingChunkAckRef.current =
                false;
        }, [clearAckTimer]);

    const handleTransferError =
        useCallback(
            async message => {
                clearAckTimer();

                awaitingChunkAckRef.current =
                    false;

                if (
                    isMountedRef.current
                ) {
                    setError(
                        message ||
                        'انتقال PDF ناموفق بود.'
                    );

                    setLoading(false);
                }

                await removeCachedFile();
            },
            [
                clearAckTimer,
                removeCachedFile,
            ]
        );

    const sendNextChunk =
        useCallback(
            async () => {
                const currentSession =
                    activeSessionRef.current;

                if (
                    !viewerReadyRef.current ||
                    !fileReadyRef.current ||
                    awaitingChunkAckRef.current
                ) {
                    return;
                }

                const webView =
                    webViewRef.current;

                const fileUri =
                    cachedFileUriRef.current;

                const fileSize =
                    fileSizeRef.current;

                const totalChunks =
                    totalChunksRef.current;

                const chunkIndex =
                    nextChunkIndexRef.current;

                if (
                    !webView ||
                    !fileUri ||
                    fileSize <= 0 ||
                    totalChunks <= 0
                ) {
                    return;
                }

                if (
                    chunkIndex >=
                    totalChunks
                ) {
                    return;
                }

                awaitingChunkAckRef.current =
                    true;

                try {
                    const position =
                        chunkIndex *
                        PDF_CHUNK_SIZE;

                    const length =
                        Math.min(
                            PDF_CHUNK_SIZE,
                            fileSize - position
                        );

                    if (length <= 0) {
                        throw new Error(
                            'اندازه بخش PDF نامعتبر است.'
                        );
                    }

                    const base64Chunk =
                        await FileSystem
                            .readAsStringAsync(
                                fileUri,
                                {
                                    encoding:
                                        FileSystem
                                            .EncodingType
                                            .Base64,

                                    position,
                                    length,
                                }
                            );

                    if (
                        !isMountedRef.current ||
                        currentSession !==
                            activeSessionRef.current
                    ) {
                        awaitingChunkAckRef.current =
                            false;

                        return;
                    }

                    if (!base64Chunk) {
                        throw new Error(
                            'خواندن فایل PDF ناموفق بود.'
                        );
                    }

                    const currentWebView =
                        webViewRef.current;

                    if (!currentWebView) {
                        throw new Error(
                            'WebView در دسترس نیست.'
                        );
                    }

                    const injectedScript = `
                        if (
                            typeof window.receivePdfChunk ===
                            'function'
                        ) {
                            window.receivePdfChunk(
                                ${JSON.stringify(base64Chunk)},
                                ${chunkIndex},
                                ${totalChunks}
                            );
                        }

                        true;
                    `;

                    currentWebView.injectJavaScript(
                        injectedScript
                    );

                    clearAckTimer();

                    ackTimerRef.current =
                        setTimeout(() => {
                            if (
                                !isMountedRef.current ||
                                currentSession !==
                                    activeSessionRef.current ||
                                !awaitingChunkAckRef.current
                            ) {
                                return;
                            }

                            handleTransferError(
                                'پاسخی از نمایشگر PDF دریافت نشد.'
                            );
                        }, 12000);
                } catch (
                    chunkError
                ) {
                    console.error(
                        'PDF chunk send error:',
                        chunkError
                    );

                    await handleTransferError(
                        chunkError?.message ||
                        'ارسال PDF به WebView ناموفق بود.'
                    );
                }
            },
            [
                clearAckTimer,
                handleTransferError,
            ]
        );

    useEffect(() => {
        CaptureProtection.prevent();

        return () => {
            CaptureProtection.allow();
        };
    }, []);

    useEffect(() => {
        isMountedRef.current =
            true;

        return () => {
            isMountedRef.current =
                false;

            activeSessionRef.current +=
                1;

            clearAckTimer();

            removeCachedFile();
        };
    }, [
        clearAckTimer,
        removeCachedFile,
    ]);

    useEffect(() => {
        let cancelled =
            false;

        const sessionId =
            activeSessionRef.current +
            1;

        activeSessionRef.current =
            sessionId;

        resetTransfer();

        setLoading(true);
        setError('');

        const preparePdf =
            async () => {
                await removeCachedFile();

                if (
                    cancelled ||
                    !isMountedRef.current ||
                    sessionId !==
                        activeSessionRef.current
                ) {
                    return;
                }

                if (!pdfUrl) {
                    setError(
                        'آدرس فایل PDF معتبر نیست.'
                    );

                    setLoading(false);
                    return;
                }

                if (
                    !FileSystem.cacheDirectory
                ) {
                    setError(
                        'حافظه موقت برنامه در دسترس نیست.'
                    );

                    setLoading(false);
                    return;
                }

                const randomPart =
                    Math.random()
                        .toString(36)
                        .slice(2);

                const targetUri =
                    FileSystem.cacheDirectory +
                    `sample-pdf-${Date.now()}-${randomPart}.pdf`;

                cachedFileUriRef.current =
                    targetUri;

                try {
                    const downloadResult =
                        await FileSystem.downloadAsync(
                            pdfUrl,
                            targetUri,
                            {
                                headers: {
                                    Accept:
                                        'application/pdf',
                                },
                            }
                        );

                    if (
                        cancelled ||
                        !isMountedRef.current ||
                        sessionId !==
                            activeSessionRef.current
                    ) {
                        await removeCachedFile(
                            downloadResult.uri ||
                            targetUri
                        );

                        return;
                    }

                    if (
                        downloadResult.status <
                            200 ||
                        downloadResult.status >=
                            300
                    ) {
                        throw new Error(
                            `دانلود PDF ناموفق بود. کد پاسخ: ${downloadResult.status}`
                        );
                    }

                    const fileInfo =
                        await FileSystem.getInfoAsync(
                            downloadResult.uri,
                            {
                                size: true,
                            }
                        );

                    if (
                        cancelled ||
                        !isMountedRef.current ||
                        sessionId !==
                            activeSessionRef.current
                    ) {
                        await removeCachedFile(
                            downloadResult.uri
                        );

                        return;
                    }

                    if (
                        !fileInfo.exists ||
                        fileInfo.isDirectory
                    ) {
                        throw new Error(
                            'فایل دانلودشده معتبر نیست.'
                        );
                    }

                    if (
                        !fileInfo.size ||
                        fileInfo.size <= 0
                    ) {
                        throw new Error(
                            'فایل PDF خالی است.'
                        );
                    }

                    cachedFileUriRef.current =
                        downloadResult.uri;

                    fileSizeRef.current =
                        fileInfo.size;

                    totalChunksRef.current =
                        Math.ceil(
                            fileInfo.size /
                            PDF_CHUNK_SIZE
                        );

                    nextChunkIndexRef.current =
                        0;

                    fileReadyRef.current =
                        true;

                    sendNextChunk();
                } catch (
                    downloadError
                ) {
                    console.error(
                        'PDF download error:',
                        downloadError
                    );

                    await removeCachedFile(
                        targetUri
                    );

                    if (
                        cancelled ||
                        !isMountedRef.current ||
                        sessionId !==
                            activeSessionRef.current
                    ) {
                        return;
                    }

                    setError(
                        downloadError?.message ||
                        'دریافت فایل PDF ناموفق بود.'
                    );

                    setLoading(false);
                }
            };

        preparePdf();

        return () => {
            cancelled =
                true;

            clearAckTimer();
        };
    }, [
        pdfUrl,
        reloadToken,
        clearAckTimer,
        removeCachedFile,
        resetTransfer,
        sendNextChunk,
    ]);

    const handleWebViewMessage =
        useCallback(
            event => {
                const rawMessage =
                    event?.nativeEvent?.data;

                if (!rawMessage) {
                    return;
                }

                let message;

                try {
                    message =
                        JSON.parse(
                            rawMessage
                        );
                } catch (
                    parseError
                ) {
                    console.warn(
                        'Invalid PDF WebView message:',
                        rawMessage
                    );

                    return;
                }

                switch (
                    message?.type
                ) {
                    case 'READY':
                        viewerReadyRef.current =
                            true;

                        sendNextChunk();
                        break;

                    case 'CHUNK_RECEIVED': {
                        const receivedIndex =
                            Number(
                                message
                                    ?.payload
                                    ?.index
                            );

                        if (
                            !Number.isInteger(
                                receivedIndex
                            )
                        ) {
                            return;
                        }

                        if (
                            receivedIndex !==
                            nextChunkIndexRef.current
                        ) {
                            return;
                        }

                        clearAckTimer();

                        awaitingChunkAckRef.current =
                            false;

                        nextChunkIndexRef.current +=
                            1;

                        sendNextChunk();
                        break;
                    }

                    case 'RENDERED':
                        clearAckTimer();

                        awaitingChunkAckRef.current =
                            false;

                        setLoading(false);
                        setError('');

                        removeCachedFile();
                        break;

                    case 'SCRIPT_WARNING':
                        console.warn(
                            'PDF.js cross-origin script warning:',
                            message?.payload
                        );
                        break;

                    case 'ERROR':
                        console.error(
                            'PDF.js viewer error:',
                            message?.payload
                        );

                        clearAckTimer();

                        awaitingChunkAckRef.current =
                            false;

                        setError(
                            message
                                ?.payload
                                ?.message ||
                            'نمایش فایل PDF ناموفق بود.'
                        );

                        setLoading(false);

                        removeCachedFile();
                        break;

                    default:
                        break;
                }
            },
            [
                clearAckTimer,
                removeCachedFile,
                sendNextChunk,
            ]
        );

    const handleWebViewError =
        useCallback(
            event => {
                console.error(
                    'PDF WebView error:',
                    event?.nativeEvent
                );

                clearAckTimer();

                setError(
                    event
                        ?.nativeEvent
                        ?.description ||
                    'اجرای WebView ناموفق بود.'
                );

                setLoading(false);

                removeCachedFile();
            },
            [
                clearAckTimer,
                removeCachedFile,
            ]
        );

    const handleRetry =
        useCallback(() => {
            setReloadToken(
                currentValue =>
                    currentValue + 1
            );
        }, []);

    return (
        <SafeAreaView
            style={NewStyles.container}
            edges={['bottom']}
        >
            <View style={themedStyles.container}>
                <WebView
                    key={`${pdfUrl || 'empty'}-${reloadToken}`}
                    ref={webViewRef}
                    source={{
                        html: PDF_VIEWER_HTML,
                    }}
                    originWhitelist={['*']}
                    style={themedStyles.webView}
                    javaScriptEnabled
                    domStorageEnabled
                    cacheEnabled
                    setSupportMultipleWindows={false}
                    mixedContentMode="never"
                    androidLayerType="hardware"
                    overScrollMode="never"
                    allowsInlineMediaPlayback
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    onMessage={handleWebViewMessage}
                    onLoadEnd={syncReaderChromeTheme}
                    onError={handleWebViewError}
                    onContentProcessDidTerminate={
                        handleRetry
                    }
                />

                {loading && !error ? (
                    <View
                        style={
                            themedStyles.loadingOverlay
                        }
                    >
                        <ActivityIndicator
                            size="large"
                            color="#27187e"
                        />

                        <Text
                            style={
                                themedStyles.loadingText
                            }
                        >
                            در حال آماده‌سازی فایل PDF...
                        </Text>
                    </View>
                ) : null}

                {error ? (
                    <View
                        style={
                            themedStyles.errorOverlay
                        }
                    >
                        <Text
                            style={
                                themedStyles.errorTitle
                            }
                        >
                            نمایش فایل ناموفق بود
                        </Text>

                        <Text
                            style={
                                themedStyles.errorText
                            }
                        >
                            {error}
                        </Text>

                        <Pressable
                            style={
                                themedStyles.retryButton
                            }
                            onPress={
                                handleRetry
                            }
                        >
                            <Text
                                style={
                                    themedStyles.retryButtonText
                                }
                            >
                                تلاش مجدد
                            </Text>
                        </Pressable>
                    </View>
                ) : null}
            </View>
        </SafeAreaView>
    );
};

export default SamplePDFReader;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e9e9e9',
    },

    webView: {
        flex: 1,
        backgroundColor: '#e9e9e9',
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,

        zIndex: 20,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#ffffff',
    },

    loadingText: {
        marginTop: 12,

        color: '#444444',

        fontSize: 14,
        textAlign: 'center',
    },

    errorOverlay: {
        ...StyleSheet.absoluteFillObject,

        zIndex: 30,

        alignItems: 'center',
        justifyContent: 'center',

        paddingHorizontal: 24,

        backgroundColor: '#ffffff',
    },

    errorTitle: {
        marginBottom: 10,

        color: '#b42318',

        fontSize: 17,
        fontWeight: '700',
        textAlign: 'center',
    },

    errorText: {
        color: '#555555',

        fontSize: 14,
        lineHeight: 24,
        textAlign: 'center',
    },

    retryButton: {
        minWidth: 130,

        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: '#27187e',
        borderRadius: 10,
    },

    retryButtonText: {
        color: '#ffffff',

        fontSize: 14,
        fontWeight: '700',
    },
});
// Original PDF pages and annotation canvas keep their authored colors.
// The host screen, loading and error overlays alone respond to Dark mode.
const getSampleReaderStyles = (colors) => colors.background === '#121212'
    ? StyleSheet.create({
        ...styles,
        container: { ...styles.container, backgroundColor: colors.background },
        webView: { ...styles.webView, backgroundColor: colors.background },
        loadingOverlay: { ...styles.loadingOverlay, backgroundColor: colors.background },
        errorOverlay: { ...styles.errorOverlay, backgroundColor: colors.background },
        loadingText: { ...styles.loadingText, color: colors.textSecondary },
        errorText: { ...styles.errorText, color: colors.textSecondary },
    })
    : styles;

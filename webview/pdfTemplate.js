export const getPdfHtml = ({ highlights }) =>
    `
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
            color: transparent !important;
            border-radius: 2px;
        }
        .highlight-mode-active .text-layer > span {
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
        const highlightModeIndicator = document.getElementById('highlight-mode-indicator');
        let selectedSpans = [];

        // Highlight mode state
        let isHighlightMode = false;
        let highlightColor = '#ffeb3b';

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
            const text = span.textContent;
            
            // Check if already highlighted - toggle off
            if (span.classList.contains('highlight')) {
                span.classList.remove('highlight');
                span.style.backgroundColor = '';
                
                // Remove from highlights array
                highlights = highlights.filter(h => !(h.page === pageNum && h.spanIndex === spanIndex));
            } else {
                // Add highlight
                span.classList.add('highlight');
                span.style.backgroundColor = highlightColor;
                
                // Save highlight data with color
                const highlightData = {
                    page: pageNum,
                    text: text,
                    spanIndex: spanIndex,
                    color: highlightColor
                };
                highlights.push(highlightData);
            }
            
            // Send highlights to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SAVE_HIGHLIGHTS',
                highlights: highlights
            }));
        }

        // Track selection
        document.addEventListener('selectionchange', () => {
            if (isHighlightMode) return; // Don't show selection toolbar in highlight mode
            
            const selection = window.getSelection();
            const hasSelection = selection && selection.toString().trim().length > 0;
            
            if (hasSelection) {
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
            
            // Notify React Native about selection state
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'TEXT_SELECTED',
                hasSelection: hasSelection
            }));
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
                span.style.backgroundColor = hexToRgba(highlightColor, 0.4);
                
                // Save highlight data with color
                const pageWrapper = span.closest('.page-wrapper');
                const pageNum = pageWrapper ? pageWrapper.dataset.page : 0;
                const spanIndex = span.dataset.index || Array.from(span.parentNode.children).indexOf(span);
                const highlightData = {
                    page: parseInt(pageNum),
                    text: span.textContent,
                    spanIndex: parseInt(spanIndex),
                    color: highlightColor
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
                let span = pageWrapper.querySelector('.text-layer span[data-index="' + h.spanIndex + '"]');
                if (!span && spans[h.spanIndex]) {
                    span = spans[h.spanIndex];
                }
                if (span) {
                    span.classList.add('highlight');
                    // Apply saved color with opacity or default
                    const color = h.color || '#ffeb3b';
                    span.style.backgroundColor = hexToRgba(color, 0.4);
                    
                    // Add click handler for highlight mode
                    span.addEventListener('click', function(e) {
                        if (isHighlightMode) {
                            e.stopPropagation();
                            handleSpanClick(span, pageNum);
                        }
                    });
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
                
                // Add click handler for highlight mode
                span.addEventListener('click', function(e) {
                    if (isHighlightMode) {
                        e.stopPropagation();
                        handleSpanClick(span, pageNum);
                    }
                });
                
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
`
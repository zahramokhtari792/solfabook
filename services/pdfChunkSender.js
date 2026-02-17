export const sendPdfInChunks = async (webViewRef, base64) => {
  const CHUNK_SIZE = 500 * 1024
  const totalChunks = Math.ceil(base64.length / CHUNK_SIZE)

  webViewRef.current?.injectJavaScript(`
    window.pdfChunks = [];
    window.totalChunks = ${totalChunks};
    window.receivedChunks = 0;
  `)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = start + CHUNK_SIZE
    const chunk = base64.substring(start, end)

    const escaped = chunk.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

    webViewRef.current?.injectJavaScript(`
      window.pdfChunks.push('${escaped}');
      window.receivedChunks++;
      if (window.receivedChunks === window.totalChunks) {
        const full = window.pdfChunks.join('');
        window.loadPDFFromBase64(full);
      }
    `)

    await new Promise(r => setTimeout(r, 50))
  }
}

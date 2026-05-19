const fallbackCopyToClipboard = async (text) => {
  if (!text) {
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  }
};

export const shareContent = async (options = {}) => {
  const { title, message, originalUrl, fileUri } = options;
  const url = originalUrl || fileUri;

  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({
      title,
      text: message,
      url,
    });
    return;
  }

  await fallbackCopyToClipboard(url || message);

  if (url && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
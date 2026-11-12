export function safeApplyUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (/(^|\.)example\.com$/i.test(url.hostname)) return null;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1') return null;
    return url.href;
  } catch {
    return null;
  }
}

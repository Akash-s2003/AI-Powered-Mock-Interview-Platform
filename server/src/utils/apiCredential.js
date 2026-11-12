/**
 * API tokens passed in HTTP headers must be ByteString-compatible ASCII.
 * A masked display such as `sk-liv••••YhxF` contains U+2022 and makes fetch() throw.
 */
export function isHeaderSafeCredential(value) {
  return typeof value === 'string' && value.length > 0 && /^[\x21-\x7E]+$/.test(value);
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { isHeaderSafeCredential } from '../src/utils/apiCredential.js';

test('accepts a complete ASCII API token', () => {
  assert.equal(isHeaderSafeCredential('sk-live-abc123XYZ'), true);
});
test('rejects masked API keys containing Unicode bullets', () => {
  assert.equal(isHeaderSafeCredential('sk-liv••••••YhxF'), false);
});
test('rejects spaces and non-ASCII characters in header credentials', () => {
  assert.equal(isHeaderSafeCredential('api key'), false);
  assert.equal(isHeaderSafeCredential('clé75'), false);
});

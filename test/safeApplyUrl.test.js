import test from 'node:test';
import assert from 'node:assert/strict';
import { safeApplyUrl } from '../src/utils/safeApplyUrl.js';

test('accepts HTTPS employer application URLs', () => {
  assert.equal(safeApplyUrl('https://careers.example.org/jobs/123'), 'https://careers.example.org/jobs/123');
});
test('rejects placeholder example.com URLs', () => {
  assert.equal(safeApplyUrl('https://company.example.com/apply'), null);
});
test('rejects HTTP and malformed URLs', () => {
  assert.equal(safeApplyUrl('http://jobs.example.org/apply'), null);
  assert.equal(safeApplyUrl('not a URL'), null);
});
test('rejects localhost URLs', () => {
  assert.equal(safeApplyUrl('https://localhost:5000/apply'), null);
});

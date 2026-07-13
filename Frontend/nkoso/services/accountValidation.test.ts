import assert from 'node:assert/strict';
import test from 'node:test';

import { isSixDigitCode, passwordsMatch } from './accountValidation';

test('accepts only six numeric digits for verification codes', () => {
  assert.equal(isSixDigitCode('123456'), true);
  assert.equal(isSixDigitCode(' 123456 '), true);
  assert.equal(isSixDigitCode('12345'), false);
  assert.equal(isSixDigitCode('12345a'), false);
  assert.equal(isSixDigitCode('123 456'), false);
});

test('requires matching non-empty passwords', () => {
  assert.equal(passwordsMatch('new-password', 'new-password'), true);
  assert.equal(passwordsMatch('new-password', 'different-password'), false);
  assert.equal(passwordsMatch('', ''), false);
});

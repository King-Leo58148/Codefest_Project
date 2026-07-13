import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProfileUpdate, didMomoChange } from './profileHelpers';

test('compares normalized MoMo values', () => {
  assert.equal(didMomoChange('024 123 4567', '(024) 123-4567'), false);
  assert.equal(didMomoChange('0241234567', '0551234567'), true);
});

test('omits blank profile fields while normalizing a supplied MoMo number', () => {
  assert.deepEqual(buildProfileUpdate({ name: ' Ama ', momoNumber: '024 123 4567', currentPassword: ' ', newPassword: ' ', confirmPassword: ' ' }), { name: 'Ama', momoNumber: '0241234567' });
});

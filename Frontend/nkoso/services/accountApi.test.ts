import assert from 'node:assert/strict';
import test from 'node:test';

import { createAccountApi } from './accountApi';
import { normalizeBackendUser } from './authSession';

const normalizeUser = (user: unknown) => normalizeBackendUser(user as any);

test('signup returns the backend verification response without logging a session', async () => {
  const accountApi = createAccountApi(
    async (path, options) => {
      assert.equal(path, '/auth/signup');
      assert.equal(options?.method, 'POST');
      assert.equal(options?.auth, false);
      assert.deepEqual(JSON.parse(String(options?.body)), {
        name: 'Ama Owner',
        email: 'ama@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: 'OWNER',
      });

      return {
        email: 'ama@example.com',
        verificationRequired: true,
      };
    },
    normalizeUser
  );

  const response = await accountApi.signup(
    '  Ama Owner  ',
    ' ama@example.com ',
    'Password1!',
    'OWNER'
  );

  assert.deepEqual(response, {
    email: 'ama@example.com',
    verificationRequired: true,
    message: undefined,
  });
});

test('ghana card verification respects an explicit backend verified=false result', async () => {
  const accountApi = createAccountApi(
    async () => ({
      verified: false,
      success: true,
    }),
    normalizeUser
  );

  const verified = await accountApi.verifyGhanaCard('GHA-123456789-1', {
    uri: 'file:///ghana-card.jpg',
  });

  assert.equal(verified, false);
});

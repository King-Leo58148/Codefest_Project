// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedSession } from './authSession';

test('builds a mobile auth session from backend login and me endpoint responses', () => {
  const session = buildAuthenticatedSession(
    {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600000,
    },
    {
      id: 42,
      name: 'Ama Owner',
      email: 'ama@example.com',
      role: 'OWNER',
      ghanaCardVerified: true,
      momoVerified: false,
      momoNumber: '0240000000',
    }
  );

  assert.deepEqual(session, {
    token: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600000,
    user: {
      id: '42',
      name: 'Ama Owner',
      email: 'ama@example.com',
      role: 'OWNER',
      isVerified: false,
      ghanaCardVerified: true,
      momoVerified: false,
      momoNumber: '0240000000',
    },
  });
});

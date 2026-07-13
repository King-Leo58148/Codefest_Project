// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedSession, normalizeBackendUser } from './authSession';

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
      emailVerified: true,
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
      emailVerified: true,
      isVerified: false,
      ghanaCardVerified: true,
      momoVerified: false,
      momoNumber: '0240000000',
    },
  });
});

test('normalizeBackendUser preserves an explicit false emailVerified flag', () => {
  const user = normalizeBackendUser({
    id: 7,
    name: 'Kojo Investor',
    email: 'kojo@example.com',
    role: 'INVESTOR',
    emailVerified: false,
  });

  assert.equal(user.emailVerified, false);
});

test('normalizeBackendUser defaults missing emailVerified to true for existing users', () => {
  const user = normalizeBackendUser({
    id: 8,
    name: 'Esi Investor',
    email: 'esi@example.com',
    role: 'INVESTOR',
  });

  assert.equal(user.emailVerified, true);
});

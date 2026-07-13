import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createOwnerDataApi,
  dedupeBids,
  normalizeBid,
} from './ownerData';
import { buildGhanaCardVerificationFormData, type FormDataLike } from './accountApi';

test('normalizes nested backend bid', () => {
  const bid = normalizeBid({
    id: 7,
    investor: { id: 3, name: 'Ama' },
    pitch: { id: 2 },
    amount: 5000,
    returnType: 'equity',
    timelineMonths: '6',
  });

  assert.equal(bid.id, '7');
  assert.equal(bid.investorId, '3');
  assert.equal(bid.investorName, 'Ama');
  assert.equal(bid.pitchId, '2');
  assert.equal(bid.returnType, 'EQUITY');
  assert.equal(bid.timelineMonths, 6);
});

test('deduplicates owner bids across pitch lists', () => {
  const ids = dedupeBids([
    [{ id: '1' } as any],
    [{ id: '1' } as any, { id: '2' } as any],
  ]).map((bid) => bid.id);

  assert.deepEqual(ids, ['1', '2']);
});

test('getOwnerBids keeps successful pitch results when one pitch request fails', async () => {
  const ownerDataApi = createOwnerDataApi(async (path) => {
    if (path === '/api/pitches/mine') {
      return [{ id: 11 }, { id: 22 }];
    }

    if (path === '/api/pitches/11/bids') {
      return [
        { id: 1, amount: 2000, investor: { id: 8, name: 'Ama' }, pitch: { id: 11 } },
        { id: 2, amount: 2500, investor: { id: 9, name: 'Kojo' }, pitch: { id: 11 } },
      ];
    }

    if (path === '/api/pitches/22/bids') {
      throw new Error('pitch failed');
    }

    throw new Error(`Unexpected path: ${path}`);
  });

  const bids = await ownerDataApi.getOwnerBids();

  assert.deepEqual(
    bids.map((bid) => bid.id),
    ['1', '2']
  );
});

test('getOwnerBids throws when every pitch bid request fails', async () => {
  const ownerDataApi = createOwnerDataApi(async (path) => {
    if (path === '/api/pitches/mine') {
      return [{ id: 11 }, { id: 22 }];
    }

    throw new Error('all failed');
  });

  await assert.rejects(() => ownerDataApi.getOwnerBids(), /all failed/);
});

test('ghana card form data builder uses cardNumber and cardImage keys', () => {
  const entries: Array<{ key: string; value: unknown }> = [];
  const fakeFormData: FormDataLike = {
    append(key, value) {
      entries.push({ key, value });
    },
  };

  buildGhanaCardVerificationFormData(
    'GHA-123456789-1',
    {
      uri: 'file:///ghana-card.jpg',
      fileName: 'card.jpg',
      mimeType: 'image/jpeg',
    },
    () => fakeFormData
  );

  assert.deepEqual(
    entries.map((entry) => entry.key),
    ['cardNumber', 'cardImage']
  );
  assert.deepEqual(entries[1]?.value, {
    uri: 'file:///ghana-card.jpg',
    name: 'card.jpg',
    type: 'image/jpeg',
  });
});

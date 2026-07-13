# Task 4 Report: Typed Expo API Adapters and Normalizers

## Changed files

- `Frontend/nkoso/services/accountApi.ts`
  - Added typed auth/profile adapter helpers for signup email verification, resend, forgot-password, reset-password, restricted profile updates, and Ghana Card multipart upload.
  - Added pure `buildProfileUpdatePayload` and inspectable `buildGhanaCardVerificationFormData` helpers for focused tests.
- `Frontend/nkoso/services/ownerData.ts`
  - Added pure normalizers for backend pitch, bid, deal, and repayment payloads.
  - Added owner-data API helpers for normalized `getMyPitches`, `getMyDeals`, `getOwnerBids`, and owner bid lookup with partial-failure handling and dedupe.
- `Frontend/nkoso/services/ownerData.test.ts`
  - Added `node:test` coverage for nested bid normalization, bid dedupe, partial-failure owner bid aggregation, all-fail owner bid behavior, and Ghana Card FormData keys.
- `Frontend/nkoso/services/api.ts`
  - Rewired the owned API surface through the new adapter/normalizer layer.
  - Added exported `verifySignupEmail`, `resendSignupCode`, `forgotPassword`, `resetPassword`, `updateProfile`, and `getOwnerBids`.
  - Normalized pitch/bid/deal reads so existing consumers keep receiving flattened mobile models.
  - Reworked Ghana Card verification to require multipart data via the new helper.
- `Frontend/nkoso/types/index.ts`
  - Expanded owner-facing enum unions to match backend values.
  - Added `VerificationAsset`, `ProfileUpdateInput`, and optional `emailVerified`.

## Verification workflow

### Focused compile

Command:

```powershell
cd Frontend\nkoso
node_modules\.bin\tsc.cmd --module commonjs --target ES2022 --esModuleInterop --skipLibCheck --outDir .tmp-owner-tests services\ownerData.ts services\accountApi.ts services\ownerData.test.ts
```

First result:

```text
services/ownerData.ts(145,3): error TS2322: Type 'string' is not assignable to type 'Industry'.
```

Fix applied:

- Narrowed the `toTitleCase(...)` helper return type to `Industry`.

Final result:

```text
Exit code 0
```

### Focused Node tests

Command:

```powershell
cd Frontend\nkoso
node .tmp-owner-tests\services\ownerData.test.js
```

Result:

```text
✔ normalizes nested backend bid
✔ deduplicates owner bids across pitch lists
✔ getOwnerBids keeps successful pitch results when one pitch request fails
✔ getOwnerBids throws when every pitch bid request fails
✔ ghana card form data builder uses cardNumber and cardImage keys
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

### Full frontend TypeScript

Command:

```powershell
cd Frontend\nkoso
node_modules\.bin\tsc.cmd --noEmit
```

Result:

```text
Exit code 0
```

## Known blockers / assumptions

- The frontend `updateProfile(...)` adapter is implemented exactly against `PATCH /api/profile`, but this worktree does not currently contain a matching backend controller/service, so that endpoint was type-verified but not live-verified here.
- The existing Expo screens still call `verifyGhanaCard(...)` without an image argument in this branch. To satisfy the multipart requirement, the adapter now throws if no asset is supplied; the screen-side update belongs to the later UI task.
- The backend in this worktree does not expose `GET /api/bids/{id}`, so `getBid(id)` is adapted through the owner-bid aggregation path to keep the current owner bid detail flow usable from the owned service layer.

## Commit

- Commit message: `feat: add account and owner data api adapters`
- Commit hash: `c108081`

## Review fixes

- Updated `Frontend/nkoso/services/api.ts` so `registerUser(...)` now returns the backend signup verification payload and never performs an automatic login for unverified accounts. The function name remains stable for callers during the screen transition.
- Added a typed signup adapter in `Frontend/nkoso/services/accountApi.ts` that preserves backend `email` and `verificationRequired`, with a compatible email fallback only when the backend omits it.
- Hardened Ghana Card verification result handling so an explicit backend `verified: false` (or `success: false`) returns `false` instead of falling through to success.
- Made the public `verifyGhanaCard(...)` contract require a `VerificationAsset` argument instead of accepting an optional argument and throwing at runtime for missing caller input.
- Normalized `emailVerified` in `Frontend/nkoso/services/authSession.ts`, preserving explicit backend `false` and defaulting missing legacy values to `true`.
- Added focused tests in `Frontend/nkoso/services/accountApi.test.ts` and `Frontend/nkoso/services/authSession.test.ts` for the review regressions.

## Review fix verification

### Focused compile

Command:

```powershell
cd Frontend\nkoso
node_modules\.bin\tsc.cmd --module commonjs --target ES2022 --esModuleInterop --skipLibCheck --outDir .tmp-review-fixes services\accountApi.ts services\accountApi.test.ts services\authSession.ts services\authSession.test.ts services\ownerData.ts services\ownerData.test.ts
```

Result:

```text
Exit code 0
```

### Focused Node tests

Commands:

```powershell
cd Frontend\nkoso
node .tmp-review-fixes\services\accountApi.test.js
node .tmp-review-fixes\services\authSession.test.js
node .tmp-review-fixes\services\ownerData.test.js
```

Result:

```text
accountApi.test.js: pass 2, fail 0
authSession.test.js: pass 3, fail 0
ownerData.test.js: pass 5, fail 0
```

### Full frontend TypeScript

Command:

```powershell
cd Frontend\nkoso
node_modules\.bin\tsc.cmd --noEmit
```

Result:

```text
app/(auth)/verify-ghana-card.tsx(32,30): error TS2554: Expected 2 arguments, but got 1.
app/profile/verification.tsx(34,13): error TS2554: Expected 2 arguments, but got 1.
```

Notes:

- These are the expected screen-side call sites for the now-required `verifyGhanaCard(cardNumber, asset)` contract. Per the task split, those files are owned by the separate screen worker and were not modified here.

## Owner takeover status (2026-07-13)

- Inspected the staged service/type/auth-session patch against the four Task 4 review findings and confirmed the owned files now cover each one:
  - `registerUser(...)` no longer auto-logs in after signup and instead returns the signup verification payload.
  - Ghana Card verification honors an explicit backend `verified: false` before considering any fallback success flag.
  - The public `verifyGhanaCard(...)` signature now requires a `VerificationAsset`.
  - `emailVerified` normalization preserves explicit `false` and defaults missing legacy values to `true`.

### Re-run verification

- Focused compile: `Exit code 0`
- Focused tests:
  - `accountApi.test.js`: `pass 2, fail 0`
  - `authSession.test.js`: `pass 3, fail 0`
  - `ownerData.test.js`: `pass 5, fail 0`
- Full frontend TypeScript:
  - `app/(auth)/verify-ghana-card.tsx(32,30): error TS2554: Expected 2 arguments, but got 1.`
  - `app/profile/verification.tsx(34,13): error TS2554: Expected 2 arguments, but got 1.`

Current blocker:

- Full `tsc --noEmit` remains blocked only by the untouched screen call sites that still use the old one-argument Ghana Card API.

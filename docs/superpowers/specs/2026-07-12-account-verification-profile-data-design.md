# Account Verification, Profile, and Owner Data Design

## Goal

Replace inert or placeholder owner-facing flows with backend-backed behavior and add secure email verification for signup and password recovery. The work covers authentication, restricted profile editing, Ghana Card and MoMo verification, owner pitches, incoming bids, and active deals.

## Scope

### Backend

- Add six-digit email verification for new accounts.
- Add six-digit email verification for forgot-password recovery.
- Add authenticated profile updates for display name, password, and MoMo number only.
- Preserve the existing Ghana Card and MoMo verification endpoints.
- Do not change the existing pitch, bid, or deal endpoint paths.

### Expo app

- Connect signup and forgot-password screens to the new email-code endpoints.
- Remove the owner profile header Edit button and Performance row.
- Display personal information and provide an edit action for display name, password, and MoMo number only.
- Require MoMo re-verification whenever the number changes.
- Make the verification status area actionable.
- Upload a Ghana Card image using the backend multipart contract.
- Load owner pitches, incoming bids, and active deals from backend APIs without mock fallbacks.

## Terminology

The requested "username" maps to the existing `User.name` display-name field. Email remains the login identifier and cannot be changed through profile editing.

## Verification Code Architecture

Use one persisted `VerificationCode` model and repository for both flows. Each record contains:

- user or normalized email reference
- hashed six-digit code
- purpose: `SIGNUP_EMAIL` or `PASSWORD_RESET`
- expiration timestamp
- consumed timestamp or consumed flag
- created timestamp
- attempt count

Codes expire after 10 minutes, are single-use, and are scoped by purpose. Issuing a new code invalidates prior unconsumed codes for the same email and purpose. Verification compares hashes rather than storing plaintext codes. A code is invalidated after five failed attempts. A replacement code can be requested no more than once every 60 seconds.

All forgot-password requests return the same public response whether or not the email exists. This prevents account enumeration.

## Authentication Endpoints

### Signup

`POST /auth/signup`

Creates the account with `emailVerified=false`, sends a `SIGNUP_EMAIL` code, and returns a neutral response containing the email and verification-required state. It does not return a login session. Retrying signup for an existing unverified email resends subject to the cooldown without duplicating the account; an existing verified email returns the existing "email already in use" error.

`POST /auth/verify-email`

Request:

```json
{ "email": "user@example.com", "code": "123456" }
```

Marks the account email as verified after validating purpose, expiry, attempts, and consumption.

`POST /auth/resend-verification-code`

Request:

```json
{ "email": "user@example.com" }
```

Issues a replacement signup code subject to throttling.

Login rejects accounts whose email has not been verified, with a stable error message the app can route to the verification screen.

### Forgot password

`POST /auth/forgot-password`

Request:

```json
{ "email": "user@example.com" }
```

Returns a neutral success response and sends a `PASSWORD_RESET` code when the account exists.

`POST /auth/reset-password`

Request:

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "new secure password",
  "confirmPassword": "new secure password"
}
```

Validates the code and password confirmation, updates the encoded password, consumes the code, and invalidates existing refresh tokens for the account.

## Profile Update Contract

`PATCH /api/profile`

Authenticated request with optional fields:

```json
{
  "name": "Updated display name",
  "currentPassword": "required when changing password",
  "newPassword": "optional",
  "confirmPassword": "required with newPassword",
  "momoNumber": "0240000000"
}
```

Rules:

- Email, role, Ghana Card fields, and verification flags cannot be set by this endpoint.
- A password change requires the correct current password and matching new-password confirmation.
- A changed MoMo number is normalized, saved, and sets `momoVerified=false`.
- An unchanged MoMo number preserves its current verification state.
- The response is the updated public user representation.

## Verification Flows

The profile verification summary is pressable and opens `/profile/verification`.

### Ghana Card

The screen requires a valid card number and selected image before submission. The app sends multipart form data to `POST /api/verify/ghana-card` with exact parts:

- `cardNumber`: text
- `cardImage`: selected image file

Successful verification refreshes `/auth/me` and updates the auth store.

### MoMo

The screen posts `{ "momoNumber": "..." }` to `POST /api/verify/momo`. Successful verification refreshes `/auth/me`. Editing the number later returns this flow to Pending until the replacement number is verified.

## Owner Profile UI

- Remove the standalone Edit button in the profile header.
- Keep the profile summary read-only.
- Personal Information opens a detail screen that displays email, role, and verification state.
- An Edit action on that screen enables only display name, password fields, and MoMo number.
- MoMo Account and Ghana Card rows open the verification screen.
- Remove Performance.
- My Pitches routes to the owner pitches tab.
- Active Deals routes to a dedicated owner deals screen.

## Owner Data Flows

All queries use the existing authenticated API client and TanStack Query. Screens show loading, retryable error, empty, and populated states. No mock records are used as fallback data.

### My Pitches

Use `GET /api/pitches/mine`. Normalize backend numeric identifiers to strings and tolerate nullable optional fields in rendering. Records such as "Nkoso Test" returned by the backend are real backend records and must not be replaced with fabricated frontend data.

Pitch creation must follow the actual backend multipart contract:

- `data`: JSON request part matching `PitchRequest`
- `video`: selected video file

After creation, invalidate `['myPitches']`.

### Incoming Bids

The backend `/api/bids/mine` endpoint returns bids placed by the current investor, so it is not correct for the owner Bids tab. The owner flow is:

1. Fetch `GET /api/pitches/mine`.
2. Fetch `GET /api/pitches/{pitchId}/bids` for each owned pitch.
3. Flatten and deduplicate results by bid ID.
4. Normalize nested backend `investor` and `pitch` objects into the mobile bid view model.

Accept and reject call the existing `PUT /api/bids/{bidId}/accept` and `/reject` endpoints. Counter submits the complete `BidRequest` to `/counter`. Successful mutations invalidate owner bids, owner pitches, and owner deals as appropriate. The deal route uses the actual created/fetched deal ID rather than a hard-coded ID.

### Active Deals

Use `GET /api/deals/mine`, filter or group by backend status for the owner view, and route each item to `/deal/{id}`. The screen has no locally fabricated deals.

## Error Handling

- API errors preserve backend messages when safe to display.
- Network failures show retry actions rather than empty states.
- Empty states are shown only after a successful response with no records.
- Verification submissions prevent duplicate requests while pending.
- Code screens support resend cooldown and clearly distinguish expired, invalid, and consumed codes.
- Profile mutations update cached/auth-store user data only after backend success.

## Testing

### Backend

- Signup creates an unverified account and a hashed signup code.
- Unverified accounts cannot log in.
- Correct, expired, incorrect, over-attempted, and consumed code cases.
- Signup codes cannot reset passwords and reset codes cannot verify signup.
- Forgot-password responses do not reveal account existence.
- Password reset encodes the new password and invalidates refresh tokens.
- Profile update allowlist rejects protected-field changes.
- MoMo changes clear verification; unchanged numbers preserve it.

### Frontend

- API adapters normalize nested pitch, bid, deal, and user responses.
- Ghana Card FormData contains `cardNumber` and `cardImage`.
- Signup verification and password-reset requests use the correct endpoints and payloads.
- Owner bid aggregation handles multiple pitches, duplicates, empty lists, and partial request failures.
- Profile navigation and removed controls are verified in rendered tests or browser QA.
- Browser QA covers signup verification, forgot password, profile editing, Ghana Card upload, MoMo re-verification, pitches, bids, and active deals on desktop and mobile-sized viewports.

## Completion Criteria

- No placeholder bid, pitch, or deal records appear when backend results are empty.
- Signup requires successful email-code verification before login.
- Forgot password completes through an emailed six-digit code.
- Profile edits persist through the backend and are restricted to the approved fields.
- Changing MoMo requires successful re-verification.
- Ghana Card verification uploads an image under the documented multipart field.
- Owner pitches, bids, and active deals display actual backend responses with usable loading, error, and empty states.

# Account Verification, Profile, and Owner Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure email-code signup and password recovery, restricted profile editing and identity re-verification, and real backend data for owner pitches, bids, and active deals.

**Architecture:** Spring Boot owns persisted verification codes, email delivery, password/profile mutations, and authorization. The Expo app adds typed API adapters and TanStack Query screens; backend entities are normalized at the API boundary before UI rendering.

**Tech Stack:** Java 21, Spring Boot 3.4.5, Spring Data JPA, Spring Security, JavaMailSender, JUnit 5/Mockito, Expo SDK 54, Expo Router 6, React 19, TanStack Query 5, TypeScript 5.9, Node test runner.

## Global Constraints

- Signup and password reset codes are six digits, hashed at rest, single-use, purpose-scoped, and expire after 10 minutes.
- A code becomes invalid after five failed attempts; resend has a 60-second cooldown.
- `User.name` is the editable display name; email remains the immutable login identifier.
- Profile editing may change only display name, password, and MoMo number.
- Changing MoMo clears `momoVerified` and requires re-verification.
- Ghana Card verification sends multipart parts named `cardNumber` and `cardImage`.
- Owner pitches, bids, and deals have no mock-data fallback.
- Expo web verification runs on `http://localhost:8081`.

---

### Task 1: Persisted Verification Codes and Email Delivery

**Files:**
- Create: `src/main/java/com/codewithlouis/codefest_project/model/VerificationCode.java`
- Create: `src/main/java/com/codewithlouis/codefest_project/model/VerificationPurpose.java`
- Create: `src/main/java/com/codewithlouis/codefest_project/repository/VerificationCodeRepository.java`
- Create: `src/main/java/com/codewithlouis/codefest_project/services/VerificationCodeService.java`
- Create: `src/main/java/com/codewithlouis/codefest_project/configs/TimeConfiguration.java`
- Modify: `src/main/java/com/codewithlouis/codefest_project/services/EmailService.java`
- Test: `src/test/java/com/codewithlouis/codefest_project/services/VerificationCodeServiceTest.java`

**Interfaces:**
- Produces: `issue(String email, VerificationPurpose purpose)`, `consume(String email, VerificationPurpose purpose, String code)`, `sendVerificationCode(String email, String code, VerificationPurpose purpose)`.
- Consumes: `VerificationCodeRepository`, `PasswordEncoder`, `EmailService`, `Clock`.

- [ ] **Step 1: Write failing service tests**

Add tests that fix time with `Clock.fixed`, capture the saved entity, and assert hashed storage, 10-minute expiry, purpose isolation, five-attempt invalidation, one-time consumption, and 60-second resend rejection:

```java
@Test
void issuedCodeIsHashedAndExpiresInTenMinutes() {
    service.issue("user@example.com", VerificationPurpose.SIGNUP_EMAIL);
    VerificationCode saved = codeCaptor.getValue();
    assertFalse(saved.getCodeHash().matches("\\d{6}"));
    assertEquals(now.plusMinutes(10), saved.getExpiresAt());
    verify(emailService).sendVerificationCode(eq("user@example.com"), matches("\\d{6}"), eq(VerificationPurpose.SIGNUP_EMAIL));
}

@Test
void passwordResetCodeCannotVerifySignup() {
    assertThrows(IllegalArgumentException.class,
        () -> service.consume("user@example.com", VerificationPurpose.SIGNUP_EMAIL, "123456"));
}
```

- [ ] **Step 2: Run the tests and confirm RED**

Run: `mvnw.cmd -Dtest=VerificationCodeServiceTest test`

Expected: compilation failure because verification-code classes do not exist.

- [ ] **Step 3: Implement the minimal model, repository, and service**

Use a JPA entity with `email`, `codeHash`, `purpose`, `expiresAt`, `consumedAt`, `createdAt`, and `attemptCount`. Repository methods must select the newest unconsumed code by normalized email and purpose and invalidate earlier records. Generate codes with `SecureRandom`, hash with the configured `PasswordEncoder`, and provide `Clock.systemUTC()` from `TimeConfiguration` for deterministic tests.

Core signatures:

```java
public void issue(String email, VerificationPurpose purpose);
public void consume(String email, VerificationPurpose purpose, String rawCode);
```

- [ ] **Step 4: Add email rendering**

Extend `EmailService` with:

```java
public void sendVerificationCode(String email, String code, VerificationPurpose purpose)
```

Use distinct subjects for account verification and password reset. Do not log the code.

- [ ] **Step 5: Run tests and commit**

Run: `mvnw.cmd -Dtest=VerificationCodeServiceTest test`

Expected: all `VerificationCodeServiceTest` tests pass.

Commit: `feat: add persisted email verification codes`

---

### Task 2: Signup Verification and Password Reset Endpoints

**Files:**
- Modify: `src/main/java/com/codewithlouis/codefest_project/model/User.java`
- Modify: `src/main/java/com/codewithlouis/codefest_project/services/AuthenticationService.java`
- Modify: `src/main/java/com/codewithlouis/codefest_project/controllers/AuthenticationController.java`
- Create: `src/main/java/com/codewithlouis/codefest_project/dto/EmailCodeRequest.java`
- Create: `src/main/java/com/codewithlouis/codefest_project/dto/ForgotPasswordRequest.java`
- Create: `src/main/java/com/codewithlouis/codefest_project/dto/ResetPasswordRequest.java`
- Test: `src/test/java/com/codewithlouis/codefest_project/services/AuthenticationServiceTest.java`
- Test: `src/test/java/com/codewithlouis/codefest_project/controllers/AuthenticationControllerTest.java`

**Interfaces:**
- Consumes: Task 1 `VerificationCodeService`.
- Produces: `/auth/verify-email`, `/auth/resend-verification-code`, `/auth/forgot-password`, `/auth/reset-password`; `User.emailVerified`.

- [ ] **Step 1: Write failing authentication tests**

Cover unverified signup, login rejection, email verification, neutral forgot-password response, password reset confirmation, password encoding, and refresh-token invalidation:

```java
@Test
void loginRejectsUnverifiedEmail() {
    user.setEmailVerified(false);
    assertThrows(IllegalStateException.class, () -> service.login(loginDto));
}

@Test
void resetPasswordConsumesResetCodeAndRevokesRefreshTokens() {
    service.resetPassword(request);
    verify(codeService).consume(email, VerificationPurpose.PASSWORD_RESET, "123456");
    verify(passwordEncoder).encode("NewPassword1!");
    verify(refreshTokenService).deleteByUser(user);
}
```

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `mvnw.cmd -Dtest=AuthenticationServiceTest,AuthenticationControllerTest test`

Expected: compilation failure for the new methods and DTOs.

- [ ] **Step 3: Implement signup and login rules**

Add `emailVerified` to `User` with a database-compatible default of `true` so existing accounts retain access. `signup` explicitly sets new users to `false` and issues `SIGNUP_EMAIL`; an existing unverified email triggers resend, while an existing verified email keeps the existing duplicate-email error. `login` checks `emailVerified` before issuing tokens.

- [ ] **Step 4: Implement public endpoint methods**

Add controller/service methods with exact contracts from the design:

```java
public void verifyEmail(EmailCodeRequest request);
public void resendVerificationCode(ForgotPasswordRequest request);
public void forgotPassword(ForgotPasswordRequest request);
public void resetPassword(ResetPasswordRequest request);
```

Validate six digits and matching passwords with Jakarta validation. Return a neutral message from forgot-password whether the account exists or not.

- [ ] **Step 5: Run tests and commit**

Run: `mvnw.cmd -Dtest=AuthenticationServiceTest,AuthenticationControllerTest test`

Expected: all focused auth tests pass.

Commit: `feat: verify signup email and reset passwords`

---

### Task 3: Restricted Profile Update Backend

**Files:**
- Create: `src/main/java/com/codewithlouis/codefest_project/controllers/ProfileController.java`
- Create: `src/main/java/com/codewithlouis/codefest_project/services/ProfileService.java`
- Create: `src/main/java/com/codewithlouis/codefest_project/dto/ProfileUpdateRequest.java`
- Test: `src/test/java/com/codewithlouis/codefest_project/services/ProfileServiceTest.java`

**Interfaces:**
- Produces: `PATCH /api/profile` returning updated `User`.
- Consumes: `UserRepository`, `PasswordEncoder`, current Spring Security identity.

- [ ] **Step 1: Write failing profile tests**

```java
@Test
void changingMomoClearsVerification() {
    user.setMomoNumber("0240000000");
    user.setMomoVerified(true);
    User updated = service.update(new ProfileUpdateRequest("New Name", null, null, null, "0550000000"));
    assertEquals("0550000000", updated.getMomoNumber());
    assertFalse(updated.isMomoVerified());
}

@Test
void passwordChangeRequiresCurrentPassword() {
    when(passwordEncoder.matches("wrong", user.getPassword())).thenReturn(false);
    assertThrows(IllegalArgumentException.class, () -> service.update(passwordRequest));
}
```

Also assert that unchanged MoMo preserves verification and blank optional values do not erase fields.

- [ ] **Step 2: Run test and confirm RED**

Run: `mvnw.cmd -Dtest=ProfileServiceTest test`

Expected: compilation failure because profile classes do not exist.

- [ ] **Step 3: Implement the allowlisted mutation**

Normalize MoMo to digits, require ten digits, compare before clearing verification, require current password for password changes, and encode the new password. The DTO contains only `name`, `currentPassword`, `newPassword`, `confirmPassword`, and `momoNumber`, preventing protected fields from binding.

- [ ] **Step 4: Run tests and commit**

Run: `mvnw.cmd -Dtest=ProfileServiceTest test`

Expected: all profile tests pass.

Commit: `feat: add restricted profile updates`

---

### Task 4: Typed Expo API Adapters and Normalizers

**Files:**
- Create: `Frontend/nkoso/services/accountApi.ts`
- Create: `Frontend/nkoso/services/ownerData.ts`
- Create: `Frontend/nkoso/services/ownerData.test.ts`
- Modify: `Frontend/nkoso/services/api.ts`
- Modify: `Frontend/nkoso/types/index.ts`

**Interfaces:**
- Produces: `verifySignupEmail`, `resendSignupCode`, `forgotPassword`, `resetPassword`, `updateProfile`, `verifyGhanaCard(cardNumber, asset)`, `getOwnerBids`, normalized `getMyPitches` and `getMyDeals`.
- Consumes: existing `request()` and backend endpoints from Tasks 2-3.

- [ ] **Step 1: Write failing adapter tests**

Use `node:test` to test pure helpers:

```ts
test('normalizes nested backend bid', () => {
  const bid = normalizeBid({ id: 7, investor: { id: 3, name: 'Ama' }, pitch: { id: 2 }, amount: 5000 });
  assert.equal(bid.id, '7');
  assert.equal(bid.investorName, 'Ama');
  assert.equal(bid.pitchId, '2');
});

test('deduplicates owner bids across pitches', () => {
  assert.deepEqual(dedupeBids([[{ id: 1 }], [{ id: 1 }, { id: 2 }]]).map(x => x.id), ['1', '2']);
});
```

Add a FormData builder test that verifies keys `cardNumber` and `cardImage`.

- [ ] **Step 2: Compile and run tests to confirm RED**

Run from `Frontend/nkoso`:

`node_modules\.bin\tsc.cmd --module commonjs --target ES2022 --esModuleInterop --skipLibCheck --outDir .tmp-owner-tests services\ownerData.ts services\ownerData.test.ts`

Expected: compilation failure because `ownerData.ts` does not exist.

- [ ] **Step 3: Implement pure normalizers and API functions**

Normalize numeric IDs, nested `investor`, nested `pitch`, nullable dates, and backend enum strings. `getOwnerBids` calls `getMyPitches()`, fetches bids per pitch with `Promise.allSettled`, throws when every pitch request fails, and otherwise returns deduplicated successful results.

For Ghana Card, append the web/native image asset as:

```ts
form.append('cardNumber', cardNumber);
form.append('cardImage', { uri: asset.uri, name: asset.fileName ?? 'ghana-card.jpg', type: asset.mimeType ?? 'image/jpeg' } as any);
```

- [ ] **Step 4: Run tests and TypeScript**

Run the focused compiled test, then `node_modules\.bin\tsc.cmd --noEmit`.

Expected: focused tests pass and TypeScript exits 0.

- [ ] **Step 5: Commit**

Commit: `feat: add account and owner data api adapters`

---

### Task 5: Signup Verification and Forgot Password Expo Screens

**Files:**
- Create: `Frontend/nkoso/app/(auth)/verify-email.tsx`
- Create: `Frontend/nkoso/app/(auth)/forgot-password.tsx`
- Modify: `Frontend/nkoso/app/(auth)/register.tsx`
- Modify: `Frontend/nkoso/app/(auth)/login.tsx`
- Modify: `Frontend/nkoso/app/(auth)/_layout.tsx`

**Interfaces:**
- Consumes: Task 4 account API functions.
- Produces: signup verification and password-reset user journeys.

- [ ] **Step 1: Add failing navigation/API contract tests where logic is pure**

Extract and test `isSixDigitCode(value)` and `passwordsMatch(newPassword, confirmPassword)` in `services/accountValidation.ts`; verify invalid codes and mismatched passwords fail before API submission.

- [ ] **Step 2: Confirm RED with the focused Node test**

Compile and run `services/accountValidation.test.ts`; expect missing-module failure.

- [ ] **Step 3: Implement signup verification screen**

After successful signup, route to `/(auth)/verify-email?email=...`. The screen uses one six-digit input, verifies, supports a 60-second resend countdown, and routes to login after success.

- [ ] **Step 4: Implement forgot-password screen**

Use two states: email request, then code/new-password confirmation. Always show the same request-success copy. Submit reset only when the code is six digits and passwords match.

- [ ] **Step 5: Wire login and run checks**

Make Forgot Password navigate to the new screen. Run validation tests and `tsc --noEmit`.

Commit: `feat: add email verification and password recovery screens`

---

### Task 6: Profile Editing and Identity Verification Expo Flows

**Files:**
- Modify: `Frontend/nkoso/app/(owner)/profile.tsx`
- Modify: `Frontend/nkoso/app/profile/personal-info.tsx`
- Modify: `Frontend/nkoso/app/profile/verification.tsx`
- Modify: `Frontend/nkoso/app/_layout.tsx`
- Modify: `Frontend/nkoso/store/authStore.ts`

**Interfaces:**
- Consumes: `updateProfile`, `verifyGhanaCard`, `verifyMomo`, `getCurrentUser`.
- Produces: restricted profile edit and re-verification UI.

- [ ] **Step 1: Write failing state-helper tests**

Test a pure `didMomoChange(original, next)` helper and profile payload builder so unchanged blank password fields are omitted and changed MoMo is normalized.

- [ ] **Step 2: Confirm RED**

Compile/run the helper test and expect missing exports.

- [ ] **Step 3: Simplify owner profile navigation**

Remove header Edit and Performance. Route Personal Information to `/profile/personal-info`, both verification rows and summary to `/profile/verification`, My Pitches to `/(owner)/pitches`, and Active Deals to the new deals route from Task 8.

- [ ] **Step 4: Implement restricted edit screen**

Display email and role read-only. Add an Edit mode for display name, current/new/confirm password, and MoMo. Submit only backend-supported fields. On success, update the auth store from the response; if MoMo changed, show Pending and route to verification.

- [ ] **Step 5: Implement Ghana Card image and MoMo verification**

Require an image from Expo Image Picker before Ghana Card submission. Refresh `/auth/me` after either verification succeeds and update `useAuthStore` from that server response.

- [ ] **Step 6: Run tests, TypeScript, and commit**

Expected: helper tests pass; `tsc --noEmit` exits 0.

Commit: `feat: connect profile editing and identity verification`

---

### Task 7: Real Owner Pitches and Incoming Bids

**Files:**
- Modify: `Frontend/nkoso/app/(owner)/pitches.tsx`
- Modify: `Frontend/nkoso/app/(owner)/bids.tsx`
- Modify: `Frontend/nkoso/app/bid/[id].tsx`

**Interfaces:**
- Consumes: Task 4 normalized owner data functions and bid mutations.
- Produces: backend-only pitches and incoming owner bids.

- [ ] **Step 1: Remove all mock imports and local fake mutation state**

Delete `MOCK_BIDS` usage. Keep filters as local UI state, but source cards exclusively from `useQuery({ queryKey: ['ownerBids'], queryFn: getOwnerBids })`.

- [ ] **Step 2: Correct pitch creation multipart payload**

Send a JSON `data` part matching `PitchRequest` and a `video` part. Require video selection because the backend controller requires it. Invalidate `['myPitches']` after success.

- [ ] **Step 3: Wire bid mutations**

Accept and reject call backend endpoints and invalidate `ownerBids`, `myPitches`, and `ownerDeals`. Counter submits the complete current bid terms. Remove the hard-coded `/deal/d1`; after accept, refresh deals and open the deal matching the accepted bid or return to the list with success feedback.

- [ ] **Step 4: Add loading, error, retry, and true empty states**

Do not convert request failure into an empty list. Error states expose a Retry button calling `refetch()`.

- [ ] **Step 5: Run focused adapter tests and TypeScript**

Expected: owner-data tests pass and `tsc --noEmit` exits 0.

Commit: `feat: load owner pitches and bids from backend`

---

### Task 8: Active Deals Screen and End-to-End Verification

**Files:**
- Create: `Frontend/nkoso/app/(owner)/deals.tsx`
- Modify: `Frontend/nkoso/app/(owner)/_layout.tsx`
- Modify: `Frontend/nkoso/app/(owner)/profile.tsx`
- Modify: `Frontend/nkoso/API_DOCUMENTATION.md`

**Interfaces:**
- Consumes: `getMyDeals()` and normalized `Deal` from Task 4.
- Produces: owner active-deals list and final documented API surface.

- [ ] **Step 1: Implement the deals query and screen**

Use `useQuery({ queryKey: ['ownerDeals'], queryFn: getMyDeals })`. Render status, business name, amount, timeline, and signing state; open `/deal/{id}`. Include loading, retryable error, and true empty states.

- [ ] **Step 2: Hide the route from the tab bar**

Register `deals` in owner tabs with `href: null` so it is reachable from Profile but does not add a fifth bottom-tab item.

- [ ] **Step 3: Update API documentation**

Document the new auth/profile endpoints, six-digit code rules, exact Ghana Card multipart fields, and owner-bid aggregation behavior.

- [ ] **Step 4: Run full automated verification**

Backend: `mvnw.cmd test`

Frontend: focused Node tests, then `node_modules\.bin\tsc.cmd --noEmit`, then `npx.cmd expo-doctor`.

Expected: Maven tests pass, all Node tests pass, TypeScript exits 0, Expo Doctor reports all checks passed.

- [ ] **Step 5: Run localhost browser QA on port 8081**

Start: `npx.cmd expo start --web --port 8081 --clear`

Verify signup email code, forgot password, owner profile edit restrictions, MoMo reset/reverify, Ghana Card image requirement, backend pitches, aggregated bids, accept/reject/counter, and active deals. Check desktop and mobile-size viewports and confirm no console errors or overlapping text.

- [ ] **Step 6: Commit final integration**

Commit: `feat: complete account and owner backend integration`

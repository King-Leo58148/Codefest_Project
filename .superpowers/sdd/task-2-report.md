# Task 2 Report: Signup Verification and Password Reset Endpoints

## Changed files

- `src/main/java/com/codewithlouis/codefest_project/model/User.java`
  - Added `emailVerified` with default `true` for compatibility with existing accounts.
- `src/main/java/com/codewithlouis/codefest_project/services/AuthenticationService.java`
  - Added normalized-email handling.
  - Updated signup to create unverified users, resend signup codes for existing unverified accounts, and reject verified duplicates.
  - Updated login to reject unverified users before token issuance.
  - Added `verifyEmail`, `resendVerificationCode`, `forgotPassword`, and `resetPassword`.
  - Password reset now consumes only `PASSWORD_RESET`, encodes the new password, saves the user, and revokes refresh tokens.
- `src/main/java/com/codewithlouis/codefest_project/controllers/AuthenticationController.java`
  - Changed signup response to neutral verification payload.
  - Added `/auth/verify-email`, `/auth/resend-verification-code`, `/auth/forgot-password`, and `/auth/reset-password`.
  - Added `@Valid` request validation for the new code/reset flows.
- `src/main/java/com/codewithlouis/codefest_project/dto/EmailCodeRequest.java`
  - Added email + six-digit code DTO with Jakarta validation.
- `src/main/java/com/codewithlouis/codefest_project/dto/ForgotPasswordRequest.java`
  - Added email DTO with Jakarta validation.
- `src/main/java/com/codewithlouis/codefest_project/dto/ResetPasswordRequest.java`
  - Added email + six-digit code + new/confirm password DTO with Jakarta validation.
- `src/test/java/com/codewithlouis/codefest_project/services/AuthenticationServiceTest.java`
  - Added service tests for unverified signup, duplicate behavior, login rejection, email verification, neutral forgot-password handling, reset validation, password encoding, and refresh-token invalidation.
- `src/test/java/com/codewithlouis/codefest_project/controllers/AuthenticationControllerTest.java`
  - Added controller tests for signup payload, verification endpoints, forgot-password neutral response, reset confirmation, and six-digit validation.
- `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker`
  - Forced Mockito subclass mock maker so the focused tests run on the provided Java 25 runtime.

## RED workflow

### Initial required test command

Command requested by the brief:

```powershell
$env:JAVA_HOME='C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.3\jbr'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\mvnw.cmd "-Dtest=AuthenticationServiceTest,AuthenticationControllerTest" test
```

Observed output before local wrapper repair:

```text
icm : Cannot index into a null array.
Cannot start maven from wrapper
```

The wrapper script failed before Maven startup in this worktree because its PowerShell path assumed `$HOME\.m2` was a filesystem link.

### Actual RED compile check used

Command:

```powershell
$env:JAVA_HOME='C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.3\jbr'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
& 'C:\Users\DELL\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd' "-Dtest=AuthenticationServiceTest,AuthenticationControllerTest" test
```

RED output after adding the tests:

```text
[ERROR] cannot find symbol
[ERROR]   symbol:   class EmailCodeRequest
[ERROR] cannot find symbol
[ERROR]   symbol:   class ForgotPasswordRequest
[ERROR] cannot find symbol
[ERROR]   symbol:   class ResetPasswordRequest
[INFO] BUILD FAILURE
```

This confirmed the intended red state before the new DTOs/methods existed.

## GREEN workflow

### First post-implementation run

Command:

```powershell
$env:JAVA_HOME='C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.3\jbr'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
& 'C:\Users\DELL\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd' "-Dtest=AuthenticationServiceTest,AuthenticationControllerTest" test
```

Observed blocker:

```text
Mockito cannot mock this class: class com.codewithlouis.codefest_project.services.JwtService.
Caused by: java.lang.IllegalArgumentException:
Java 25 (69) is not supported by the current version of Byte Buddy which officially supports Java 24 (68)
```

Fix applied:

- Added `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker` with `mock-maker-subclass`.

### Final GREEN run

Command actually used for the final validation:

```powershell
$env:JAVA_HOME='C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.3\jbr'
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
.\mvnw.cmd "-Dtest=AuthenticationServiceTest,AuthenticationControllerTest" test
```

GREEN output:

```text
[INFO] Running com.codewithlouis.codefest_project.controllers.AuthenticationControllerTest
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.codewithlouis.codefest_project.services.AuthenticationServiceTest
[INFO] Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
[INFO] Results:
[INFO] Tests run: 16, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## Commit

- Commit message: `feat: verify signup email and reset passwords`

## Concerns / assumptions

- The required `mvnw.cmd` command now passes locally after a small wrapper fix for non-link `.m2` directories. That wrapper repair was only needed to execute the brief's required command and is not part of the Task 2 source/test commit.
- Mockito still emits Java 25 dynamic-agent warnings during the successful test run. The tests pass, but the build/test toolchain likely wants a more permanent Java 25-compatible Mockito/Byte Buddy setup later.
- For retried signup on an existing unverified email, I followed the brief/design literally: resend the signup code without duplicating or mutating the stored account. The spec did not say to overwrite the pending account's name/password/role on retry.

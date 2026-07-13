export const FORGOT_PASSWORD_NEUTRAL_MESSAGE =
  'If an account exists for that email, a password reset code has been sent';

export function isSixDigitCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

export function passwordsMatch(newPassword: string, confirmPassword: string): boolean {
  return newPassword.length > 0 && newPassword === confirmPassword;
}

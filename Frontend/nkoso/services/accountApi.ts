import type {
  ProfileUpdateInput,
  SignupVerificationResponse,
  User,
  VerificationAsset,
} from '../types';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

type RequestFn = (path: string, options?: RequestOptions) => Promise<unknown>;
type NormalizeUserFn = (user: unknown) => User;
type SignupRole = 'INVESTOR' | 'OWNER';

type FormDataValue =
  | string
  | {
      uri: string;
      name: string;
      type: string;
    };

export type FormDataLike = {
  append(name: string, value: FormDataValue): void;
};

function trimToUndefined(value: string | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function digitsOnly(value: string | undefined): string | undefined {
  const trimmed = trimToUndefined(value);
  return trimmed ? trimmed.replace(/\D/g, '') : undefined;
}

function readMessage(response: unknown, fallback: string): { message: string } {
  if (response && typeof response === 'object' && 'message' in response) {
    const message = (response as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return { message };
    }
  }

  return { message: fallback };
}

function readOptionalString(response: unknown, key: string): string | undefined {
  if (!response || typeof response !== 'object' || !(key in response)) {
    return undefined;
  }

  const value = (response as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function readBooleanFlag(response: unknown, key: string): boolean | undefined {
  if (!response || typeof response !== 'object' || !(key in response)) {
    return undefined;
  }

  const value = (response as Record<string, unknown>)[key];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }

  return undefined;
}

function readSignupResponse(
  response: unknown,
  fallbackEmail: string
): SignupVerificationResponse {
  const verificationRequired =
    readBooleanFlag(response, 'verificationRequired') ??
    !(
      readBooleanFlag(response, 'emailVerified') ??
      false
    );

  return {
    email: readOptionalString(response, 'email') ?? fallbackEmail,
    verificationRequired,
    message: readOptionalString(response, 'message'),
  };
}

export function buildProfileUpdatePayload(input: ProfileUpdateInput): ProfileUpdateInput {
  const payload: ProfileUpdateInput = {};

  const name = trimToUndefined(input.name);
  if (name) {
    payload.name = name;
  }

  const currentPassword = trimToUndefined(input.currentPassword);
  if (currentPassword) {
    payload.currentPassword = currentPassword;
  }

  const newPassword = trimToUndefined(input.newPassword);
  if (newPassword) {
    payload.newPassword = newPassword;
  }

  const confirmPassword = trimToUndefined(input.confirmPassword);
  if (confirmPassword) {
    payload.confirmPassword = confirmPassword;
  }

  const momoNumber = digitsOnly(input.momoNumber);
  if (momoNumber) {
    payload.momoNumber = momoNumber;
  }

  return payload;
}

export function buildGhanaCardVerificationFormData(
  cardNumber: string,
  asset: VerificationAsset,
  createFormData: () => FormDataLike = () => new FormData() as FormDataLike
): FormDataLike {
  const form = createFormData();
  const normalizedCardNumber = trimToUndefined(cardNumber);

  if (!normalizedCardNumber) {
    throw new Error('Ghana Card number is required.');
  }

  if (!asset?.uri) {
    throw new Error('Ghana Card image is required.');
  }

  form.append('cardNumber', normalizedCardNumber);
  form.append('cardImage', {
    uri: asset.uri,
    name: asset.fileName ?? asset.name ?? 'ghana-card.jpg',
    type: asset.mimeType ?? asset.type ?? 'image/jpeg',
  });

  return form;
}

export function createAccountApi(request: RequestFn, normalizeUser: NormalizeUserFn) {
  return {
    async signup(
      name: string,
      email: string,
      password: string,
      role: SignupRole
    ): Promise<SignupVerificationResponse> {
      const normalizedEmail = email.trim();
      const response = await request('/auth/signup', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          password,
          confirmPassword: password,
          role,
        }),
      });

      return readSignupResponse(response, normalizedEmail);
    },

    async verifySignupEmail(email: string, code: string): Promise<{ message: string }> {
      const response = await request('/auth/verify-email', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, code }),
      });

      return readMessage(response, 'Email verified successfully');
    },

    async resendSignupCode(email: string): Promise<{ message: string }> {
      const response = await request('/auth/resend-verification-code', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email }),
      });

      return readMessage(response, 'Verification code sent successfully');
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
      const response = await request('/auth/forgot-password', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email }),
      });

      return readMessage(
        response,
        'If an account exists for that email, a password reset code has been sent'
      );
    },

    async resetPassword(
      email: string,
      token: string,
      newPassword: string,
      confirmPassword: string
    ): Promise<{ message: string }> {
      const response = await request('/auth/reset-password', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email, token, newPassword, confirmPassword }),
      });

      return readMessage(response, 'Password reset successfully');
    },

    async updateProfile(input: ProfileUpdateInput): Promise<User> {
      const response = await request('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(buildProfileUpdatePayload(input)),
      });

      return normalizeUser(response);
    },

    async verifyGhanaCard(cardNumber: string, asset: VerificationAsset): Promise<boolean> {
      const response = await request('/api/verify/ghana-card', {
        method: 'POST',
        body: buildGhanaCardVerificationFormData(cardNumber, asset) as BodyInit,
      });

      const verified = readBooleanFlag(response, 'verified');
      if (verified != null) {
        return verified;
      }

      const success = readBooleanFlag(response, 'success');
      if (success != null) {
        return success;
      }

      return true;
    },
  };
}

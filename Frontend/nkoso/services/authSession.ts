import { User } from '../types';

type BackendLoginResponse = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
};

type BackendUserResponse = Partial<Omit<User, 'id' | 'isVerified'>> & {
  id?: string | number;
  isVerified?: boolean;
};

export type AuthSession = {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user: User;
};

export function getAccessToken(response: BackendLoginResponse): string {
  const token = response?.accessToken || response?.token;
  if (!token) {
    throw new Error('Login failed: no access token returned by the backend.');
  }
  return token;
}

function normalizeBoolean(value: unknown): boolean | undefined {
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

export function normalizeBackendUser(user: BackendUserResponse): User {
  const ghanaCardVerified = normalizeBoolean(user.ghanaCardVerified) ?? false;
  const momoVerified = normalizeBoolean(user.momoVerified) ?? false;
  const emailVerified = normalizeBoolean(user.emailVerified) ?? true;

  const normalized: User = {
    id: user.id == null ? '' : String(user.id),
    name: user.name ?? '',
    email: user.email ?? '',
    role: user.role ?? 'INVESTOR',
    isVerified: normalizeBoolean(user.isVerified) ?? (ghanaCardVerified && momoVerified),
    emailVerified,
    ghanaCardVerified,
    momoVerified,
  };

  if (user.avatarUrl) {
    normalized.avatarUrl = user.avatarUrl;
  }

  if (user.momoNumber) {
    normalized.momoNumber = user.momoNumber;
  }

  if (user.ghanaCardNumber) {
    normalized.ghanaCardNumber = user.ghanaCardNumber;
  }

  return normalized;
}

export function buildAuthenticatedSession(
  loginResponse: BackendLoginResponse,
  userResponse: BackendUserResponse
): AuthSession {
  return {
    token: getAccessToken(loginResponse),
    refreshToken: loginResponse?.refreshToken,
    expiresIn: loginResponse?.expiresIn,
    user: normalizeBackendUser(userResponse),
  };
}

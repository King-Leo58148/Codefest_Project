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

export function normalizeBackendUser(user: BackendUserResponse): User {
  const ghanaCardVerified = Boolean(user.ghanaCardVerified);
  const momoVerified = Boolean(user.momoVerified);

  const normalized: User = {
    id: user.id == null ? '' : String(user.id),
    name: user.name ?? '',
    email: user.email ?? '',
    role: user.role ?? 'INVESTOR',
    isVerified: user.isVerified ?? (ghanaCardVerified && momoVerified),
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

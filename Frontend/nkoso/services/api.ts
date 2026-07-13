import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityItem,
  Bid,
  BidStatus,
  Deal,
  Industry,
  Investment,
  Pitch,
  SignupVerificationResponse,
  User,
  VerificationAsset,
} from '@/types';
import { request } from './backendClient';
import {
  AuthSession,
  buildAuthenticatedSession,
  getAccessToken,
  normalizeBackendUser,
} from './authSession';
import { createAccountApi } from './accountApi';
import { createOwnerDataApi } from './ownerData';

const accountApi = createAccountApi(request, (user) => normalizeBackendUser(user as any));
const ownerDataApi = createOwnerDataApi(request);

async function getAuthenticatedUser(): Promise<User> {
  return normalizeBackendUser(await request('/auth/me'));
}

async function persistAuthSession(session: AuthSession): Promise<void> {
  const writes = [AsyncStorage.setItem('token', session.token)];

  if (session.refreshToken) {
    writes.push(AsyncStorage.setItem('refreshToken', session.refreshToken));
  }

  if (session.expiresIn != null) {
    writes.push(AsyncStorage.setItem('tokenExpiresIn', String(session.expiresIn)));
  }

  await Promise.all(writes);
}

// Auth
export async function loginUser(email: string, password: string): Promise<AuthSession> {
  const loginResponse = await request('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });

  await AsyncStorage.setItem('token', getAccessToken(loginResponse as any));
  const userResponse = await getAuthenticatedUser();
  const session = buildAuthenticatedSession(loginResponse as any, userResponse);
  await persistAuthSession(session);

  return session;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'INVESTOR' | 'OWNER'
): Promise<SignupVerificationResponse> {
  return accountApi.signup(name, email, password, role);
}

export const verifySignupEmail = accountApi.verifySignupEmail;
export const resendSignupCode = accountApi.resendSignupCode;
export const forgotPassword = accountApi.forgotPassword;
export const resetPassword = accountApi.resetPassword;
export const updateProfile = accountApi.updateProfile;

export async function verifyGhanaCard(
  ghanaCardNumber: string,
  asset: VerificationAsset
): Promise<boolean> {
  return accountApi.verifyGhanaCard(ghanaCardNumber, asset);
}

export async function verifyMomo(momoNumber: string): Promise<boolean> {
  const res = await request('/api/verify/momo', {
    method: 'POST',
    body: JSON.stringify({ momoNumber }),
  });
  return (res as { success?: boolean } | null)?.success || true;
}

// Pitches
export async function getPitches(industry?: Industry): Promise<Pitch[]> {
  const url =
    industry && industry !== 'All'
      ? `/api/pitches/filter?industry=${encodeURIComponent(industry)}`
      : '/api/pitches';
  return ownerDataApi.normalizePitchList(await request(url));
}

export async function getPitch(id: string): Promise<Pitch | undefined> {
  const response = await request(`/api/pitches/${id}`);
  return response == null ? undefined : ownerDataApi.normalizePitch(response);
}

export async function createPitch(data: any): Promise<Pitch> {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      if (key === 'image' && data[key].uri) {
        formData.append(
          'image',
          {
            uri: data[key].uri,
            name: 'pitch_image.jpg',
            type: 'image/jpeg',
          } as any
        );
      } else {
        formData.append(key, data[key]);
      }
    }
  });

  return ownerDataApi.normalizePitch(
    await request('/api/pitches', {
      method: 'POST',
      body: formData,
    })
  );
}

// Bids
export async function getBidsForPitch(pitchId: string): Promise<Bid[]> {
  return ownerDataApi.getBidsForPitch(pitchId);
}

export async function getOwnerBids(): Promise<Bid[]> {
  return ownerDataApi.getOwnerBids();
}

export async function getBid(id: string): Promise<Bid | undefined> {
  return ownerDataApi.getBid(id);
}

export async function getMyBids(investorId: string): Promise<Bid[]> {
  void investorId;
  return ownerDataApi.normalizeBidList(await request('/api/bids/mine'));
}

export async function placeBid(bid: Partial<Bid>): Promise<Bid> {
  const { pitchId, ...rest } = bid;
  return ownerDataApi.normalizeBid(
    await request(`/api/pitches/${pitchId}/bids`, {
      method: 'POST',
      body: JSON.stringify(rest),
    })
  );
}

export async function updateBidStatus(bidId: string, status: BidStatus): Promise<Bid> {
  const endpoint = status === 'ACCEPTED' ? `/api/bids/${bidId}/accept` : `/api/bids/${bidId}/reject`;
  return ownerDataApi.normalizeBid(
    await request(endpoint, {
      method: 'PUT',
    })
  );
}

// Investments / Portfolio
export async function getMyInvestments(): Promise<Investment[]> {
  try {
    const deals = await getMyDeals();
    return deals.map((deal) => ({
      pitchId: deal.pitchId,
      businessName: deal.businessName || 'Business',
      industry: 'Technology',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      amount: deal.amount,
      currentValue: deal.amount,
      change: 0,
      changePercent: 0,
    }));
  } catch (error) {
    console.warn('Failed to fetch investments, returning empty array', error);
    return [];
  }
}

// Activity
export async function getActivity(): Promise<ActivityItem[]> {
  try {
    const notifications = await request('/api/notifications');
    return (Array.isArray(notifications) ? notifications : []).map((n: any) => ({
      id: n.id || Math.random().toString(),
      type: 'business_update',
      businessName: 'System',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      description: n.message || n.text || 'Notification received',
      date: new Date(n.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  } catch (error) {
    console.warn('Failed to fetch activity, returning empty array', error);
    return [];
  }
}

// Deals
export async function getDeal(id: string): Promise<Deal | undefined> {
  return ownerDataApi.getDeal(id);
}

export async function signDeal(dealId: string, role: 'owner' | 'investor'): Promise<Deal> {
  return ownerDataApi.normalizeDeal(
    await request(`/api/deals/${dealId}/sign`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    })
  );
}

export async function initiatePayment(dealId: string): Promise<{ paystackUrl: string }> {
  return request(`/api/deals/${dealId}/pay`, {
    method: 'POST',
  }) as Promise<{ paystackUrl: string }>;
}

// --- Additional Endpoints from API_DOCUMENTATION.md ---

// Auth Additions
export async function logoutUser(): Promise<void> {
  return request('/auth/logout', { method: 'POST' }) as Promise<void>;
}
export async function refreshToken(): Promise<any> {
  return request('/auth/refresh', { method: 'POST' });
}
export async function getCurrentUser(): Promise<User> {
  return normalizeBackendUser(await request('/auth/me'));
}

// Pitches Additions
export async function getMyPitches(): Promise<Pitch[]> {
  return ownerDataApi.getMyPitches();
}

// Bids Additions
export async function counterBid(bidId: string, data: any): Promise<Bid> {
  return ownerDataApi.normalizeBid(
    await request(`/api/bids/${bidId}/counter`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  );
}

// Deals Additions
export async function getMyDeals(): Promise<Deal[]> {
  return ownerDataApi.getMyDeals();
}
export async function getDealMessages(dealId: string): Promise<any[]> {
  return request(`/api/deals/${dealId}/messages`) as Promise<any[]>;
}
export async function sendDealMessage(dealId: string, text: string): Promise<any> {
  return request(`/api/deals/${dealId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
export async function verifyPayment(dealId: string, reference: string): Promise<any> {
  return request(`/api/deals/${dealId}/verify-payment`, {
    method: 'POST',
    body: JSON.stringify({ reference }),
  });
}
export async function getDealRepayments(dealId: string): Promise<any[]> {
  return request(`/api/deals/${dealId}/repayments`) as Promise<any[]>;
}

// Notifications
export async function getNotifications(): Promise<any[]> {
  return request('/api/notifications') as Promise<any[]>;
}
export async function sendNotification(data: any): Promise<any> {
  return request('/api/notifications/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  return request('/api/notifications/unread-count') as Promise<{ count: number }>;
}
export async function markNotificationRead(id: string): Promise<any> {
  return request(`/api/notifications/${id}/read`, { method: 'PUT' });
}
export async function markAllNotificationsRead(): Promise<any> {
  return request('/api/notifications/read-all', { method: 'PUT' });
}

// Tax Summaries
export async function getTaxSummaries(): Promise<any[]> {
  return request('/api/tax-summaries') as Promise<any[]>;
}
export async function downloadTaxSummary(year: number): Promise<any> {
  return request(`/api/tax-summaries/download/${year}`);
}

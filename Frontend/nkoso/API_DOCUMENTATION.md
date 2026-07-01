# Mobile App Backend API Guide

## Current status
The mobile app in `Frontend/nkoso` currently uses mock services in `services/api.ts` and does not call the backend directly.

## Recommended integration approach
1. Create a shared API client file in the mobile app, for example `services/backendClient.ts`.
2. Use a base URL environment variable or constant to point to the deployed Render backend.
3. Replace mock service implementations in `services/api.ts` with real network calls.

## Backend base URL
Use the deployed Render backend URL for all API calls:

```text
https://codefest-backend.onrender.com
```

If the Render service URL is different, substitute it here.

## Suggested API endpoints
The Spring backend exposes these main endpoints:

### Authentication
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

### Pitches
- `POST /api/pitches` (multipart/form-data for pitch creation)
- `GET /api/pitches`
- `GET /api/pitches/mine`
- `GET /api/pitches/filter`
- `GET /api/pitches/{id}`

### Bids
- `POST /api/pitches/{pitchId}/bids`
- `GET /api/pitches/{pitchId}/bids`
- `GET /api/bids/mine`
- `PUT /api/bids/{bidId}/counter`
- `PUT /api/bids/{bidId}/accept`
- `PUT /api/bids/{bidId}/reject`

### Deals
- `GET /api/deals/{dealId}`
- `GET /api/deals/mine`
- `POST /api/deals/{dealId}/sign`
- `POST /api/deals/{dealId}/messages`
- `GET /api/deals/{dealId}/messages`
- `POST /api/deals/{dealId}/pay`
- `POST /api/deals/{dealId}/verify-payment`
- `GET /api/deals/{dealId}/repayments`

### Notifications
- `GET /api/notifications`
- `POST /api/notifications/send`
- `GET /api/notifications/unread-count`
- `PUT /api/notifications/{id}/read`
- `PUT /api/notifications/read-all`

### Verification & other
- `POST /api/verify/ghana-card`
- `POST /api/verify/momo`
- `GET /api/tax-summaries`
- `GET /api/tax-summaries/download/{year}`

## Example mobile API client
Example using `fetch`:

```ts
const BASE_URL = "https://codefest-backend.onrender.com";

async function request(path: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync('accesstoken');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorBody}`);
  }

  return response.json();
}

export async function loginUser(email: string, password: string) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
```

## Next steps for mobile app developer
1. Add a real HTTP client file, e.g. `services/backendClient.ts`.
2. Use `BASE_URL` set to the deployed Render backend.
3. Replace mock returns in `services/api.ts` with calls to the backend.
4. Store and send the auth token in the `Authorization` header.

## Notes
- The backend currently allows local React and Expo hosts in CORS/security config.
- If the deployed backend URL changes, update both the web config and this mobile API guide.

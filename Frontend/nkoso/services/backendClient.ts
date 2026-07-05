import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://codefest-project.onrender.com";

export async function request(path: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('token');
  
  // Create headers, don't set Content-Type if body is FormData
  const isFormData = options.body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedError;
    try {
      parsedError = JSON.parse(errorBody);
    } catch {
      // Body is not JSON
    }
    const message = parsedError?.message || parsedError?.error || errorBody || response.statusText;
    throw new Error(message || `HTTP ${response.status}`);
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

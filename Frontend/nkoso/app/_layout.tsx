import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Linking } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export { ErrorBoundary } from 'expo-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function RootLayoutNav() {
  const { user, loadStoredAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    (async () => {
      await loadStoredAuth();
      setAuthChecked(true);
    })();
  }, []);

  const segments = useSegments() as string[];

  useEffect(() => {
    if (authChecked) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [authChecked]);

  useEffect(() => {
    if (!authChecked) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isIndex = segments.length === 0 || segments[0] === 'index';

    // If user is logged out, and we aren't in the auth screens or splash screen, redirect to login
    if (!user && !inAuthGroup && !isIndex) {
      router.replace('/(auth)/login');
    }
  }, [user, authChecked, segments]);

  // Handle deep links — e.g. nkoso://reset-password?token=TOKEN&email=EMAIL
  useEffect(() => {
    const handleUrl = (url: string) => {
      try {
        const parsed = new URL(url);
        // nkoso://reset-password → /(auth)/reset-password
        if (parsed.hostname === 'reset-password') {
          const token = parsed.searchParams.get('token') ?? '';
          const email = parsed.searchParams.get('email') ?? '';
          const error = parsed.searchParams.get('error') ?? '';
          router.push({
            pathname: '/(auth)/reset-password',
            params: { token, email, error },
          } as any);
        }
      } catch {
        // Ignore malformed URLs
      }
    };

    // Handle link that opened the app cold
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // Handle links while app is foregrounded
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal'
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(investor)" />
        <Stack.Screen name="(owner)" />
        <Stack.Screen name="pitch/[id]" />
        <Stack.Screen name="invest/[id]" />
        <Stack.Screen name="deal/[id]" />
        <Stack.Screen name="bid/[id]" />
        <Stack.Screen name="profile/personal-info" />
        <Stack.Screen name="profile/bank-account" />
        <Stack.Screen name="profile/verification" />
        <Stack.Screen name="profile/tax-documents" />
        <Stack.Screen name="profile/notifications" />
        <Stack.Screen name="profile/email-preferences" />
        <Stack.Screen name="profile/payment-methods" />
        <Stack.Screen name="profile/help" />
        <Stack.Screen name="profile/contact-support" />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

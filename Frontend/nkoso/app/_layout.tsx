import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
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

  useEffect(() => {
    if (!authChecked) return;
    SplashScreen.hideAsync().catch(() => {});
    if (user) {
      if (user.role === 'OWNER') {
        router.replace('/(owner)');
      } else {
        router.replace('/(investor)');
      }
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [user, authChecked]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
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

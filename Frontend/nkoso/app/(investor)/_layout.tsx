import { Tabs, usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View, GestureResponderEvent } from 'react-native';
import { useRef, useCallback, useMemo } from 'react';

const SWIPE_THRESHOLD = 60;

const INVESTOR_TABS = [
  '/(investor)',
  '/(investor)/explore',
  '/(investor)/portfolio',
  '/(investor)/activity',
  '/(investor)/profile',
];

export default function InvestorTabLayout() {
  const pathname = usePathname();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const currentIndex = useMemo(() => {
    // Map pathname to tab index
    if (pathname === '/' || pathname === '/(investor)' || pathname === '/(investor)/index') return 0;
    if (pathname.includes('/explore')) return 1;
    if (pathname.includes('/portfolio')) return 2;
    if (pathname.includes('/activity')) return 3;
    if (pathname.includes('/profile')) return 4;
    return 0;
  }, [pathname]);

  const onTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
  }, []);

  const onTouchEnd = useCallback((e: GestureResponderEvent) => {
    const dx = e.nativeEvent.pageX - touchStartX.current;
    const dy = e.nativeEvent.pageY - touchStartY.current;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.2) {
      return;
    }

    if (dx < 0 && currentIndex < INVESTOR_TABS.length - 1) {
      router.replace(INVESTOR_TABS[currentIndex + 1] as any);
    } else if (dx > 0 && currentIndex > 0) {
      router.replace(INVESTOR_TABS[currentIndex - 1] as any);
    }
  }, [currentIndex]);

  return (
    <View
      style={{ flex: 1 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarStyle: {
            position: 'absolute',
            borderTopColor: 'rgba(0, 0, 0, 0.1)',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 80 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 6,
            elevation: 0,
            backgroundColor: 'transparent',
          },
          tabBarBackground: () => (
            <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="compass-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: 'Portfolio',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pulse-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

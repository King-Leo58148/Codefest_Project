import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/store/themeStore';

export default function AdminTabLayout() {
  const { isDark, colors } = useTheme();
  const activeColor = isDark ? '#38BDF8' : '#0D1B3E';
  const inactiveColor = isDark ? '#64748B' : '#9CA3AF';
  const tabBarBg = isDark ? '#0F1A34' : '#FFFFFF';
  const borderColor = isDark ? '#1E2C4F' : '#E2E8F0';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          position: 'absolute',
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          elevation: 0,
          backgroundColor: tabBarBg,
        },
        tabBarBackground: () => (
          <BlurView tint={isDark ? 'dark' : 'light'} intensity={80} style={StyleSheet.absoluteFill} />
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
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pitches"
        options={{
          title: 'Pitches',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: 'Deals',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

import { MaterialTopTabs } from '@/components/MaterialTopTabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Platform } from 'react-native';

export default function InvestorTabLayout() {
  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          borderTopColor: 'rgba(0, 0, 0, 0.1)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 : 60,
          elevation: 0,
          backgroundColor: '#ffffff',
          shadowOpacity: 0,
        },
        tabBarIndicatorStyle: {
          height: 0,
          backgroundColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          textTransform: 'none',
          marginTop: 4,
        },
        tabBarShowIcon: true,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass-outline" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="active-deals"
        options={{
          title: 'Active Deals',
          tabBarIcon: ({ color }) => (
            <Ionicons name="briefcase-outline" size={24} color={color} />
          ),
        }}
      />

      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </MaterialTopTabs>
  );
}

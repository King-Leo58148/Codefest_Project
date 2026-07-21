import { MaterialTopTabs } from '@/components/MaterialTopTabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Platform } from 'react-native';

export default function OwnerTabLayout() {
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
          fontSize: 10,
          fontWeight: '500',
          textTransform: 'none',
          marginTop: 4,
        },
        tabBarIconStyle: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarShowIcon: true,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="pitches"
        options={{
          title: 'My Pitches',
          tabBarIcon: ({ color }) => (
            <Ionicons name="megaphone-outline" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="bids"
        options={{
          title: 'Bids',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="deals"
        options={{
          title: 'Deals',
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={24} color={color} />
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

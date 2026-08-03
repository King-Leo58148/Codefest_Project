import { MaterialTopTabs } from '@/components/MaterialTopTabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Platform, View, StyleSheet } from 'react-native';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  activeName,
  color,
  focused,
}: {
  name: IoniconName;
  activeName: IoniconName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: 'center' }}>
      {focused && (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: Colors.primary,
            marginBottom: 4,
          }}
        />
      )}
      <Ionicons name={focused ? activeName : name} size={22} color={color} />
    </View>
  );
}

export default function OwnerTabLayout() {
  return (
    <MaterialTopTabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          borderTopColor: Colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 84 : 66,
          elevation: 0,
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          minHeight: 56,
          paddingVertical: 6,
        },
        tabBarIndicatorStyle: {
          height: 0,
          backgroundColor: 'transparent',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'none',
          marginTop: 3,
          letterSpacing: 0.1,
        },
        tabBarShowIcon: true,
      }}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="grid-outline" activeName="grid" color={color} focused={focused} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="pitches"
        options={{
          title: 'Pitches',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="megaphone-outline" activeName="megaphone" color={color} focused={focused} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="bids"
        options={{
          title: 'Bids',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="people-outline" activeName="people" color={color} focused={focused} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="deals"
        options={{
          title: 'Deals',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="briefcase-outline" activeName="briefcase" color={color} focused={focused} />
          ),
        }}
      />
      <MaterialTopTabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" activeName="person" color={color} focused={focused} />
          ),
        }}
      />
    </MaterialTopTabs>
  );
}

import { useRef, useCallback } from 'react';
import { 
  GestureResponderEvent, 
  PanResponderGestureState, 
  View, 
  ViewProps 
} from 'react-native';
import { router } from 'expo-router';

const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 0.4;

interface SwipeWrapperProps extends ViewProps {
  tabRoutes: string[];
  currentIndex: number;
}

/**
 * A wrapper View that detects horizontal swipe gestures and
 * navigates between tabs via expo-router.
 */
export function SwipeableTabView({ 
  tabRoutes, 
  currentIndex, 
  children, 
  style, 
  ...props 
}: SwipeWrapperProps) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
    swiping.current = false;
  }, []);

  const onTouchEnd = useCallback((e: GestureResponderEvent) => {
    const dx = e.nativeEvent.pageX - touchStartX.current;
    const dy = e.nativeEvent.pageY - touchStartY.current;

    // Only count as swipe if mostly horizontal
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.2) {
      return;
    }

    if (dx < 0 && currentIndex < tabRoutes.length - 1) {
      // Swiped left → next tab
      router.replace(tabRoutes[currentIndex + 1] as any);
    } else if (dx > 0 && currentIndex > 0) {
      // Swiped right → previous tab
      router.replace(tabRoutes[currentIndex - 1] as any);
    }
  }, [currentIndex, tabRoutes]);

  return (
    <View 
      style={[{ flex: 1 }, style]} 
      onTouchStart={onTouchStart} 
      onTouchEnd={onTouchEnd}
      {...props}
    >
      {children}
    </View>
  );
}

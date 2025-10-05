import React, { useRef } from 'react';
import { Dimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DraggableContainerProps {
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  onPositionChange?: (x: number, y: number) => void;
  disabled?: boolean;
}

export default function DraggableContainer({
  children,
  initialX = 20,
  initialY = 20,
  onPositionChange,
  disabled = false,
}: DraggableContainerProps) {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const isDragging = useSharedValue(false);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      const newX = startX.value + event.translationX;
      const newY = startY.value + event.translationY;

      // Constrain to screen bounds (with some padding)
      const constrainedX = Math.max(0, Math.min(SCREEN_WIDTH - 250, newX));
      const constrainedY = Math.max(0, Math.min(SCREEN_HEIGHT - 250, newY));

      translateX.value = constrainedX;
      translateY.value = constrainedY;
    })
    .onEnd(() => {
      isDragging.value = false;
      
      // Snap to edges if close enough
      const snapThreshold = 30;
      let finalX = translateX.value;
      let finalY = translateY.value;

      // Snap to left edge
      if (translateX.value < snapThreshold) {
        finalX = 20;
      }
      // Snap to right edge (accounting for component width)
      else if (translateX.value > SCREEN_WIDTH - 250 - snapThreshold) {
        finalX = SCREEN_WIDTH - 270;
      }

      // Snap to top edge
      if (translateY.value < snapThreshold) {
        finalY = 20;
      }
      // Snap to bottom edge (accounting for component height)
      else if (translateY.value > SCREEN_HEIGHT - 250 - snapThreshold) {
        finalY = SCREEN_HEIGHT - 270;
      }

      translateX.value = withSpring(finalX);
      translateY.value = withSpring(finalY);

      // Call position change callback
      if (onPositionChange) {
        runOnJS(onPositionChange)(finalX, finalY);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: isDragging.value ? 0.8 : 1,
      elevation: isDragging.value ? 10 : 5,
      zIndex: isDragging.value ? 1000 : 100,
    };
  });

  // Don't use pan gesture on web or when disabled
  if (Platform.OS === 'web' || disabled) {
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: initialX,
            top: initialY,
            zIndex: 100,
          },
        ]}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            top: 0,
          },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
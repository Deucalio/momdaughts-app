import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const WishlistToast = ({ 
  visible, 
  onHide, 
  product = null, 
  selectedVariant = null,
  duration = 2000,
  isRemoved = false // New prop to indicate if item was removed
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  // PanResponder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
    },
    onPanResponderGrant: () => {
      // Clear auto-hide timeout when user starts interacting
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      translateX.setValue(gestureState.dx);
      translateY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy, vx, vy } = gestureState;
      
      // Determine swipe direction and threshold
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const fastSwipe = Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5;

      if (fastSwipe || absX > SWIPE_THRESHOLD || absY > 50) {
        // Swipe detected - hide toast
        if (absX > absY) {
          // Horizontal swipe
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: true,
              easing: Easing.out(Easing.quad),
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            resetAndHide();
          });
        } else {
          // Vertical swipe
          const direction = dy > 0 ? 'down' : 'up';
          hideToast(direction);
        }
      } else {
        // Snap back to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            tension: 200,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            tension: 200,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Don't restart auto-hide timer after user interaction
          // Let it stay until user manually dismisses or full duration completes
        });
      }
    },
  });

  useEffect(() => {
    if (visible) {
      showToast();
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  const showToast = () => {
    setIsVisible(true);
    
    // Reset values
    translateY.setValue(-100);
    translateX.setValue(0);
    opacity.setValue(0);
    scale.setValue(0.9);

    // Entrance animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1)),
      }),
    ]).start();

    // Auto-hide after duration
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = (swipeDirection = 'up') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const exitY = swipeDirection === 'up' ? -100 : 100;
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: exitY,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.back(1.2)),
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.back(1)),
      }),
    ]).start(() => {
      resetAndHide();
    });
  };

  const resetAndHide = () => {
    setIsVisible(false);
    // Reset animations to initial values
    translateY.setValue(-100);
    translateX.setValue(0);
    opacity.setValue(0);
    scale.setValue(0.9);
    onHide && onHide();
  };

  const formatVariantText = () => {
    if (!selectedVariant) return '';
    
    // Extract size and color from variant title (e.g., "Small / Pink")
    const variantParts = [];
    if (selectedVariant.title && typeof selectedVariant.title === 'string') {
      const parts = selectedVariant.title.split(' / ');
      if (parts.length >= 2) {
        variantParts.push(parts[0]); // Size
        variantParts.push(parts[1]); // Color
      } else if (parts.length === 1) {
        variantParts.push(parts[0]); // Single option
      }
    }
    
    return variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';
  };

  const getProductName = () => {
    if (!product) return 'Item';
    return (product.title && typeof product.title === 'string') ? product.title : 'Item';
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Subtle gradient background - changes color based on action */}
      <View style={[styles.gradientOverlay, { backgroundColor: isRemoved ? '#95a5a6' : '#e74c3c' }]} />
      
      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Heart icon with subtle animation */}
        <View style={[styles.iconContainer, { backgroundColor: isRemoved ? 'rgba(149, 165, 166, 0.1)' : 'rgba(231, 76, 60, 0.1)' }]}>
          <Ionicons 
            name={isRemoved ? "heart-outline" : "heart"} 
            size={18} 
            color={isRemoved ? "#95a5a6" : "#e74c3c"} 
          />
        </View>
        
        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>
            {isRemoved ? 'Removed from Wishlist' : 'Added to Wishlist'}
          </Text>
          <Text style={styles.subText} numberOfLines={2}>
            {getProductName()}{formatVariantText()}
          </Text>
        </View>
        
        {/* Swipe indicator */}
        <View style={styles.swipeIndicator}>
          <View style={styles.swipeHandle} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60, // Below status bar
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 14,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  subText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '400',
  },
  swipeIndicator: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  swipeHandle: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
    backgroundColor: '#bdc3c7',
    opacity: 0.6,
  },
});

export default WishlistToast;
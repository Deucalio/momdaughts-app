import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanGestureHandler,
  Dimensions,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const WishlistToast = ({ 
  visible, 
  onHide, 
  productName = "Item", 
  variant = null,
  duration = 4000 
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

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
      setIsVisible(false);
      onHide && onHide();
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;

    // Determine swipe direction and threshold
    const absX = Math.abs(translationX);
    const absY = Math.abs(translationY);
    const fastSwipe = Math.abs(velocityX) > 500 || Math.abs(velocityY) > 500;

    if (fastSwipe || absX > SWIPE_THRESHOLD || absY > 50) {
      // Swipe detected - hide toast
      let direction = 'up';
      if (absX > absY) {
        // Horizontal swipe
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
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
          setIsVisible(false);
          onHide && onHide();
        });
      } else {
        // Vertical swipe
        direction = translationY > 0 ? 'down' : 'up';
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
      ]).start();
    }
  };

  const formatVariantText = () => {
    if (!variant) return '';
    
    const variantParts = [];
    if (variant.size) variantParts.push(variant.size);
    if (variant.color) variantParts.push(variant.color);
    
    return variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';
  };

  if (!isVisible) return null;

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
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
      >
        {/* Subtle gradient background */}
        <View style={styles.gradientOverlay} />
        
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Heart icon with subtle animation */}
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={18} color="#e74c3c" />
          </View>
          
          {/* Text content */}
          <View style={styles.textContainer}>
            <Text style={styles.mainText}>
              Added to Wishlist
            </Text>
            <Text style={styles.subText} numberOfLines={1}>
              {productName}{formatVariantText()}
            </Text>
          </View>
          
          {/* Swipe indicator */}
          <View style={styles.swipeIndicator}>
            <View style={styles.swipeHandle} />
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

// Usage component example
const WishlistToastExample = () => {
  const [showToast, setShowToast] = useState(false);

  const handleAddToWishlist = () => {
    // Your wishlist logic here
    setShowToast(true);
  };

  return (
    <View style={styles.exampleContainer}>
      {/* Your existing product component */}
      
      {/* Wishlist Toast */}
      <WishlistToast
        visible={showToast}
        onHide={() => setShowToast(false)}
        productName="Premium Cotton T-Shirt"
        variant={{ size: 'M', color: 'Navy Blue' }}
        duration={4000}
      />
    </View>
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
    backgroundColor: '#e74c3c',
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
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
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
  exampleContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default WishlistToast;
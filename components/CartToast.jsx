import React, { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 

  PanResponder
} from "react-native";
import { Image } from 'expo-image';

const CartToast = ({
  isVisible,
  onClose,
  productName = "Vitamin C Serum",
  productImage = null,
  clickCount = 1,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-30)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -30,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animations for next time
      fadeAnim.setValue(0);
      translateYAnim.setValue(-30);
      translateXAnim.setValue(0);
      onClose();
    });
  };

  useEffect(() => {
    let timer;
    
    if (isVisible) {
      // Reset animations to initial state when becoming visible
      fadeAnim.setValue(0);
      translateYAnim.setValue(-30);
      translateXAnim.setValue(0);
      
      animateIn();
      
      // Calculate display time based on click count
      // Base time: 3 seconds, +1 second for each additional click, max 8 seconds
      const displayTime = Math.min(3000 + (clickCount - 1) * 1000, 8000);
      
      // Auto dismiss after calculated time
      timer = setTimeout(() => {
        animateOut();
      }, displayTime);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isVisible, clickCount]);

  // Pan responder for swipe to dismiss
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderGrant: () => {
      translateXAnim.setOffset(translateXAnim._value);
    },
    onPanResponderMove: Animated.event(
      [null, { dx: translateXAnim }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (evt, gestureState) => {
      translateXAnim.flattenOffset();
      
      if (Math.abs(gestureState.dx) > 100) {
        // Swipe far enough - dismiss
        Animated.timing(translateXAnim, {
          toValue: gestureState.dx > 0 ? 300 : -300,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Reset all animations for next time
          fadeAnim.setValue(0);
          translateYAnim.setValue(-30);
          translateXAnim.setValue(0);
          onClose();
        });
      } else {
        // Snap back
        Animated.spring(translateXAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.toast,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: translateYAnim },
              { translateX: translateXAnim },
            ],
          },
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
        </View>

        {/* Product Image */}
        {productImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: productImage }} style={styles.image} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.productName} numberOfLines={3}>
            {productName}
          </Text>
          <Text style={styles.subText}>
            {clickCount > 1 ? `Added to cart (${clickCount})` : 'Added to cart'}
          </Text>
        </View>

        {/* Cart Icon */}
        <Ionicons name="cart-outline" size={16} color="#9ca3af" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 280,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default CartToast;
import React, { useRef } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Header from "./Header";
import { Animated, ScrollView } from "react-native";

const ScreenWrapper = ({ children, showHeader = true, cartItemCount = 0 }) => {
  const insets = useSafeAreaInsets();
  // Reduced header height calculation
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = showHeader ? insets.top + 20 : 0; // Much smaller now

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
      {showHeader && <Header scrollY={scrollY} cartItemCount={cartItemCount} />}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={{ flex: 1, paddingTop: headerHeight }}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
};

export default ScreenWrapper;

import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from './Header';

const ScreenWrapper = ({ children, showHeader = true, cartItemCount = 0 }) => {
  const insets = useSafeAreaInsets();
  // Reduced header height calculation
  const headerHeight = showHeader ? insets.top +20 : 0; // Much smaller now

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {showHeader && <Header cartItemCount={cartItemCount} />}
      <View style={{ flex: 1, paddingTop: headerHeight }}>
        {children}
      </View>
    </View>
  );
};

export default ScreenWrapper;
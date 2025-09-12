// components/Text.js
import React from 'react';
import { Text as RNText } from 'react-native';

// Create a wrapper that always uses Outfit
const Text = React.forwardRef(({ style, ...props }, ref) => {
  return (
    <RNText
      ref={ref}
      style={[
        { fontFamily: 'Outfit-Regular' },
        style,
      ]}
      {...props}
    />
  );
});

Text.displayName = 'Text';

export default Text;
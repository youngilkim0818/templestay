import React, { memo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { LEGACY_COLORS } from '../../constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  size = 'large', 
  color = LEGACY_COLORS.primary 
}) => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
});

export default LoadingSpinner; 
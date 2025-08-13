import React, { memo } from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
}


const CustomButton = memo<ButtonProps>(({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  className = ''
}) => {
  // Global startup-style base classes with enhanced interactions
  const baseClasses = `
    flex-row items-center justify-center rounded-xl border-0
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-60' : 'active:scale-95'}
  `;
  
  // Enhanced variant classes with global design patterns
  const variantClasses = {
    primary: "bg-sage-600 active:bg-sage-700",
    secondary: "bg-stone-100 border border-stone-200 active:bg-stone-200", 
    accent: "bg-coral-500 active:bg-coral-600",
    outline: "bg-transparent border-2 border-sage-600 active:bg-sage-50",
    ghost: "bg-transparent active:bg-sage-50"
  };
  
  // Global startup-style size classes (inspired by Uber, Notion, etc.)
  const sizeClasses = {
    small: "px-4 py-2.5 min-h-[36px]",
    medium: "px-6 py-3.5 min-h-[48px]", 
    large: "px-8 py-4 min-h-[56px]"
  };
  
  // Enhanced text variant classes with better typography
  const textVariantClasses = {
    primary: "text-white font-bold tracking-wide",
    secondary: "text-stone-700 font-bold tracking-wide",
    accent: "text-white font-bold tracking-wide", 
    outline: "text-sage-600 font-bold tracking-wide",
    ghost: "text-sage-600 font-bold tracking-wide"
  };
  
  // Global text size standards
  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  // Icon colors by variant
  const iconColors = {
    primary: '#FFFFFF',
    secondary: '#57534E',
    accent: '#FFFFFF',
    outline: '#4A5D23',
    ghost: '#4A5D23'
  };

  // Icon sizes by button size
  const iconSizes = {
    small: 16,
    medium: 18,
    large: 20
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  const textClasses = `${textVariantClasses[variant]} ${textSizeClasses[size]}`;

  return (
    <TouchableOpacity 
      className={buttonClasses}
      style={style}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={iconColors[variant]} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={iconSizes[size]} 
              color={iconColors[variant]} 
              style={{ marginRight: 8 }} 
            />
          )}
          <Text className={textClasses} style={textStyle}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={iconSizes[size]} 
              color={iconColors[variant]} 
              style={{ marginLeft: 8 }} 
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
});

CustomButton.displayName = 'CustomButton';

export default CustomButton; 
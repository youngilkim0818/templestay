import React, { memo } from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'stone';
  className?: string;
}


const Card = memo<CardProps>(({ 
  children, 
  style, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  // Base card classes with ZEN-TECH styling
  const baseClasses = "rounded-2xl";
  
  // Variant classes using new color system
  const variantClasses = {
    default: "bg-white p-4",
    elevated: "bg-white p-6", 
    outlined: "bg-white p-4 border border-neutral-200",
    stone: "bg-stone-100 p-4"
  };
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <View 
      className={cardClasses}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
});

Card.displayName = 'Card';

export default Card; 
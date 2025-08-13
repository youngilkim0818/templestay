import React, { memo } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface CustomInputProps extends TextInputProps {
    label?: string;
    error?: string;
    required?: boolean;
}

const CustomInput = memo<CustomInputProps>(({ label, error, required, style, ...props }) => {
  return (
    <View className="my-2.5">
        {label && (
          <Text className="mb-1 text-sm text-neutral-800 font-medium">
            {label}
            {required && <Text className="text-coral-500"> *</Text>}
          </Text>
        )}
        <TextInput 
          className={`h-12 border rounded-lg px-3 text-base bg-white ${
            error ? 'border-coral-500 border-2' : 'border-stone-300'
          }`}
          style={style}
          {...props} 
        />
        {error && <Text className="mt-1 text-xs text-coral-500">{error}</Text>}
    </View>
  );
});

export default CustomInput; 
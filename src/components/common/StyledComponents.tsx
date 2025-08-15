import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Temple Stay - Premium Design System
const COLORS = {
  background: {
    primary: '#FFFFFF',      // Pure white
    secondary: '#FAFAFA',    // Cards/elevated surfaces  
    tertiary: '#F5F5F5',     // Input backgrounds
    paper: '#FFFFFF',        // Modal/overlay backgrounds
  },
  text: {
    primary: '#1A1A1A',      // Primary text (charcoal)
    secondary: '#6B7280',    // Secondary text (warm gray)
    tertiary: '#9CA3AF',     // Placeholder/disabled text
    accent: '#8B5A3C',       // Temple brown (warm, earthy)
  },
  interactive: {
    primary: '#8B5A3C',      // Primary CTA (temple brown)
    secondary: '#F3F4F6',    // Secondary buttons (light gray)
    success: '#059669',      // Success states (zen green)
    danger: '#DC2626',       // Error states (minimal red)
    warning: '#D97706',      // Warning states (amber)
    border: '#E5E7EB',       // Subtle borders
    divider: '#F3F4F6',      // Section dividers
  },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,  // Extra large for premium feel
};

const TYPOGRAPHY = {
  display: {
    fontSize: 32,
    fontWeight: '300' as const,  // Light weight for elegance
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 24,
    fontWeight: '400' as const,  // Regular weight
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  button: {
    fontSize: 16,
    fontWeight: '500' as const,  // Medium weight for buttons
    lineHeight: 20,
    letterSpacing: 0.1,
  },
};

// Styled Input Component
interface StyledInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: boolean;
  editable?: boolean;
}

export const StyledInput: React.FC<StyledInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error = false,
  editable = true,
}) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.tertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        selectionColor={COLORS.text.accent}
      />
    </View>
  );
};

// Styled Button Component
interface StyledButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  style?: any;
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  loading = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'ghost' && styles.ghostButton,
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : COLORS.text.accent}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' && styles.primaryButtonText,
            variant === 'secondary' && styles.secondaryButtonText,
            variant === 'ghost' && styles.ghostButtonText,
            (disabled || loading) && styles.disabledButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Styled Card Component
interface StyledCardProps {
  children: React.ReactNode;
  style?: any;
}

export const StyledCard: React.FC<StyledCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

// Styled Divider Component
interface StyledDividerProps {
  text?: string;
  style?: any;
}

export const StyledDivider: React.FC<StyledDividerProps> = ({ text, style }) => {
  return (
    <View style={[styles.dividerContainer, style]}>
      <View style={styles.dividerLine} />
      {text && <Text style={styles.dividerText}>{text}</Text>}
      <View style={styles.dividerLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Input Styles
  inputContainer: {
    marginBottom: SPACING.lg + SPACING.sm, // More generous spacing
  },
  input: {
    ...TYPOGRAPHY.body,
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: COLORS.interactive.border,
    borderRadius: 8,  // Less rounded for minimal feel
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.lg,  // More horizontal padding
    minHeight: 56,
    color: COLORS.text.primary,
    fontSize: 16,
  },
  inputError: {
    borderColor: COLORS.interactive.danger,
    backgroundColor: '#FEF2F2', // Subtle error background
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.background.secondary,
    color: COLORS.text.tertiary,
  },

  // Button Styles
  button: {
    borderRadius: 8,  // Less rounded for minimal feel
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.xl,  // More horizontal padding
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: COLORS.interactive.primary,
    // Minimal shadow for premium feel
    shadowColor: COLORS.interactive.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButton: {
    backgroundColor: COLORS.interactive.secondary,
    borderWidth: 1,
    borderColor: COLORS.interactive.border,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.interactive.border,
  },
  disabledButton: {
    opacity: 0.4,
  },

  // Button Text Styles
  buttonText: {
    ...TYPOGRAPHY.button,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: COLORS.text.primary,
  },
  ghostButtonText: {
    color: COLORS.text.accent,
  },
  disabledButtonText: {
    color: COLORS.text.tertiary,
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,  // Less rounded
    padding: SPACING.xl,  // More generous padding
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.interactive.border,
    // Minimal shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Divider Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,  // More generous spacing
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.interactive.divider,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,  // Better contrast
    marginHorizontal: SPACING.lg,  // More spacing
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING.md,
  },
});

export { COLORS, SPACING, TYPOGRAPHY };
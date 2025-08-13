// 🚀 ZEN-TECH Design System - Unicorn Startup Style
export const ZEN_TECH_THEME = {
  // Core Brand Colors
  brand: {
    sage: '#4A5D23',         // Deep Sage - Primary brand color
    sageLighter: '#6B7F35',  // Lighter sage for hover states  
    sageDarker: '#3A4A1C',   // Darker sage for pressed states
    stone: '#F5F1EB',        // Warm Stone - Premium neutral
    coral: '#FF6B6B',        // Electric Coral - Energy & actions
    coralLight: '#FF8A8A',   // Light coral for hover
    coralDark: '#E55555',    // Dark coral for pressed
  },

  // Background Hierarchy
  background: {
    primary: '#FFFFFF',      // Pure white
    secondary: '#F5F1EB',    // Warm stone background
    tertiary: '#F8F9FA',     // Light gray background
    surface: '#FFFFFF',      // Card/surface background
    overlay: '#1A1B1F',     // Dark overlay for modals
  },
  
  // Text Hierarchy
  text: {
    primary: '#1A1B1F',      // Deep charcoal - main text
    secondary: '#4A5568',    // Medium gray - secondary text
    tertiary: '#718096',     // Light gray - meta text
    accent: '#4A5D23',       // Sage - branded text
    inverse: '#FFFFFF',      // White text on dark backgrounds
    disabled: '#A0AEC0',     // Disabled text
    hint: '#CBD5E0',         // Placeholder text
  },
  
  // Interactive States
  interactive: {
    primary: '#4A5D23',      // Sage primary buttons
    primaryHover: '#6B7F35', // Sage hover state
    primaryPressed: '#3A4A1C', // Sage pressed state
    secondary: '#F5F1EB',    // Stone secondary buttons
    accent: '#FF6B6B',       // Coral accent actions
    accentHover: '#FF8A8A',  // Coral hover
    accentPressed: '#E55555', // Coral pressed
  },

  // Status Colors
  status: {
    success: '#48BB78',      // Success green
    successLight: '#68D391', // Light success
    warning: '#ED8936',      // Warning orange
    warningLight: '#F6AD55', // Light warning
    error: '#F56565',        // Error red
    errorLight: '#FC8181',   // Light error
    info: '#4299E1',         // Info blue
    infoLight: '#63B3ED',    // Light info
  },

  // Neutral Grays (Modern Scale)
  neutral: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6',
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#1A1B1F',
  },

  // Shadows & Effects
  shadow: {
    xs: 'rgba(26, 27, 31, 0.04)',
    sm: 'rgba(26, 27, 31, 0.08)',
    md: 'rgba(26, 27, 31, 0.12)',
    lg: 'rgba(26, 27, 31, 0.16)',
    xl: 'rgba(26, 27, 31, 0.20)',
  },
  
  // Borders
  border: {
    light: '#E8EAED',
    medium: '#DADCE0',
    dark: '#BDC1C6',
    accent: '#4A5D23',
  },
};

// 🌙 Dark theme for future implementation
export const ZEN_TECH_DARK = {
  brand: {
    sage: '#6B7F35',         // Lighter sage for dark mode
    sageLighter: '#8A9A4A',  
    sageDarker: '#4A5D23',   
    stone: '#2A2A2A',        // Dark stone
    coral: '#FF8A8A',        // Softer coral for dark
    coralLight: '#FFA3A3',   
    coralDark: '#FF6B6B',    
  },
  
  background: {
    primary: '#1A1B1F',      // Dark primary
    secondary: '#2A2A2A',    // Dark stone
    tertiary: '#3C4043',     // Medium dark
    surface: '#1A1B1F',      // Dark surface
    overlay: '#000000',      // Black overlay
  },
  
  text: {
    primary: '#F8F9FA',      // Light text
    secondary: '#BDC1C6',    // Medium light
    tertiary: '#9AA0A6',     // Darker light
    accent: '#6B7F35',       // Sage accent
    inverse: '#1A1B1F',      // Dark text on light
    disabled: '#5F6368',     // Disabled
    hint: '#80868B',         // Hint
  },
};

// 🎯 Main Export - ZEN-TECH as default
export const COLORS = ZEN_TECH_THEME;

// 🔄 Legacy compatibility mapping
export const LEGACY_COLORS = {
  // Map old colors to new system
  primary: ZEN_TECH_THEME.brand.sage,
  primaryLight: ZEN_TECH_THEME.brand.sageLighter,
  primaryDark: ZEN_TECH_THEME.brand.sageDarker,
  secondary: ZEN_TECH_THEME.background.secondary,
  accent: ZEN_TECH_THEME.brand.coral,
  success: ZEN_TECH_THEME.status.success,
  warning: ZEN_TECH_THEME.status.warning,
  error: ZEN_TECH_THEME.status.error,
  info: ZEN_TECH_THEME.status.info,
  white: '#FFFFFF',
  black: ZEN_TECH_THEME.neutral[900],
  gray: ZEN_TECH_THEME.neutral,
  text: ZEN_TECH_THEME.text,
  background: ZEN_TECH_THEME.background,
  shadow: ZEN_TECH_THEME.shadow,
  border: ZEN_TECH_THEME.border,
}; 
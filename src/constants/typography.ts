// 🎨 Robinhood-Inspired Typography System
export const TYPOGRAPHY = {
  // Display (Hero titles)
  display: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    fontFamily: 'Pretendard',
  },
  
  // Headings
  h1: { 
    fontSize: 24, 
    fontWeight: '600' as const, 
    lineHeight: 32, 
    letterSpacing: -0.3,
    fontFamily: 'Pretendard',
  },
  h2: { 
    fontSize: 20, 
    fontWeight: '600' as const, 
    lineHeight: 28, 
    letterSpacing: -0.2,
    fontFamily: 'Pretendard',
  },
  h3: { 
    fontSize: 18, 
    fontWeight: '600' as const, 
    lineHeight: 24, 
    letterSpacing: -0.1,
    fontFamily: 'Pretendard',
  },
  
  // Body text
  body: { 
    fontSize: 16, 
    fontWeight: '400' as const, 
    lineHeight: 24,
    fontFamily: 'Pretendard',
  },
  bodyMedium: { 
    fontSize: 16, 
    fontWeight: '500' as const, 
    lineHeight: 24,
    fontFamily: 'Pretendard',
  },
  bodySmall: { 
    fontSize: 14, 
    fontWeight: '400' as const, 
    lineHeight: 20,
    fontFamily: 'Pretendard',
  },
  
  // UI text
  caption: { 
    fontSize: 12, 
    fontWeight: '400' as const, 
    lineHeight: 16,
    fontFamily: 'Pretendard',
  },
  button: { 
    fontSize: 16, 
    fontWeight: '600' as const, 
    lineHeight: 20,
    fontFamily: 'Pretendard',
  },
  label: { 
    fontSize: 14, 
    fontWeight: '500' as const, 
    lineHeight: 20,
    fontFamily: 'Pretendard',
  },
} as const;

// Spacing System (8pt Grid)
export const SPACING = {
  micro: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
} as const; 
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.ts"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 🚀 ZEN-TECH Brand Colors
        sage: {
          50: '#f4f6f0',
          100: '#e8ebe0',
          200: '#d1d6c0',
          300: '#a8b585',
          400: '#8a9a4a',
          500: '#6b7f35',  // sageLighter
          600: '#4a5d23',  // Primary sage
          700: '#3a4a1c',  // sageDarker
          800: '#2d3715',
          900: '#1f250f',
        },
        
        stone: {
          50: '#faf9f7',
          100: '#f5f1eb',  // Primary stone
          200: '#ede6d8',
          300: '#e0d4c0',
          400: '#cbb599',
          500: '#b59770',
          600: '#9a7a52',
          700: '#7d6042',
          800: '#644d35',
          900: '#4a3a28',
        },
        
        coral: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa3a3',
          400: '#ff8a8a',  // coralLight
          500: '#ff6b6b',  // Primary coral
          600: '#e55555',  // coralDark
          700: '#cc4444',
          800: '#b33333',
          900: '#992222',
        },
        
        // Enhanced Neutral System
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
        
        // Status Colors
        success: '#48BB78',
        warning: '#ED8936', 
        danger: '#F56565',
        info: '#4299E1',
      },
      fontFamily: {
        pretendard: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
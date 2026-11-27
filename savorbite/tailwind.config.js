/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand design tokens — SavorBite
        cream: '#FFF8F0',
        surface: '#FFFFFF',
        sand: '#F5E9DA',
        charcoal: '#2B2118',
        muted: '#6B5B4D',
        paprika: { DEFAULT: '#C2410C', 800: '#9A3412' },
        success: '#2F7D4F',
        warning: '#B45309',
        error: '#B91C1C',
        // Hairline borders
        line: { DEFAULT: '#E7D9CB', strong: '#D9C4B0', subtle: '#F0E6D8' },
        // Legacy aliases (kept so older class names still resolve)
        'page-bg': '#FFF8F0',
        'text-primary': '#2B2118',
        'text-secondary': '#6B5B4D',
        'text-tertiary': '#9A8572',
        'border-default': '#E7D9CB',
        'border-subtle': '#F0E6D8',
        'border-strong': '#D9C4B0',
        'surface-container-low': '#F5E9DA',
        'surface-container': '#F0E2D3',
        'surface-container-high': '#EAD9C6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        'body-xs': ['12px', '1.5'],
        'body-sm': ['14px', '1.5'],
        'body': ['16px', '1.5'],
        'body-lg': ['20px', '1.5'],
        'h2': ['24px', '1.3'],
        'h1': ['32px', '1.2'],
        'h0': ['48px', '1.1'],
      },
      // One radius scale: 8 / 12 / 16 (controls & cards / large containers / modals & sheets)
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '16px',
        full: '9999px',
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(43, 33, 24, 0.05)',
        md: '0 4px 6px -1px rgba(43, 33, 24, 0.07), 0 2px 4px -2px rgba(43, 33, 24, 0.05)',
        lg: '0 10px 15px -3px rgba(43, 33, 24, 0.08)',
        xl: '0 20px 25px -5px rgba(43, 33, 24, 0.10)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 250ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
}
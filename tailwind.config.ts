import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          dark: '#E5541E',
          light: '#FFF4ED',
        },
        secondary: {
          DEFAULT: '#2D2D3F',
          light: '#4A4A5A',
        },
        accent: '#FFD600',
        success: '#00C853',
        error: '#EF4444',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        background: '#FAFBFF',
        candy: {
          pink: '#FF8C61',
          purple: '#2D2D3F',
          blue: '#3D7BCC',
          green: '#28A745',
          yellow: '#FFD600',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        input: '8px',
        pill: '9999px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        wiggle: 'wiggle 0.5s ease-in-out',
        'bounce-soft': 'bounce-soft 0.4s ease-in-out',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
    },
  },
  plugins: [],
};

export default config;

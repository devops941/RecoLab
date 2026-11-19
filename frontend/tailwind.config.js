/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gif: {
          bg: '#08090D',
          surface: '#0F1117',
          surfaceLight: '#161922',
          border: '#232838',
          borderLight: '#32394E',
          lime: '#CCFF00',
          limeHover: '#B8E600',
          limeGlow: 'rgba(204, 255, 0, 0.4)',
          purple: '#8B5CF6',
          purpleDark: '#6D28D9',
          magenta: '#FF2E74',
          cyan: '#00F0FF',
          orange: '#FF6B00'
        },
        royal: {
          dark: '#070A12',
          surface: '#0E1322',
          border: '#232D48',
          gold: '#F59E0B',
          emerald: '#10B981',
          sapphire: '#3B82F6',
          amethyst: '#8B5CF6',
          ruby: '#F43F5E',
          cyan: '#06B6D4'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'gif-lime': '0 0 25px rgba(204, 255, 0, 0.35)',
        'gif-purple': '0 0 25px rgba(139, 92, 246, 0.35)',
        'gif-magenta': '0 0 25px rgba(255, 46, 116, 0.35)',
        'gif-cyan': '0 0 25px rgba(0, 240, 255, 0.35)',
        'royal-gold': '0 0 25px rgba(245, 158, 11, 0.25)',
      },
      backgroundImage: {
        'gif-gradient': 'linear-gradient(135deg, #08090D 0%, #111420 50%, #0D1612 100%)',
        'gif-lime-purple': 'linear-gradient(135deg, #CCFF00 0%, #00F0FF 50%, #8B5CF6 100%)',
        'gif-fire': 'linear-gradient(135deg, #FF2E74 0%, #FF6B00 50%, #CCFF00 100%)',
      }
    },
  },
  plugins: [],
}

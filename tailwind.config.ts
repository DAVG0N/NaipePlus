import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          darkRed: '#B81D24',
          black: '#141414',
          dark: '#181818',
          card: '#2F2F2F',
          lightGray: '#E5E5E5',
          gray: '#808080',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-to-b-dark': 'linear-gradient(to bottom, rgba(20, 20, 20, 0) 0%, rgba(20, 20, 20, 0.7) 60%, rgba(20, 20, 20, 1) 100%)',
        'gradient-to-t-dark': 'linear-gradient(to top, rgba(20, 20, 20, 1) 0%, rgba(20, 20, 20, 0.7) 50%, rgba(20, 20, 20, 0) 100%)',
        'gradient-hero': 'linear-gradient(77deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out forwards',
        scaleUp: 'scaleUp 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;

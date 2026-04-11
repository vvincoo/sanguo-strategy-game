import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0f172a',
          card: '#1e293b',
          accent: '#f59e0b'
        }
      }
    }
  },
  plugins: []
};

export default config;

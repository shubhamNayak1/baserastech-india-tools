/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdaff',
          300: '#8ec2ff',
          400: '#599fff',
          500: '#337bfc',
          600: '#1d5cf1',
          700: '#1547de',
          800: '#183bb3',
          900: '#1a378d',
          950: '#152356',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
          subtle: '#64748b',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Noto Sans',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      maxWidth: { content: '72rem' },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0f172a',
          panel: '#1e293b',
          elevated: '#273344',
        },
        ink: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          disabled: '#475569',
        },
        edge: {
          DEFAULT: '#334155',
          subtle: '#1e293b',
        },
        brand: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
        },
        status: {
          published: '#10b981',
          scheduled: '#f59e0b',
          retrying: '#fbbf24',
          publishing: '#60a5fa',
          failed: '#f43f5e',
          dead: '#ef4444',
          draft: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      width: { sidebar: '240px' },
      height: { topbar: '56px' },
    },
  },
  plugins: [],
}

export default config

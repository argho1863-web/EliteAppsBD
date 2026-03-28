import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#F0A500', 'gold-light': '#FFD166', 'gold-dark': '#C47D00',
          navy: '#0A0A14', 'navy-2': '#12121E', 'navy-3': '#1A1A2E', 'navy-4': '#16213E',
          electric: '#4361EE', accent: '#E94560',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'gold': '0 0 30px rgba(240,165,0,0.3)',
        'gold-strong': '0 0 50px rgba(240,165,0,0.5)',
        'card': '0 8px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
export default config

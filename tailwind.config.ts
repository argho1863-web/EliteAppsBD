import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Gold stays the one flat accent. The navy ramp is the "ink" neutral ramp.
          gold: '#F0A500', 'gold-light': '#F7B21F', 'gold-dark': '#9A6700',
          navy: '#0B0D14', 'navy-2': '#07080D', 'navy-3': '#11141C', 'navy-4': '#1A1E28',
          electric: '#4361EE', accent: '#E5484D',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      // Depth comes from layered neutral shadows, never from colored glow.
      boxShadow: {
        'gold': '0 8px 16px -4px rgba(0,0,0,0.5)',
        'gold-strong': '0 12px 24px -6px rgba(0,0,0,0.55)',
        'card': '0 1px 1px rgba(0,0,0,0.4), 0 8px 16px -4px rgba(0,0,0,0.35), 0 24px 48px -16px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
export default config

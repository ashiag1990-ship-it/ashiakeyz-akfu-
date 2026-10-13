import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'akfu-dark': '#0A0E27',
        'akfu-purple': '#2D1B4E',
        'akfu-cyan': '#00D9FF',
        'akfu-gold': '#D4AF37',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config

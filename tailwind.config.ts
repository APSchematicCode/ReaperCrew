import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // ✅ Direct mapping to the font name
        unifraktur: ['UnifrakturMaguntia', 'cursive'],
      },
    },
  },
  plugins: [],
}
export default config
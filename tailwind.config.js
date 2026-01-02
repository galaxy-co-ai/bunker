/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vault-Tec Primary
        'vault-yellow': '#f4d03f',
        'vault-blue': '#0080ff',
        'terminal-amber': '#ff9933',
        'terminal-green': '#00ff00',

        // Bunker Backgrounds
        'concrete-dark': '#0a0a0f',
        'concrete-med': '#1a1a1a',
        'metal-rust': '#2d2520',
        'metal-clean': '#2a2a2a',

        // Status Colors (Radiation Theme)
        'safe': '#00ff00',
        'caution': '#ffaa00',
        'warning': '#ff6600',
        'danger': '#ff0000',
        'critical': '#ff00ff',

        // Text Colors
        'text-primary': '#f4d03f',
        'text-secondary': '#ff9933',
        'text-terminal': '#00ff00',
        'text-muted': '#888888',

        // Border Colors
        'border-warning': '#ffaa00',
      },
      fontFamily: {
        'heading': ['Rajdhani', 'sans-serif'],
        'terminal': ['Share Tech Mono', 'monospace'],
        'body': ['Roboto Condensed', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 10px currentColor' },
          '50%': { opacity: '0.6', boxShadow: '0 0 5px currentColor' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
        },
      },
    },
  },
  plugins: [],
}

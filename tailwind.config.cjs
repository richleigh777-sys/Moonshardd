/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./{components,constants,context,hooks,lib,services,types,ui,utils,views}/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: 'var(--font-sans)',
        display: 'var(--font-display)',
        mono: 'var(--font-mono)',
      },
      colors: {
        'surface-main': 'hsl(var(--color-surface-main) / <alpha-value>)',
        'surface-alt': 'hsl(var(--color-surface-alt) / <alpha-value>)',
        'surface-highlight': 'hsl(var(--color-surface-highlight) / <alpha-value>)',
        'accent-primary': 'hsl(var(--color-accent-primary) / <alpha-value>)',
        'accent-secondary': 'hsl(var(--color-accent-secondary) / <alpha-value>)',
        'text-primary': 'hsl(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'hsl(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'hsl(var(--color-text-muted) / <alpha-value>)',
        'border-subtle': 'hsl(var(--color-border-subtle) / <alpha-value>)',
        'border-strong': 'hsl(var(--color-border-strong) / <alpha-value>)',
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        float: 'var(--shadow-float)',
      },
    },
  },
  plugins: [],
}

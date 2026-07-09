/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          canvas: 'hsl(var(--color-surface-canvas) / <alpha-value>)',
          widget: 'hsl(var(--color-surface-widget) / <alpha-value>)',
          main: 'hsl(var(--color-surface-main) / <alpha-value>)',
          alt: 'hsl(var(--color-surface-alt) / <alpha-value>)',
          highlight: 'hsl(var(--color-surface-highlight) / <alpha-value>)',
        },
        accent: {
          primary: 'hsl(var(--color-accent-primary) / <alpha-value>)',
          secondary: 'hsl(var(--color-accent-secondary) / <alpha-value>)',
        },
        text: {
          primary: 'hsl(var(--color-text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--color-text-secondary) / <alpha-value>)',
          muted: 'hsl(var(--color-text-muted) / <alpha-value>)',
        },
        border: {
          subtle: 'hsl(var(--color-border-subtle) / <alpha-value>)',
          strong: 'hsl(var(--color-border-strong) / <alpha-value>)',
        },
        status: {
          success: 'hsl(var(--color-status-success) / <alpha-value>)',
          warning: 'hsl(var(--color-status-warning) / <alpha-value>)',
          error: 'hsl(var(--color-status-error) / <alpha-value>)',
          info: 'hsl(var(--color-status-info) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}

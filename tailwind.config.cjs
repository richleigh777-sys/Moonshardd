/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

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
        'surface-widget': 'hsl(var(--color-surface-widget) / <alpha-value>)',
        'surface-canvas': 'hsl(var(--color-surface-canvas) / <alpha-value>)',
        
        'accent-primary': 'hsl(var(--color-accent-primary) / <alpha-value>)',
        'accent-secondary': 'hsl(var(--color-accent-secondary) / <alpha-value>)',
        
        'text-primary': 'hsl(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'hsl(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'hsl(var(--color-text-muted) / <alpha-value>)',
        
        'border-subtle': 'hsl(var(--color-border-subtle) / <alpha-value>)',
        'border-strong': 'hsl(var(--color-border-strong) / <alpha-value>)',

        'status-success': 'hsl(var(--color-status-success) / <alpha-value>)',
        'status-warning': 'hsl(var(--color-status-warning) / <alpha-value>)',
        'status-error': 'hsl(var(--color-status-error) / <alpha-value>)',

        /* Redirect standard hardcoded Tailwind colors used by previous devs */
        'emerald': {
          400: 'hsl(var(--color-emerald-400) / <alpha-value>)',
          500: 'hsl(var(--color-emerald-500) / <alpha-value>)',
          600: 'hsl(var(--color-emerald-600) / <alpha-value>)',
        },
        'amber': {
          400: 'hsl(var(--color-amber-400) / <alpha-value>)',
          500: 'hsl(var(--color-amber-500) / <alpha-value>)',
        },
        'red': {
          400: 'hsl(var(--color-red-400) / <alpha-value>)',
          500: 'hsl(var(--color-red-500) / <alpha-value>)',
          600: 'hsl(var(--color-red-500) / <alpha-value>)',
        },
        'indigo': {
          500: 'hsl(var(--color-indigo-500) / <alpha-value>)',
        },
        'blue': {
          500: 'hsl(var(--color-blue-500) / <alpha-value>)',
        }
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        float: 'var(--shadow-float)',
      },
    },
  },
  plugins: [],
}

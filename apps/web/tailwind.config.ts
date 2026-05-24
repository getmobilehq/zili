import type { Config } from 'tailwindcss';

/**
 * Tailwind maps onto the brand-canvas CSS variables (packages/brand-tokens).
 * Values are referenced via var() so the token file stays the single source
 * of truth — never hardcode brand hex/fonts here. See docs/zili-brand.html.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-deep': 'var(--paper-deep)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        gray: {
          1: 'var(--gray-1)',
          2: 'var(--gray-2)',
          3: 'var(--gray-3)',
          4: 'var(--gray-4)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          deep: 'var(--amber-deep)',
          tint: 'var(--amber-tint)',
        },
      },
      fontFamily: {
        ui: 'var(--font-ui)',
        display: 'var(--font-display)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        // Editorial sharp-corner scale — brand canvas forbids radius > 6px.
        sm: '3px',
        DEFAULT: '4px',
        lg: '6px',
        xl: '8px',
      },
    },
  },
  plugins: [],
};

export default config;

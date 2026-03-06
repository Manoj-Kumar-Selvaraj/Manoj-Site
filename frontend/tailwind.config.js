/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas:  'rgba(250,250,247,0.88)',
        surface: 'rgba(255,255,255,0.90)',
        cobalt: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Warm stone ink scale: ink-900 = near-black (primary text), ink-50 = near-white
        ink: {
          900: '#1C1917',
          800: '#292524',
          700: '#44403C',
          600: '#57534E',
          500: '#78716C',
          400: '#A8A29E',
          300: '#D6D3D1',
          200: '#E7E5E4',
          100: '#F5F5F4',
          50:  '#FAFAF9',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'float-1':    'float1 7s ease-in-out infinite',
        'float-2':    'float2 9s ease-in-out infinite',
        'float-3':    'float3 6s ease-in-out infinite',
        'float-4':    'float4 8s ease-in-out infinite',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'ticker':     'ticker 28s linear infinite',
        'spin-slow':  'spin 20s linear infinite',
      },
      keyframes: {
        float1: { '0%,100%': { transform: 'translateY(0px) translateX(0px)' },  '50%': { transform: 'translateY(-14px) translateX(4px)' } },
        float2: { '0%,100%': { transform: 'translateY(0px) translateX(0px)' },  '50%': { transform: 'translateY(-20px) translateX(-6px)' } },
        float3: { '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },      '50%': { transform: 'translateY(-10px) rotate(3deg)' } },
        float4: { '0%,100%': { transform: 'translateY(0px) translateX(0px)' },  '50%': { transform: 'translateY(-16px) translateX(8px)' } },
        ticker: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.07)',
        'card-md': '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        'cobalt':  '0 4px 20px rgba(37,99,235,0.25)',
      },
    },
  },
  plugins: [],
}

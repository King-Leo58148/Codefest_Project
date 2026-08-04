export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:      '#0A1628',
        'navy-mid':'#1A2E4A',
        'navy-light':'#243B55',
        accent:    '#22C55E',
        'accent-d':'#16A34A',
        'accent-t':'#86EFAC',
        muted:     '#F8FAFC',
        'text-sec':'#64748B',
        border:    '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #0A1628 0%, #1A2E4A 100%)',
      },
    },
  },
  plugins: [],
}
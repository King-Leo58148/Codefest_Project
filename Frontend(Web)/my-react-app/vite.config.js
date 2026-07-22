import { defineConfig } from 'vite'

export default defineConfig({
  // ...your existing config
  define: {
    global: 'window',
  },
})
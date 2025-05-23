import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las solicitudes que comienzan con /api al backend
      '/api': {
        target: 'http://127.0.0.1:5000', // URL de tu servidor Flask
        changeOrigin: true,
        // Opcional: reescribir la ruta si es necesario
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

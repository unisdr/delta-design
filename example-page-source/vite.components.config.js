import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({
  plugins: [react(), tailwind(), viteSingleFile()],
  build: { outDir: 'dist-components', emptyOutDir: true, rollupOptions: { input: 'components.html' }, chunkSizeWarningLimit: 4000 },
});

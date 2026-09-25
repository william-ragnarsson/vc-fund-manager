import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One self-contained index.html: scripts, styles, fonts and logos are inlined,
// so the demo runs offline and can be shared as a single file.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { assetsInlineLimit: 100_000_000, cssCodeSplit: false, target: 'es2020', modulePreload: { polyfill: false } },
});

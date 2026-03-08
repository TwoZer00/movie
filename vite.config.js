import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'update-sw-version',
      buildStart() {
        const fs = require('fs');
        const path = require('path');
        const swPath = path.resolve(__dirname, 'public/sw.js');
        let sw = fs.readFileSync(swPath, 'utf8');
        const version = Date.now().toString();
        sw = sw.replace(/const VERSION = '[^']+';/, `const VERSION = '${version}';`);
        fs.writeFileSync(swPath, sw);
      }
    }
  ],
})

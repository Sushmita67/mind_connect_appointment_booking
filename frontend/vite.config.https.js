const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const fs = require('fs')
const path = require('path')

// HTTPS Vite configuration
module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Bind to all interfaces
    open: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../ssl/frontend/private-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '../ssl/frontend/certificate.pem'))
    }
  }
}) 
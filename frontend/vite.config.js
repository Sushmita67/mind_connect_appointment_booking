const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const fs = require('fs')
const path = require('path')

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Bind to all interfaces
    open: true,
    // HTTPS is optional - uncomment the lines below to enable HTTPS
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, '../ssl/frontend/private-key.pem')),
    //   cert: fs.readFileSync(path.resolve(__dirname, '../ssl/frontend/certificate.pem'))
    // }
  }
}) 
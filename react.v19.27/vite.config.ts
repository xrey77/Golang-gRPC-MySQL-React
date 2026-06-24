import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true, 
        process: true,
      },
      protocolImports: true,
    }),
    react({
      exclude: [/\.template\.tsx$/],    
    }),  
  ],
  optimizeDeps: {
    // Ensure these are pre-bundled with polyfills
    include: ['buffer', 'process'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})



// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { nodePolyfills } from 'vite-plugin-node-polyfills';

// export default defineConfig({
//   plugins: [
//   nodePolyfills(),
//   react({
//     exclude: [/\.template\.tsx$/],    
//   }),  
//   ],
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//   },
//   // server: {
//   //   proxy: {
//   //     '/api': {
//   //       target: 'http://localhost:5000', // Docker service name
//   //       changeOrigin: true,
//   //       rewrite: (path) => path.replace(/^\/api/, '')
//   //     }
//   //   }
//   // },  

//   //local server
//   // server: {
//   //   origin: 'http://localhost:5173',
//   //   port: 5173,
//   // },  
// })



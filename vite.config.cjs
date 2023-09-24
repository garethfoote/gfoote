module.exports = {
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    rollupOptions: {
      input: 'assets/src/main.ts',
      output: {
        entryFileNames: `js/[name].js`,
        chunkFileNames: `js/[name].js`,
        // Works for CSS, will be a problem if we start
        // using images. Would export to, e.g., `assets/jpg/`
        assetFileNames: `[ext]/[name].[ext]`,
      }
    }
  }
}
  
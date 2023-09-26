module.exports = {
  base: "/gfoote/",
  build: {
    outDir: '.',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        entryFileNames: `assets/js/[name].js`,
        chunkFileNames: `assets/js/[name].js`,
        // Works for CSS, will be a problem if we start
        // using images. Would export to, e.g., `assets/jpg/`
        assetFileNames: `assets/[name].[ext]`,
      }
    }
  }
}
  
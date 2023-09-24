module.exports = {
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    rollupOptions: {
      input: 'assets/src/main.ts',
      output: {
        entryFileNames: `js/[name].js`,
        chunkFileNames: `js/[name].js`
      }
    }
  }
}
  
import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import markdown from './vitePlugin/vite-plugin-markdown'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(), 
    Unocss(),
    markdown()
  ],
})



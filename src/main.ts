import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css' // unocss
import { router } from "./router"
import './assets/styles/index.css'
import './components/ui/styles.css'
import { createPinia } from "pinia"

createApp(App)
.use(router)
.use(createPinia())
.mount('#app')

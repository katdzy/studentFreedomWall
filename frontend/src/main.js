import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  import('./utils/performance').then(({ logWebVitals }) => {
    logWebVitals()
  })
}

const app = createApp(App)

// Configure app for better performance
app.config.performance = import.meta.env.DEV

app.use(router).mount('#app')
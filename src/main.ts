import { createApp } from 'vue'
import naiveUi from 'naive-ui'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .use(naiveUi)
  .mount('#app')

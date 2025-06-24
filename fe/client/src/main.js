import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import { createVuetify } from 'vuetify'

const app = createApp(App)

const vuetify = createVuetify({
  components,
  directives,
})
app.use(createPinia())
app.use(vuetify);
app.use(Antd);
app.mount('#app')

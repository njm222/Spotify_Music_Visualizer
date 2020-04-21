import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueGtag from 'vue-gtag'

Vue.use(VueAxios, axios)
Vue.use(VueGtag, {
  config: {
    id: 'UA-133459521-1'
  }
}, router)

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://localhost:8081'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

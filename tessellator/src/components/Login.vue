<template>
  <div>
    <template v-if="this.user">
      <h1>Hello, {{this.user.display_name}}</h1>
      <router-link to="/dashboard">Go to Dashboard</router-link>
    </template>
    <template v-else>
      <div>
        <h1>Welcome Home</h1>
        <a href="http://localhost:8081/login">Login</a>
        <h4>A 3D interactive music visualizer.</h4>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getCookie } from '../services/cookie-utils'

@Component
export default class Login extends Vue {
  get user () {
    return this.$store.state.user
  }

  created (): void {
    this.$store.commit('mutateAccessToken', getCookie('accessToken'))
    if (this.$route.query) {
      Vue.axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: 'Bearer ' + this.$store.state.accessToken
        }
      }).then((response) => {
        console.log(response)
        this.$store.commit('mutateUser', response.data)
        console.log(this.$store.state.user)
      }).catch((error) => {
        console.log(error)
      })
    }
  }
}
</script>

<style scoped>

</style>

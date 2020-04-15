<template>
  <div>
    <template v-if="this.user">
      <h1>Hello, {{this.user.display_name}}</h1>
      <div>
        <router-link to="/dashboard">Go to Dashboard</router-link>
      </div>
      <div>
        <router-link to="/visualizer">Go to Visualizer</router-link>
      </div>
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getCookie, setCookie } from '@/services/cookie-utils'
import { addUser } from '@/services/firebase-utils'

@Component
export default class Login extends Vue {
  get user () {
    return this.$store.state.user
  }

  get accessToken () {
    return this.$store.state.accessToken
  }

  created (): void {
    this.$store.commit('mutateAccessToken', getCookie('accessToken'))
    this.$store.commit('mutateRefreshToken', getCookie('refreshToken'))
    Vue.axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + this.$store.state.accessToken
      }
    }).then((response) => {
      console.log(response)
      this.$store.commit('mutateUser', response.data)
      this.$store.dispatch('actionAuthUser', response.data)
    }).catch((error) => {
      console.log(error)
      this.refreshAccessToken()
    })
  }

  private refreshAccessToken () {
    Vue.axios.post('http://localhost:8081/refreshToken', {
      refreshToken: this.$store.state.refreshToken
    }).then((response) => {
      setCookie('accessToken', response.data.access_token)
      this.$store.commit('mutateAccessToken', getCookie('accessToken'))
    }).catch(console.log)
  }

  @Watch('user')
  onUserChanged (value: any, oldValue: object) {
    if (JSON.stringify(value) !== null && JSON.stringify(oldValue) !== JSON.stringify(value)) {
      console.log(false)
      addUser(value)
    }
  }
}
</script>

<style scoped>

</style>

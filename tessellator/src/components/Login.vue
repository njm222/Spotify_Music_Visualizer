<template>
  <div>
    <transition name="fade" mode="out-in">
      <div v-if="this.user" key="LoginTrue">
        <h1>hello, {{this.user.display_name}}</h1>
        <transition name="fade" mode="out-in">
          <div v-if="this.playerInfo" key="OpenVisualizer">
            <a @click="openVis">open visualizer</a>
          </div>
          <div v-else key="LoadingVisualizer">
            <p>loading visualizer</p>
          </div>
        </transition>
      </div>
      <div v-else key="LoginFalse">
        <h1>Welcome Home</h1>
        <a href="http://localhost:8081/login">Login</a>
        <h4>A 3D interactive music visualizer.</h4>
      </div>
    </transition>
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

  get playerInfo () {
    return this.$store.state.playerInfo
  }

  openVis () {
    this.$store.commit('mutateOpenVisualizer', true)
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

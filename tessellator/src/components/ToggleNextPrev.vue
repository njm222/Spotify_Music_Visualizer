<template>
  <div>
    <button @click="prevTrack(accessToken)">Prev</button>
    <button @click="nextTrack(accessToken)">Next</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { SpotifyPlayer } from '@/services/spotify-utils'

@Component
export default class ToggleNextPrev extends Vue {
  get accessToken () {
    return this.$store.state.accessToken
  }

  nextTrack (accessToken: string) {
    console.log('=== next player ====')
    Vue.axios.post('https://api.spotify.com/v1/me/player/next', {}, {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).then(res => {
      console.log(res)
    }).catch((error) => {
      console.log(error)
    })
  }

  prevTrack (accessToken: string) {
    console.log('=== prev player ====')
    Vue.axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).then(res => {
      console.log(res)
    }).catch((error) => {
      console.log(error)
    })
  }
}
</script>

<style scoped>

</style>

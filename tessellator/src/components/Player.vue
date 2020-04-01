<template>
  <div>
    <template v-if="this.accessToken">
      <h1>Player</h1>
      <div v-if="this.playerInfo">
        <a v-bind:href='this.playerInfo.spotifyLink' target='_blank'>
          <p>Track: {{this.playerInfo.track}}</p>
          <p>Artist: {{this.playerInfo.artist}}</p>
        </a>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { getCookie, setCookie } from '@/services/cookie-utils'

@Component
export default class Player extends Vue {
  get accessToken () {
    return this.$store.state.accessToken
  }

  get playerInfo () {
    return this.$store.state.playerInfo
  }

  mounted (): void {
    if (!document.getElementById('spotify-sdk')) {
      const sdk = document.createElement('script')
      sdk.setAttribute(
        'src',
        'https://sdk.scdn.co/spotify-player.js'
      )
      sdk.id = 'spotify-sdk'
      sdk.async = true
      this.sdkInit()
      document.head.appendChild(sdk)
    }
  }

  addPlayerListeners (player: Spotify.SpotifyPlayer): void {
    player.addListener('initialization_error', console.log)
    player.addListener('authentication_error', console.log)
    player.addListener('account_error', console.log)
    player.addListener('playback_error', console.log)
    player.addListener('ready', data => {
      console.log('Ready with deviceID ', data.device_id)
      this.playRandomTrack(data.device_id)
    })
    player.addListener('player_state_changed', data => {
      console.log('player state changed')
      if (data && data.position === 0) {
        console.log(data)
        this.getPlayerTrack()
      }
    })
  }

  sdkInit (): void {
    console.log('sdkInit')
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Visualizer Player',
        getOAuthToken: cb => { cb(this.$store.state.accessToken) }
      })
      this.addPlayerListeners(player)
      player.connect()
    }
  }

  private refreshAccessToken () {
    Vue.axios.post('http://localhost:8081/refreshToken', {
      refreshToken: this.$store.state.refreshToken
    }).then(response => {
      setCookie('accessToken', response.data.access_token)
      this.$store.commit('mutateAccessToken', getCookie('accessToken'))
    })
  }

  private play (device_id: string, track: string): void {
    console.log(track)
    console.log(device_id)
    Vue.axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
      uris: [track]
    }, {
      headers: { Authorization: 'Bearer ' + this.$store.state.accessToken }
    }).then(res => {
      console.log(res)
    }).catch((error) => {
      console.log(error)
      this.refreshAccessToken()
    })
  }

  private playRandomTrack (device_id: string) {
    Vue.axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: 'Bearer ' + this.$store.state.accessToken }
    }).then(response => {
      const randomTrack = response.data.items[Math.floor(Math.random() * 20)].uri
      this.play(device_id, randomTrack)
    })
  }

  private getPlayerTrack () {
    Vue.axios.get('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: 'Bearer ' + this.$store.state.accessToken }
    }).then(response => {
      if (response.data) {
        console.log('has new track DATA')
        console.log(response.data)
        const track = response.data.item.name
        const artist = response.data.item.artists[0].name
        const link = response.data.item.external_urls.spotify
        const playerInfo = { track: track, artist: artist, spotifyLink: link }
        this.$store.commit('mutatePlayerInfo', playerInfo)
        // send firebase Data as lastPlayed under /users/{uid}
        // send firestore aka server
      }
    }).catch(error => {
      console.log(error)
      this.refreshAccessToken()
    })
  }
}
</script>

<style scoped>

</style>

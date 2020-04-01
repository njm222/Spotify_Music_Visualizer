<template>
  <div>
    <template v-if="this.accessToken">
      <h1>Player</h1>
      <p>Track: {{this.playerTrack}}</p>
      <p>Artist: {{this.playerArtist}}</p>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Player extends Vue {
  get accessToken () {
    return this.$store.state.accessToken
  }

  get playerTrack () {
    return this.$store.state.playerTrack
  }

  get playerArtist () {
    return this.$store.state.playerArtist
  }

  created (): void {
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
      console.log(data)
      const track = data.track_window.current_track.name
      const artist = data.track_window.current_track.artists[0].name

      console.log(track)
      console.log(artist)
      this.$store.commit('mutatePlayerTrack', track)
      this.$store.commit('mutatePlayerArtist', artist)
    })
  }

  sdkInit (): void {
    console.log('sdkInit')
    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = this.$store.state.accessToken
      const player = new window.Spotify.Player({
        name: 'Visualizer Player',
        getOAuthToken: cb => { cb(token) }
      })
      this.addPlayerListeners(player)
      player.connect()
    }
  }

  private play (device_id: string, track: string): void {
    console.log(track)
    console.log(device_id)
    Vue.axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
      uris: [track]
    }, {
      headers: { Authorization: 'Bearer ' + this.$store.state.accessToken }
    }).then(res => {
      console.log('in PLAY')
      console.log(res)
    }).catch(console.log)
  }

  private playRandomTrack (device_id: string) {
    Vue.axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: 'Bearer ' + this.$store.state.accessToken }
    }).then(response => {
      const randomTrack = response.data.items[Math.floor(Math.random() * 20)].uri
      this.play(device_id, randomTrack)
    })
  }
}
</script>

<style scoped>

</style>

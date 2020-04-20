<template>
  <transition name="fadeUp">
    <div class="player-container" v-if="this.accessToken && this.playerInfo">
      <div v-if="this.hidePlayerToggle" class="hidden-player-bar">
        <a @click="showPlayer">show player</a>
      </div>
      <div v-else>
        <div class="player-bar">
          <a @click="hidePlayer">hide player</a>
          <TrackItem :trackDetails="this.playerInfo.track_window.current_track"></TrackItem>
          <SeekTrack :playerInfo="this.playerInfo"></SeekTrack>
          <PlayerControls></PlayerControls>
        </div>
      </div>
    </div>
  </transition>

</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { getCookie, setCookie } from '@/services/cookie-utils'
import { addTrackPlayed, addArtistsPlayed, firebaseRef } from '@/services/firebase-utils'
import TrackItem from '@/components/TrackItem.vue'
import SeekTrack from '@/components/SeekTrack.vue'
import PlayerControls from '@/components/PlayerControls.vue'
import { SpotifyAnalysis } from '@/services/spotify-utils'

@Component({
  components: { TrackItem, SeekTrack, PlayerControls }
})
export default class Player extends Vue {
  private hidePlayerToggle: boolean;

  constructor () {
    super()
    this.hidePlayerToggle = false
  }

  get SpotifyAnalysisUtils () {
    return this.$store.state.spotifyAnalysisUtils
  }

  get accessToken () {
    return this.$store.state.accessToken
  }

  get playerInfo () {
    return this.$store.state.playerInfo
  }

  get user () {
    return this.$store.state.user
  }

  hidePlayer () {
    this.hidePlayerToggle = true
  }

  showPlayer () {
    this.hidePlayerToggle = false
  }

  created (): void {
    if (!this.SpotifyAnalysisUtils) {
      this.$store.commit('mutateSpotifyAnalysisUtils', new SpotifyAnalysis())
    }
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
    player.addListener('initialization_error', data => {
      console.log('initialization_error')
      console.log(data)
    })
    player.addListener('authentication_error', data => {
      console.log('authentication_error')
      console.log(data)
    })
    player.addListener('account_error', data => {
      console.log('account_error')
      console.log(data)
    })
    player.addListener('playback_error', data => {
      console.log('playback_error')
      console.log(data)
    })
    player.addListener('ready', data => {
      console.log('Ready with deviceID ', data.device_id)
      this.$store.commit('mutateDeviceID', data.device_id)
      this.playRandomTrack(data.device_id)
    })
    player.addListener('player_state_changed', data => {
      console.log('player state changed')
      console.log(data)
      this.$store.commit('mutatePlayerInfo', data)
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
        // send firebase Data as lastPlayed under /users/{uid}
        this.sendTrackData(response.data.item)
        // send firestore aka server
        addTrackPlayed(response.data.item, this.$store.state.user.id)
        addArtistsPlayed(response.data.item, this.$store.state.user.id)
        // Get Audio Analysis from Spotify
        if (this.SpotifyAnalysisUtils) {
          this.SpotifyAnalysisUtils.getTrackFeaturesAnalysis(this.accessToken, this.$store.state.playerInfo.track_window.current_track.id)
        } else {
          console.log('SpotifyAnalysisUtils doesnt exist')
        }
      }
    }).catch(error => {
      console.log(error)
      this.refreshAccessToken()
    })
  }

  private sendTrackData (trackInfo: SpotifyApi.TrackLinkObject) {
    const userID: string = this.$store.state.user.id
    const ref = firebaseRef.firebase.database().ref(`users/${userID}/lastPlayed`)
    ref.set(trackInfo)
  }
}
</script>

<style scoped>
.fadeUp-enter, .fadeUp-leave-to {
  opacity: 0;
  transform: translateY(20vh);
}

.player-container {
  z-index: 1;
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  width: 100%;
  background: #282828;
}

.player-bar {
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 11vh;
  justify-content: space-between;
  padding: 0 16px;
}

.hidden-player-bar {
  opacity: 0.4;
}
</style>

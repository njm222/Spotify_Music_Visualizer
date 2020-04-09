<template>
  <div>
    <div>
      trackPos: {{millisToMinutesAndSeconds(trackPosition)}}
    </div>
    <div>
      duration: {{millisToMinutesAndSeconds(playerInfo.duration)}}
    </div>
    <div class='slider' @click="barClick">
      <div class='slider-bar' ref="sliderRef">
        <div class='slider-handle'
             :style="{ left: this.position + 'px' }"
             @mousedown="dragStart($event, 0)"></div>
        <div class='slider-process'
             :style="{ width: this.position + 'px' }"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { SpotifyPlayer } from '@/services/spotify-utils'

@Component
export default class SeekTrack extends Vue {
  @Prop({ required: true })
  playerInfo!: Spotify.PlaybackState

  private timerRef!: number;

  data () {
    return {
      position: 0,
      timer: null,
      dragging: false,
      sliderWidth: 0,
      offset: null
    }
  }

  created () {
    console.log('+++ created +++')
    this.$nextTick(() => {
      this.$data.sliderWidth = (this.$refs.sliderRef as HTMLElement).clientWidth
      this.$data.offset = (this.$refs.sliderRef as HTMLElement).getBoundingClientRect().left
      this.bindListener()
      this.trackTimer()
    })
  }

  destroyed () {
    this.stopTrackTimer()
  }

  get accessToken () {
    return this.$store.state.accessToken
  }

  get trackPosition () {
    return this.$store.state.trackPosition
  }

  millisToMinutesAndSeconds (millis: number) {
    const minutes = Math.floor(millis / 60000)
    const seconds = ((millis % 60000) / 1000).toFixed(0)
    return minutes + ':' + (parseInt(seconds) < 10 ? '0' : '') + seconds
  }

  bindListener () {
    document.addEventListener('mousemove', this.drag)
    document.addEventListener('mouseup', this.dragEnd)
  }

  private setPosition (pos: number) {
    this.$data.position = pos - 1
  }

  barClick (ev: any) {
    const pos = this.getPosition(ev)
    const trackPos = this.getTrackPosition(ev)
    this.setPosition(pos)
    this.seekPlayerPosition(this.accessToken, trackPos)
    this.$store.commit('mutateTrackPosition', trackPos)
  }

  dragStart () {
    this.$data.dragging = true
    console.log(this.$data.dragging)
  }

  drag (ev: any) {
    if (!this.$data.dragging) {
      return
    }
    const pos = this.getPosition(ev)
    const trackPos = this.getTrackPosition(ev)
    if (pos > 0 && pos < this.$data.sliderWidth) {
      this.setPosition(pos)
      this.$store.commit('mutateTrackPosition', trackPos)
    }
  }

  dragEnd (ev: any) {
    if (!this.$data.dragging) {
      return
    }
    this.seekPlayerPosition(this.accessToken, this.trackPosition)
    this.$data.dragging = false
  }

  getPosition (ev: any) {
    return ev.clientX - this.$data.offset
  }

  getTrackPosition (ev: any) {
    return Math.floor(((ev.clientX - this.$data.offset) / this.$data.sliderWidth) * this.playerInfo.duration)
  }

  seekPlayerPosition (accessToken: string, position: number) {
    console.log('=== seek player ====')
    Vue.axios.put(`https://api.spotify.com/v1/me/player/seek?position_ms=${position}`, {}, {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).then(res => {
      console.log(res)
    }).catch((error) => {
      console.log(error)
    })
  }

  private stopTrackTimer () {
    clearInterval(this.timerRef)
  }

  trackTimer () {
    /** Need to add to if statement */
    if (this.playerInfo.paused) {

    } else {
      this.$store.commit('mutateTrackPosition', this.trackPosition + 100)
    }
    this.timerRef = setTimeout(() => {
      this.trackTimer()
    }, 100)
  }

  @Watch('trackPosition')
  onTrackPositionChanged (value: number, oldValue: number) {
    if (value >= 0) {
      this.setPosition(Math.floor(value / this.playerInfo.duration * this.$data.sliderWidth))
    }
  }

  @Watch('playerInfo')
  onPlayerInfoChanged (value: Spotify.PlaybackState, oldValue: Spotify.PlaybackState) {
    if (value) {
      this.$store.commit('mutateTrackPosition', this.trackPosition)
    }
  }
}
</script>

<style scoped>
  .slider {
    width: auto;
    padding: 10px 50px;
  }

  .slider-bar {
    height: 6px;
    position: relative;
    display: block;
    border-radius: 15px;
    background-color: #212131;
  }

  .slider-handle {
    width: 16px;
    height: 16px;
    top: -5px;
    position: absolute;
    border-radius: 50%;
    background-color: #42b983;
    box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
    transition: all 0s;
    will-change: transform;
    cursor: pointer;
    z-index: 3;
    transition-duration: 0s;
    left: 0px;
  }

  .slider-handle:hover,
  .slider-handle:active{
    width: 20px;
    height: 20px;
    top: -7px;
  }

  .slider-process {
    background-color: #42b983;
    width: 0px;
    height: 6px;
    padding-right: 15px;
    border-radius: 15px;
  }
</style>

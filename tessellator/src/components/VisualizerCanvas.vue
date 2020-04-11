<template>
  <div class="sceneContainer">
    <div class="scene" ref="sceneRef">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import VisualizerUtils from '@/services/visualizer-utils'
import { SpotifyAnalysis } from '@/services/spotify-utils'

@Component
export default class VisualizerCanvas extends Vue {
  private visualizer: VisualizerUtils

  get trackID () {
    return this.$store.state.playerInfo.track_window.current_track.id
  }

  get accessToken () {
    return this.$store.state.accessToken
  }

  mounted () {
    this.setupCanvas()
  }

  constructor () {
    super()
    this.visualizer = new VisualizerUtils()
  }

  private setupCanvas () {
    const el = this.$refs.sceneRef as Element
    this.$nextTick(() => {
      this.visualizer.setupCanvas(el)
    })
  }
}
</script>

<style scoped>
  .sceneContainer {
    height: 100vh;
    width: 100vw;
  }
  .scene {
    width: 100%;
    height: 100%;
  }
</style>

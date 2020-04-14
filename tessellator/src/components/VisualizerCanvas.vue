<template>
  <div class="sceneContainer">
    <div class="scene" ref="sceneRef">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class VisualizerCanvas extends Vue {
  get VisualzierUtils () {
    return this.$store.state.visualizerUtils
  }

  get SpotifyAnalysisUtils () {
    return this.$store.state.spotifyAnalysisUtils
  }

  get accessToken () {
    return this.$store.state.accessToken
  }

  mounted () {
    this.setupVisualizer()
  }

  private setupVisualizer () {
    const el = this.$refs.sceneRef as Element
    this.$nextTick(() => {
      this.VisualzierUtils.setupCanvas(el, this.SpotifyAnalysisUtils)
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

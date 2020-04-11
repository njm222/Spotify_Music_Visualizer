<template>
  <div class="visualizer">
    <h1>Visualizer</h1>
    <Player v-if="this.$store.state.authUser"/>
    <VisualizerCanvas/>
  </div>
</template>

<script>
import Player from '@/components/Player'
import VisualizerCanvas from '@/components/VisualizerCanvas'
import LiveAudio from '@/services/liveAudio-utils'

export default {
  name: 'Visualizer',
  components: { Player, VisualizerCanvas }
}
</script>

<style scoped>

</style>

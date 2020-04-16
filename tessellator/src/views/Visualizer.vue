<template>
  <div class="visualizer">
    <Player v-if="this.$store.state.authUser"></Player>
    <VisualizerCanvas v-if="this.$store.state.playerInfo"></VisualizerCanvas>
    <VisualizerControls v-if="this.$store.state.modeKey"></VisualizerControls>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import Player from '@/components/Player'
import VisualizerCanvas from '@/components/VisualizerCanvas'
import VisualizerControls from '@/components/VisualizerControls'

@Component({
  components: { Player, VisualizerCanvas, VisualizerControls }
})
export default class Visualizer extends Vue {
}
</script>

<style scoped>

</style>

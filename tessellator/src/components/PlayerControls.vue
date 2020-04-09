<template>
  <div v-if="playerInfo">
    <TogglePausePlay :isPaused="playerInfo.paused"></TogglePausePlay>
    <ToggleShuffle :isShuffle="playerInfo.shuffle"></ToggleShuffle>
    <ToggleNextPrev></ToggleNextPrev>
    <SeekTrack :playerInfo="playerInfo"></SeekTrack>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import TogglePausePlay from '@/components/TogglePausePlay.vue'
import ToggleShuffle from '@/components/ToggleShuffle.vue'
import ToggleNextPrev from '@/components/ToggleNextPrev.vue'
import SeekTrack from '@/components/SeekTrack.vue'

@Component({
  components: { TogglePausePlay, ToggleShuffle, ToggleNextPrev, SeekTrack }
})
export default class PlayerControls extends Vue {
  get accessToken () {
    return this.$store.state.accessToken
  }

  get playerInfo () {
    return this.$store.state.playerInfo
  }
}
</script>

<style scoped>

</style>

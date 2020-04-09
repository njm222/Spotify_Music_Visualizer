<template>
  <div v-if="playerInfo">
    <TogglePausePlay :isPaused="playerInfo.paused"></TogglePausePlay>
    <ToggleShuffle :isShuffle="playerInfo.shuffle"></ToggleShuffle>
    <ToggleNextPrev></ToggleNextPrev>
    <SeekTrack :playerInfo="playerInfo"></SeekTrack>
    <SaveTrack :trackID="playerInfo.track_window.current_track.id"></SaveTrack>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import TogglePausePlay from '@/components/TogglePausePlay.vue'
import ToggleShuffle from '@/components/ToggleShuffle.vue'
import ToggleRepeat from '@/components/ToggleRepeat.vue'
import ToggleNextPrev from '@/components/ToggleNextPrev.vue'
import SeekTrack from '@/components/SeekTrack.vue'
import SaveTrack from '@/components/SaveTrack.vue'

@Component({
  components: { TogglePausePlay, ToggleShuffle, ToggleRepeat, ToggleNextPrev, SeekTrack, SaveTrack }
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

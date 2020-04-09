<template>
  <div v-if='trackDetails'>
    <a v-bind:href='trackDetails.external_urls.spotify' target='_blank'>
      {{ trackDetails.name }}
    </a>
    by
    <a v-bind:href='trackDetails.artists[0].external_urls.spotify' target='_blank'>
      {{trackDetails.artists[0].name}}
    </a>
    count: {{playedCount}}
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class TopTrack extends Vue {
  @Prop({ required: true })
  trackDetails!: SpotifyApi.TrackObjectFull

  @Prop({ required: true })
  playedCount!: number
}
</script>

<style scoped>

</style>

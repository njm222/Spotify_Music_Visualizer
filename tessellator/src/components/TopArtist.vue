<template>
  <div v-if='artistDetails'>
    <a v-bind:href='artistDetails.external_urls.spotify' target='_blank'>
      {{ artistDetails.name }}
    </a>
    count: {{playedCount}}
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class TopArtist extends Vue {
  @Prop({ required: true })
  artistDetails!: SpotifyApi.ArtistObjectFull

  @Prop({ required: true })
  playedCount!: number
}
</script>

<style scoped>

</style>

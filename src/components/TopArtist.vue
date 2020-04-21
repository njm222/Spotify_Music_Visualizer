<template>
  <div v-if='artistDetails' class="item-inner">
    <strong class="item-inner-text">{{ playedCount }}</strong>
    <a v-bind:href='artistDetails.external_urls.spotify' target='_blank' class="item-inner-text">
      {{ artistDetails.name }}
    </a>
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
  .item-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .item-inner .item-inner-text {
    margin: 0.5em 0;
  }
</style>

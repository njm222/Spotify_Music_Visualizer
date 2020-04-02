<template>
  <div v-if='onlineUser'>
    <a v-bind:href='onlineUser.spotifyLink' target='_blank'>
      {{onlineUser.user}} is online
    </a>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class OnlineItem extends Vue {
  @Prop({ required: true })
  onlineUser!: {
    user: string;
    spotifyLink: string;
  }

  constructor () {
    super()
    console.log(this.onlineUser)
  }
}
</script>

<style scoped>

</style>

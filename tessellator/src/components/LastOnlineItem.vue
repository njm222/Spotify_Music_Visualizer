<template>
  <div v-if='lastOnlineUser'>
    <a v-bind:href='lastOnlineUser.spotifyLink' target='_blank' :key="calculatedTime">
      {{lastOnlineUser.user}} was last online {{calculatedTime}} mins ago
    </a>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class LastPlayedItem extends Vue {
  @Prop({ required: true })
  lastOnlineUser!: {
    user: string;
    spotifyLink: string;
    lastOnline: number;
  }

  calculatedTime!: number

  constructor () {
    super()
    console.log(this.lastOnlineUser)
    this.calcTime()
  }

  calcTime () {
    const currTime: any = new Date()
    const time = Math.floor((currTime - this.lastOnlineUser.lastOnline) / 60000)
    this.calculatedTime = time
    console.log('changed time to ' + time)
    setTimeout(this.calcTime, 60000)
  }
}
</script>

<style scoped>

</style>

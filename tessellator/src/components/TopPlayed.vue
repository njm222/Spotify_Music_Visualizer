<template>
  <div>
    <div v-if="this.topTracks">
      <h2>Top Tracks Played</h2>
      <div v-for='(item, i) in topTracks' :key='item + i'>
        <TopTrack :trackDetails="item.data().trackData" :playedCount="item.data().count"></TopTrack>
      </div>
    </div>
    <div v-if="this.topArtists">
      <h2>Top Artists Played</h2>
      <div v-for='(item, i) in topArtists' :key='item + i'>
        <TopArtist :artistDetails="item.data().artistData" :playedCount="item.data().count"></TopArtist>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import TopTrack from '@/components/TopTrack.vue'
import TopArtist from '@/components/TopArtist.vue'
import { firebaseRef } from '@/services/firebase-utils'

@Component({
  components: { TopTrack, TopArtist }
})
export default class TopPlayed extends Vue {
  get topTracks () {
    return this.$store.state.topTracks
  }

  get topArtists () {
    return this.$store.state.topArtists
  }

  constructor () {
    super()
    console.log('loaded top tracks')
    this.loadTopTracks()
    this.loadTopArtists()
  }

  private loadTopTracks () {
    console.log('getTracks')
    const topTracksRef = firebaseRef.firebase.firestore().collection('topUserTracks')
    topTracksRef.orderBy('count', 'desc').limit(25).onSnapshot(collectionSnapshot => {
      console.log(`Received doc snapshot: ${collectionSnapshot}`)
      this.$store.commit('mutateTopTracks', collectionSnapshot.docs)
    },
    error => {
      console.log(`Encountered error: ${error}`)
    })
  }

  private loadTopArtists () {
    console.log('getArtists')
    const topTracksRef = firebaseRef.firebase.firestore().collection('topUserArtists')
    topTracksRef.orderBy('count', 'desc').limit(25).onSnapshot(collectionSnapshot => {
      console.log(`Received doc snapshot: ${collectionSnapshot}`)
      this.$store.commit('mutateTopArtists', collectionSnapshot.docs)
    },
    error => {
      console.log(`Encountered error: ${error}`)
    })
  }
}
</script>

<style scoped>

</style>

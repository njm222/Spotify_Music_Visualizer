<template>
  <div class="outer-container">
    <div class="container">
      <h2>Top Tracks Played</h2>
      <transition name="fadeUp" mode="out-in">
        <div v-if="this.topTracks" key="topTracksCommunity">
          <div v-for='(item, i) in topTracks' :key='item + i' class="item">
            <TopTrack :trackDetails="item.data().trackData" :playedCount="item.data().count"></TopTrack>
          </div>
        </div>
        <div v-else key="topTracksCommunityLoading">
          <p>loading ...</p>
        </div>
      </transition>
    </div>
    <div class="container">
      <h2>Top Artists Played</h2>
      <transition name="fadeUp">
        <div v-if="this.topArtists" key="topArtistsCommunity">
          <div v-for='(item, i) in topArtists' :key='item + i' class="item">
            <TopArtist :artistDetails="item.data().artistData" :playedCount="item.data().count"></TopArtist>
          </div>
        </div>
        <div v-else key="topArtistsCommunityLoading">
          <p>loading ...</p>
        </div>
      </transition>
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
    topTracksRef.orderBy('count', 'desc').limit(10).onSnapshot(collectionSnapshot => {
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
    topTracksRef.orderBy('count', 'desc').limit(10).onSnapshot(collectionSnapshot => {
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
  .fadeUp-enter-active, .fadeUp-leave-active {
    transition: all 1s;
  }
  .fadeUp-enter, .fadeUp-leave-to {
    opacity: 0;
    transform: translateY(100vh);
  }
  .outer-container {
    display: flex;
    justify-content: space-evenly;
  }
  .container {
    display: flex;
    flex-direction: column;
    margin: 0px 2em;
  }
  .item {
    display: flex;
    justify-content: center;
    padding: 1.5em;
  }
  .item:hover {
    background-color: hsla(0,0%,100%,0.1);
  }
</style>

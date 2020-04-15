<template>
  <div v-if="this.userPlaylists && this.userPlaylists !== 0">
    <h2>Your Playlists</h2>
    <div class="playlists-container">
      <div v-for='(item, i) in userPlaylists.items' :key='item + i'>
        <UserPlaylist :playlistDetails="item" :userID ="user.id"></UserPlaylist>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import UserPlaylist from '@/components/UserPlaylist.vue'

@Component({
  components: { UserPlaylist }
})
export default class MyPlaylists extends Vue {
  get userPlaylists () {
    return this.$store.state.userPlaylists
  }

  get user () {
    return this.$store.state.user
  }

  constructor () {
    super()
    console.log('loaded playlists')
    this.getThisUsersPlaylists()
  }

  private getThisUsersPlaylists () {
    console.log('get')
    Vue.axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: 'Bearer ' + this.$store.state.accessToken
      }
    }).then((response) => {
      console.log(response.data.items)
      this.$store.commit('mutateUserPlaylists', response.data)
    }).catch((error) => {
      console.log(error)
    })
  }
}
</script>

<style scoped>

</style>

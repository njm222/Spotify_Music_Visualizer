<template>
  <div>
    <div v-if="this.usersPlaylists.get(userID)">
      <div v-for='(playlist) in this.usersPlaylists.get(userID)' :key="userID + playlist.id">
        <UserPlaylist :playlistDetails="playlist" :userID="userID"></UserPlaylist>
      </div>
      <button @click="hideUserPlaylists(userID)">Hide {{userID}}'s playlists</button>
    </div>
    <div v-else>
      <button @click="getOnlineUserPlaylists(userID)">load {{userID}}'s playlists</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import UserPlaylist from '@/components/UserPlaylist.vue'

@Component({
  components: { UserPlaylist }
})
export default class UserPlaylists extends Vue {
  @Prop({ required: true })
  userID!: string;

  get usersPlaylists () {
    return this.$store.state.usersPlaylists
  }

  hideUserPlaylists (userID: string) {
    console.log(`hiding ${userID}'s playlists`)
    this.$store.commit('mutateUsersPlaylists', {
      key: userID, value: false
    })
  }

  private getOnlineUserPlaylists (userID: string) {
    console.log(`getting ${userID}'s playlists`)
    Vue.axios.get(`https://api.spotify.com/v1/users/${userID}/playlists`, {
      headers: {
        Authorization: 'Bearer ' + this.$store.state.accessToken
      }
    }).then((response) => {
      this.$store.commit('mutateUsersPlaylists', {
        key: userID,
        value: response.data.items
      })
    }).catch((error) => {
      console.log(error)
    })
  }
}
</script>

<style scoped>

</style>

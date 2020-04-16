<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <Login :key="this.$store.state.accessToken"/>
    <Player v-if="this.$store.state.authUser"/>
    <MyPlaylists v-if="this.$store.state.authUser"/>
    <OnlineUsers v-if="this.$store.state.user" :key="this.$store.state.authUser"/>
  </div>
</template>

<script>
// @ is an alias to /src
import Login from '@/components/Login.vue'
import OnlineUsers from '@/components/OnlineUsers.vue'
import Player from '@/components/Player.vue'
import MyPlaylists from '@/components/MyPlaylists.vue'

export default {
  name: 'Home',
  components: {
    Login,
    OnlineUsers,
    Player,
    MyPlaylists
  }
}
</script>

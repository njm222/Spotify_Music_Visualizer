<template>
    <div>
        <div v-if='onlineUsers && onlineUsers.size !== 0'>
            <h1>Online Users ({{onlineUsers.size}})</h1>
            <div v-for='(item, i) in onlineUsers.values()' :key='i'>
              <OnlineItem :onlineUser="item"></OnlineItem>
              <LastPlayedItem :trackDetails="item.lastPlayed"></LastPlayedItem>
            </div>
        </div>
        <div v-else-if="lastOnlineUsers">
            <h1>Last Online Users</h1>
            <div v-for='(item, i) in lastOnlineUsers.values()' :key="item.user + i">
              <LastOnlineItem :lastOnlineUser="item"></LastOnlineItem>
              <LastPlayedItem :trackDetails="item.lastPlayed"></LastPlayedItem>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { firebaseRef } from '@/services/firebase-utils'
import LastPlayedItem from '@/components/LastPlayedItem.vue'
import LastOnlineItem from '@/components/LastOnlineItem.vue'
import OnlineItem from '@/components/OnlineItem.vue'

@Component({
  components: { LastPlayedItem, LastOnlineItem, OnlineItem }
})
export default class OnlineUsers extends Vue {
  get onlineUsers () {
    return this.$store.state.onlineUsers
  }

  get lastOnlineUsers () {
    return this.$store.state.lastOnlineUsers
  }

  created () {
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
      this.loadOnline()
      this.loadLastOnline()
    })
  }

  loadOnline () {
    const onlineU = new Map<number, any>()
    firebaseRef.firebase.database().ref('users/').on('value', (snapshot: any) => {
      onlineU.clear()
      snapshot.forEach((user: any) => {
        const onlineUserData = {
          user: user.child('connections').val(),
          spotifyLink: user.child('spotifyLink').val(),
          lastPlayed: user.child('lastPlayed').val()
        }
        if (onlineUserData.user) {
          onlineU.set(onlineUserData.spotifyLink, onlineUserData)
        } else {
          onlineU.delete(onlineUserData.spotifyLink)
        }
      })
      if (onlineU.size === 0) {
        this.$store.commit('mutateOnlineUsers', null)
        this.loadLastOnline()
      } else {
        this.$store.commit('mutateOnlineUsers', onlineU)
      }
    })
  }

  loadLastOnline () {
    const lastOnlineU = new Map<number, any>()
    firebaseRef.firebase.database().ref('users/').orderByChild('lastOnline').on('value', (snapshot: any) => {
      lastOnlineU.clear()
      snapshot.forEach((user: any) => {
        const lastOnlineUserData = {
          user: user.key,
          spotifyLink: user.child('spotifyLink').val(),
          lastPlayed: user.child('lastPlayed').val(),
          lastOnline: user.child('lastOnline').val()
        }
        lastOnlineU.set(lastOnlineUserData.user, lastOnlineUserData)
      })
      this.$store.commit('mutateLastOnlineUsers', lastOnlineU)
    })
  }
}
</script>

<style scoped>

</style>

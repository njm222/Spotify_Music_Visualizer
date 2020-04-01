<template>
    <div>
        <div v-if='onlineUsers && onlineUsers.size !== 0'>
            <h1>Online Users ({{onlineUsers.size}})</h1>
            <div v-for='(item, i) in onlineUsers.values()' :key='i'>
                <a v-bind:href='item.spotifyLink' target='_blank'>{{item.user}}</a>
            </div>
        </div>
        <div v-else>
            <h1>Last Online Users</h1>
            <div v-for='(item) in lastOnlineUsers' :key='item.user'>
                <a v-bind:href='item.spotifyLink' target='_blank'>
                    {{item.user}} was last online {{Math.floor((Date.now() - item.lastOnline)/60000)}} mins ago
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { firebaseRef } from '@/services/firebase-utils'

@Component
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
        const userData = { user: user.child('connections').val(), spotifyLink: user.child('spotifyLink').val() }
        if (userData.user) {
          onlineU.set(userData.spotifyLink, userData)
        } else {
          onlineU.delete(userData.spotifyLink)
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
        const userData = { user: user.key, lastOnline: user.child('lastOnline').val(), spotifyLink: user.child('spotifyLink').val() }
        lastOnlineU.set(userData.user, userData)
      })
      this.$store.commit('mutateLastOnlineUsers', lastOnlineU.values())
    })
  }
}
</script>

<style scoped>

</style>

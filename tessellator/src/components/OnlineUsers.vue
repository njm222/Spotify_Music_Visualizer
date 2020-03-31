<template>
    <div>
        <h1>Online Users</h1>
        <div>
            <div v-for='(item, i) in onlineUsers' :key='i'>
                {{item.user}}
            </div>
        </div>
        <h1>Last Online Users</h1>
        <div>
            <div v-for='(item) in lastOnlineUsers' :key='item.user'>
                {{item.user}}
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
      snapshot.forEach((user: any) => {
        const temp = { user: user.child('connections').val() }
        onlineU.set(temp.user, temp)
      })
      if (onlineU.size === 0) {
        this.loadLastOnline()
      }
      this.$store.commit('mutateOnlineUsers', onlineU.values())
    })
  }

  loadLastOnline () {
    console.log('empty')
    const lastOnlineU = new Map<number, any>()
    firebaseRef.firebase.database().ref('users/').on('value', (snapshot: any) => {
      snapshot.forEach((user: any) => {
        console.log(user)
        const temp = { user: user.child('lastOnline').val() }
        lastOnlineU.set(temp.user, temp)
      })
      this.$store.commit('mutateLastOnlineUsers', lastOnlineU.values())
    })
  }
}
</script>

<style scoped>

</style>

<template>
    <div>
        <h1>Online Users</h1>
        <div>
            <div v-for='(item, i) in onlineUsers' :key='i'>
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

  created () {
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
      this.loadOnline()
    })
  }

  loadOnline () {
    const onlineU = new Map<number, any>()
    firebaseRef.firebase.database().ref('users/').on('value', (snapshot: any) => {
      snapshot.forEach((user: any) => {
        const temp = { user: user.child('connections').val() }
        onlineU.set(temp.user, temp)
      })
      if (onlineU.length === 0) {
        this.loadLastOnline()
      }
      this.$store.commit('mutateOnlineUsers', onlineU.values())
    })
  }

  loadLastOnline () {
    console.log('empty')
  }
}
</script>

<style scoped>

</style>

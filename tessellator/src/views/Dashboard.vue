<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <UserInfo/>
    <UserPresets/>
  </div>
</template>

<script>
import UserInfo from '@/components/UserInfo.vue'
import UserPresets from '@/components/UserPresets.vue'

export default {
  name: 'Dashboard',
  components: {
    UserInfo,
    UserPresets
  }
}
</script>

<style scoped>

</style>

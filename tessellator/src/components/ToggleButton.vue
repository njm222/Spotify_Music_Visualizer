<template>
  <div>
    <button @click="isToggled = !isToggled">
      <slot></slot>
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ToggleButton extends Vue {
  data () {
    return {
      isToggled: false
    }
  }
}
</script>

<style scoped>

</style>

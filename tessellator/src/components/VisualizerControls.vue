<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class VisualizerControls extends Vue {
  mounted () {
    window.addEventListener('keypress', this.doCommand)
  }

  beforeDestroy (): void {
    window.removeEventListener('keypress', this.doCommand)
  }

  doCommand (keyPress: KeyboardEvent) {
    const cmd = keyPress.key.toLowerCase()
    console.log(cmd)

    if (parseInt(cmd) === 0) {
      this.$store.commit('mutateModeKey', 0)
    } else if (parseInt(cmd) === 1) {
      this.$store.commit('mutateModeKey', 1)
    } else if (parseInt(cmd) === 2) {
      this.$store.commit('mutateModeKey', 2)
    } else if (parseInt(cmd) === 3) {
      this.$store.commit('mutateModeKey', 3)
    } else if (parseInt(cmd) === 4) {
      this.$store.commit('mutateModeKey', 4)
    } else if (cmd === 'q') {
      this.$store.commit('mutateColourKey', 1)
    } else if (cmd === 'a') {
      this.$store.commit('mutateColourKey', 2)
    } else if (cmd === 'z') {
      this.$store.commit('mutateColourKey', 3)
    } else if (cmd === 'w') {
      this.$store.commit('mutateColourKey', 4)
    } else if (cmd === 's') {
      this.$store.commit('mutateColourKey', 5)
    } else if (cmd === 'x') {
      this.$store.commit('mutateColourKey', 6)
    } else if (cmd === 'e') {
      this.$store.commit('mutateColourKey', 7)
    } else if (cmd === 'd') {
      this.$store.commit('mutateColourKey', 8)
    } else if (cmd === 'c') {
      this.$store.commit('mutateColourKey', 10)
    }
  }
}
</script>

<style scoped>

</style>

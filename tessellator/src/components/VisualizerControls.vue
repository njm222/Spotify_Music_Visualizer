<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class VisualizerCanvas extends Vue {
  get VisualzierUtils () {
    return this.$store.state.visualizerUtils
  }

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
      this.VisualzierUtils.modeKey = 0
    } else if (parseInt(cmd) === 1) {
      this.VisualzierUtils.modeKey = 1
    } else if (parseInt(cmd) === 2) {
      this.VisualzierUtils.modeKey = 2
    } else if (cmd === 'w') {
      this.VisualzierUtils.colourKey = 4
    } else if (cmd === 's') {
      this.VisualzierUtils.colourKey = 5
    } else if (cmd === 'x') {
      this.VisualzierUtils.colourKey = 6
    } else if (cmd === 'e') {
      this.VisualzierUtils.colourKey = 7
    } else if (cmd === 'd') {
      this.VisualzierUtils.colourKey = 8
    } else if (cmd === 'c') {
      this.VisualzierUtils.colourKey = 9
    }
  }
}
</script>

<style scoped>

</style>

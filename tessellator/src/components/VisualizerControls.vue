<template>
  <div class="controls-container">
    <transition name="fadeRight" mode="out-in">
      <div v-if="this.isOpen" class="child" key="OpenVisualizerControls">
        <div class="controls">
          <a @click="closeVis">close visualizer</a>
          <div>
            Mode:

            <strong>{{this.ModeKey}}</strong>
          </div>
          <div>
            Colour:

            <strong>{{this.ColourKey}}</strong>
          </div>
          <a @click="toggleRandomMode" v-bind:style="{color: (this.RandomMode? '#3AD36B' : '#FFF')}">
            Randomize Mode
          </a>
          <a @click="toggleRandomColour" v-bind:style="{color: (this.RandomColour? '#3AD36B' : '#FFF')}">
            Randomize Colour
          </a>
          <a @click="toggleCameraZoom" v-if="this.ModeKey > 1" v-bind:style="{color: (this.CameraZoomToggle? '#3AD36B' : '#FFF')}">
            Camera Zoom
          </a>
          <a @click="toggleCameraRotate" v-if="this.ModeKey > 1" v-bind:style="{color: (this.CameraRotateToggle? '#3AD36B' : '#FFF')}">
            Camera Rotate
          </a>
          <a @click="hideControls"> hide controls </a>
        </div>
      </div>
      <div v-else class="child closed" key="CloseVisualizerControls">
        <div class="hidden-controls-container">
          <a @click="showControls"> > </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class VisualizerControls extends Vue {
  private isOpen: boolean;

  constructor () {
    super()
    this.isOpen = false
  }

  get CameraZoomToggle () {
    return this.$store.state.cameraZoomToggle
  }

  get CameraRotateToggle () {
    return this.$store.state.cameraRotateToggle
  }

  get RandomMode () {
    return this.$store.state.randomMode
  }

  get RandomColour () {
    return this.$store.state.randomColour
  }

  get ModeKey () {
    return this.$store.state.modeKey
  }

  get ColourKey () {
    return this.$store.state.colourKey
  }

  toggleCameraZoom () {
    this.$store.commit('mutateCameraZoomToggle', !this.CameraZoomToggle)
  }

  toggleCameraRotate () {
    this.$store.commit('mutateCameraRotateToggle', !this.CameraRotateToggle)
  }


  toggleRandomMode () {
    this.$store.commit('mutateRandomMode', !this.RandomMode)
  }

  toggleRandomColour () {
    this.$store.commit('mutateRandomColour', !this.RandomColour)
  }

  closeVis () {
    this.$store.commit('mutateOpenVisualizer', false)
  }

  hideControls () {
    this.isOpen = false
    console.log(this.isOpen)
  }

  showControls () {
    this.isOpen = true
    console.log(this.isOpen)
  }

  mounted () {
    window.addEventListener('keypress', this.doCommand)
  }

  beforeDestroy () {
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
    } else if (parseInt(cmd) === 5) {
      this.$store.commit('mutateModeKey', 5)
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
.fadeRight-enter-active, .fadeRight-leave-active {
  transition: all 0.5s;
}
.fadeRight-enter, .fadeRight-leave-to {
  opacity: 0;
  transform: translateX(-15vw);
}

.controls-container .child {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 1.5em;
  height: 100%;
  background: #292929;
  opacity: 0.9;
}

.controls-container .child.closed {
  opacity: 0.3;
}

.controls {
  width: 10vw;
  height: 70%;
  padding: 15vh 0.5em;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.hidden-controls-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.hidden-controls-container a {
  font-size: 3vh;
  padding: 0.1em;
}
</style>

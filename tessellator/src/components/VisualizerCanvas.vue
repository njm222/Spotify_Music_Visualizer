<template>
  <div class="sceneContainer">
    <div class="scene" ref="sceneRef">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import LiveAudio from '@/services/liveAudio-utils'
import * as THREE from 'three'
import SimplexNoise from 'simplex-noise'
import Stats from 'three/examples/jsm/libs/stats.module'

@Component
export default class VisualizerCanvas extends Vue {
  static liveAudio: LiveAudio;
  static noise: SimplexNoise;
  static scene: THREE.Scene;
  static camera: THREE.PerspectiveCamera;
  static renderer: THREE.WebGLRenderer;
  static shapeArr: THREE.Mesh[];
  static shapeMax: number;
  static layerMarker: number[];
  static shapeColour: string;
  static freqKey: number;
  static spinConstants: number[];
  private changingMode: boolean;
  private stats: any;
  private animationID!: number
  private rotateToggle: boolean;

  constructor (props) {
    super(props)
    VisualizerCanvas.liveAudio = new LiveAudio()
    VisualizerCanvas.noise = new SimplexNoise()
    VisualizerCanvas.camera = new THREE.PerspectiveCamera()
    VisualizerCanvas.renderer = new THREE.WebGLRenderer({ antialias: true })
    VisualizerCanvas.scene = new THREE.Scene()
    VisualizerCanvas.shapeArr = []
    VisualizerCanvas.shapeMax = 529
    VisualizerCanvas.layerMarker = []
    VisualizerCanvas.shapeColour = '#FFF'
    VisualizerCanvas.freqKey = 4
    VisualizerCanvas.spinConstants = [0.03, 0.015, 0.075, 0.0025, 0.001]
    this.changingMode = false
    this.rotateToggle = true
  }

  get ModeKey () {
    return this.$store.state.modeKey
  }

  get ColourKey () {
    return this.$store.state.colourKey
  }

  get SpotifyAnalysisUtils () {
    return this.$store.state.spotifyAnalysisUtils
  }

  get accessToken () {
    return this.$store.state.accessToken
  }

  get PlayerInfo () {
    return this.$store.state.playerInfo
  }

  mounted () {
    if (VisualizerCanvas.shapeArr.length === 0) {
      console.log('Empty visualizer')
      this.setupVisualizer()
    }
    this.$store.commit('mutateModeKey', 1)
    this.$store.commit('mutateColourKey', '#FFF')
    // stats
    this.stats = new (Stats as any)()
    document.body.appendChild(this.stats.dom)
  }

  beforeDestroy () {
    this.removeShape()
    cancelAnimationFrame(this.animationID)
  }

  private setupVisualizer () {
    const el = this.$refs.sceneRef as Element
    this.$nextTick(() => {
      VisualizerCanvas.camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000)
      VisualizerCanvas.renderer.setSize(el.clientWidth, el.clientHeight)
      VisualizerCanvas.camera.aspect = el.clientWidth / el.clientHeight
      console.log(el.children)
      el.appendChild(VisualizerCanvas.renderer.domElement)

      this.canvasResizeListener(el)

      this.addLighting()
      this.addShape(1)
      this.setShapePosition()
      VisualizerCanvas.camera.position.z = 90

      this.animate()
    })
  }

  private animate () {
    this.animationID = requestAnimationFrame(this.animate)

    this.renderer()
  }

  private renderer () {
    this.stats.begin()
    if (this.SpotifyAnalysisUtils.trackAnalysis && this.SpotifyAnalysisUtils.trackFeatures) {
      // Live Audio
      VisualizerCanvas.liveAudio.getData()

      if (!this.PlayerInfo.paused && !this.changingMode) {
        // Colour
        this.setColour(this.ColourKey, this.SpotifyAnalysisUtils)

        if (this.rotateToggle) {
          for (let i = 0; i < VisualizerCanvas.shapeArr.length; i++) {
            this.rotateShape(VisualizerCanvas.shapeArr[i])
          }
        }
        // Mode
        this.doMode(this.ModeKey, this.SpotifyAnalysisUtils)
      } else {
        console.log('pausing player')
      }
    } else {
      console.log('no track features')
    }

    VisualizerCanvas.camera.updateProjectionMatrix()
    VisualizerCanvas.renderer.render(VisualizerCanvas.scene, VisualizerCanvas.camera)
    this.stats.end()
  }

  private mode1 (SpotifyAnalysisUtils: any) {
    if (SpotifyAnalysisUtils.barCounter > 3) {
      for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 4]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 3]; i++) {
        this.changeColour(VisualizerCanvas.shapeArr[i], '0x0000')
      }
      for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 2]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter]; i++) {
        this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
      }
    } else {
      if (SpotifyAnalysisUtils.beatCounter !== 0) {
        for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 1]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter]; i++) {
          this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
        }
      }
      this.changeColour(VisualizerCanvas.shapeArr[0], VisualizerCanvas.shapeColour)
    }

    if (SpotifyAnalysisUtils.beatCounter > VisualizerCanvas.layerMarker.length - 1) {
      SpotifyAnalysisUtils.beatCounter = 0
    }
  }

  private mode2 (SpotifyAnalysisUtils: any) {
    if (SpotifyAnalysisUtils.beatCounter > 3) {
      for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 4]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 3]; i = i + 2) {
        this.changeColour(VisualizerCanvas.shapeArr[i], '0x0000')
      }
      for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 2]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter]; i = i + 2) {
        this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
      }
    } else {
      if (SpotifyAnalysisUtils.beatCounter !== 0) {
        for (let i = VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter - 1]; i < VisualizerCanvas.layerMarker[SpotifyAnalysisUtils.beatCounter]; i = i + 2) {
          this.changeColour(VisualizerCanvas.shapeArr[i], VisualizerCanvas.shapeColour)
        }
      } else {
        this.changeColour(VisualizerCanvas.shapeArr[0], VisualizerCanvas.shapeColour)
      }
    }

    if (SpotifyAnalysisUtils.beatCounter > VisualizerCanvas.layerMarker.length - 1) {
      SpotifyAnalysisUtils.beatCounter = 0
    }
  }

  private mode3 (SpotifyAnalysisUtils: any) {
    let noiseFreq: number
    if (SpotifyAnalysisUtils.trackFeatures.valence > 0.7) {
      noiseFreq = ((VisualizerCanvas.liveAudio.bassObject.bassAv) / (SpotifyAnalysisUtils.trackFeatures.energy * SpotifyAnalysisUtils.trackFeatures.danceability * SpotifyAnalysisUtils.trackFeatures.valence)) + VisualizerCanvas.liveAudio.kickObject.kickAv
    } else if (SpotifyAnalysisUtils.trackFeatures.valence > 0.4) {
      noiseFreq = (VisualizerCanvas.liveAudio.bassObject.bassAv + VisualizerCanvas.liveAudio.kickObject.kickAv + VisualizerCanvas.liveAudio.highsObject.highsAv - VisualizerCanvas.liveAudio.midsObject.midsAv) / SpotifyAnalysisUtils.trackFeatures.energy
    } else if (this.SpotifyAnalysisUtils.trackFeatures.valence > 0.1) {
      noiseFreq = (VisualizerCanvas.liveAudio.bassObject.bassAv + VisualizerCanvas.liveAudio.kickObject.kickAv - VisualizerCanvas.liveAudio.midsObject.midsAv) / SpotifyAnalysisUtils.trackFeatures.danceability
    } else {
      noiseFreq = ((VisualizerCanvas.liveAudio.bassObject.bassAv + VisualizerCanvas.liveAudio.kickObject.kickAv - VisualizerCanvas.liveAudio.midsObject.midsAv) / SpotifyAnalysisUtils.trackFeatures.energy)
    }

    const zHeight = (SpotifyAnalysisUtils.trackFeatures.energy * SpotifyAnalysisUtils.trackFeatures.danceability * (VisualizerCanvas.liveAudio.rms + VisualizerCanvas.liveAudio.highsObject.highsAv))
    const speed = (Date.now() + VisualizerCanvas.liveAudio.bassObject.bassEnergy + VisualizerCanvas.liveAudio.kickObject.kickEnergy) / (SpotifyAnalysisUtils.trackFeatures.tempo * SpotifyAnalysisUtils.trackFeatures.danceability * SpotifyAnalysisUtils.trackFeatures.energy * 50)

    const shapeGeo = VisualizerCanvas.shapeArr[0].geometry as THREE.BufferGeometry
    const position = shapeGeo.getAttribute('position') as THREE.BufferAttribute

    for (let i = 0; i < position.count; i++) {
      const z = VisualizerCanvas.calcPlanePosition(position.getX(i), position.getY(i), noiseFreq, speed)
      position.setZ(i, z * zHeight)
    }
    shapeGeo.setAttribute('position', position)
    // position = shapeGeo.getAttribute('position') as THREE.BufferAttribute
    position.needsUpdate = true
    shapeGeo.computeVertexNormals()
    this.changeColour(VisualizerCanvas.shapeArr[0], VisualizerCanvas.shapeColour)

    if (SpotifyAnalysisUtils.barCounter >= 1) {
      const shapeMaterial = VisualizerCanvas.shapeArr[0].material as THREE.MeshLambertMaterialParameters
      shapeMaterial.wireframe = !shapeMaterial.wireframe
      shapeMaterial.flatShading = !shapeMaterial.wireframe
      // shapeMaterial.needsUpdate = true
      SpotifyAnalysisUtils.barCounter = 0
    }
  }

  private static calcPlanePosition (x: number, y: number, noiseFreq: number, speed: number) {
    return VisualizerCanvas.noise.noise3D(x / noiseFreq, y / noiseFreq, speed)
  }

  private doMode (key: number, SpotifyAnalysisUtils: any) {
    switch (key) {
      case 1:
        this.mode1(SpotifyAnalysisUtils)
        break
      case 2:
        this.mode2(SpotifyAnalysisUtils)
        break
      case 3:
        this.mode3(SpotifyAnalysisUtils)
        break
        /* case 4:
            mode4()
            break
          case 5:
            mode5()
            break
          case 6:
            mode6()
            break
          case 7:
            mode7()
            break
          case 8:
            mode8()
            break */
      default:
        // modeKey.key = 1
        this.mode1(SpotifyAnalysisUtils)
    }
  }

  rotateShape (shape: THREE.Mesh) {
    const spinf = VisualizerCanvas.liveAudio.frequencyData[VisualizerCanvas.freqKey]

    if (spinf > 150) {
      if (spinf > 200) {
        shape.rotation.x -= VisualizerCanvas.spinConstants[1]
        shape.rotation.y -= VisualizerCanvas.spinConstants[0]
        shape.rotation.z -= VisualizerCanvas.spinConstants[1]
      } else {
        shape.rotation.x -= VisualizerCanvas.spinConstants[2]
        shape.rotation.y -= VisualizerCanvas.spinConstants[1]
        shape.rotation.z -= VisualizerCanvas.spinConstants[2]
      }
    } else {
      if (spinf > 100) {
        shape.rotation.x -= VisualizerCanvas.spinConstants[3]
        shape.rotation.y += VisualizerCanvas.spinConstants[1]
        shape.rotation.z -= VisualizerCanvas.spinConstants[4]
      } else {
        shape.rotation.x -= VisualizerCanvas.spinConstants[4]
        shape.rotation.y += VisualizerCanvas.spinConstants[2]
        shape.rotation.z -= VisualizerCanvas.spinConstants[3]
      }
    }
  }

  private changeColour (currShape: THREE.Mesh, currColour: string) {
    if (currShape.material instanceof THREE.Material) {
      const colour = new THREE.Color(parseInt(currColour))
      const params: THREE.MeshLambertMaterialParameters = { color: colour }
      currShape.material.setValues(params)
    }
  }

  private setColour (key: number, SpotifyAnalysisUtils: any) {
    switch (key) {
      case 1:
        VisualizerCanvas.shapeColour = this.hslToHex(SpotifyAnalysisUtils.g_timbre[2], SpotifyAnalysisUtils.g_timbre[1], SpotifyAnalysisUtils.g_timbre[0])
        break
      case 2:
        VisualizerCanvas.shapeColour = this.hslToHex(SpotifyAnalysisUtils.g_timbre[1], SpotifyAnalysisUtils.g_timbre[2], SpotifyAnalysisUtils.g_timbre[0])
        break
      case 3:
        VisualizerCanvas.shapeColour = this.hslToHex(VisualizerCanvas.liveAudio.snareObject.snareEnergy, VisualizerCanvas.liveAudio.bassObject.bassAv, SpotifyAnalysisUtils.g_timbre[0])
        break
      case 4:
        VisualizerCanvas.shapeColour = this.rgbToHex(VisualizerCanvas.liveAudio.highsObject.highsEnergy, VisualizerCanvas.liveAudio.midsObject.midsEnergy, VisualizerCanvas.liveAudio.snareObject.snareEnergy)
        break
      case 5:
        VisualizerCanvas.shapeColour = this.hslToHex(VisualizerCanvas.liveAudio.bassObject.bassEnergy, VisualizerCanvas.liveAudio.bassObject.bassAv + VisualizerCanvas.liveAudio.highsObject.highsEnergy, VisualizerCanvas.liveAudio.midsObject.midsEnergy)
        break
      case 6:
        VisualizerCanvas.shapeColour = this.rgbToHex(VisualizerCanvas.liveAudio.snareObject.snareAv, VisualizerCanvas.liveAudio.avFreq / 2, VisualizerCanvas.liveAudio.avFreq / 2)
        break
      case 7:
        VisualizerCanvas.shapeColour = this.rgbToHex(VisualizerCanvas.liveAudio.rms, VisualizerCanvas.liveAudio.avFreq, VisualizerCanvas.liveAudio.peak)
        break
      case 8:
        VisualizerCanvas.shapeColour = this.rgbToHex(VisualizerCanvas.liveAudio.peak, VisualizerCanvas.liveAudio.avFreq, VisualizerCanvas.liveAudio.rms)
        break
      case 9:
        VisualizerCanvas.shapeColour = this.rgbToHex(VisualizerCanvas.liveAudio.avFreq * 2, VisualizerCanvas.liveAudio.avFreq / 10, VisualizerCanvas.liveAudio.avFreq * 3)
        break
      case 10:
        VisualizerCanvas.shapeColour = this.rgbToHex(VisualizerCanvas.liveAudio.frequencyData[13], VisualizerCanvas.liveAudio.frequencyData[9], VisualizerCanvas.liveAudio.frequencyData[5])
        break
      case 11:
        VisualizerCanvas.shapeColour = this.hslToHex(VisualizerCanvas.liveAudio.highsObject.highsEnergy * VisualizerCanvas.liveAudio.avFreq, VisualizerCanvas.liveAudio.bassObject.bassEnergy, VisualizerCanvas.liveAudio.midsObject.midsEnergy)
        break
      case 12:
        VisualizerCanvas.shapeColour = this.hslToHex(360 - (VisualizerCanvas.liveAudio.highsObject.highsEnergy * VisualizerCanvas.liveAudio.avFreq), VisualizerCanvas.liveAudio.bassObject.bassEnergy, VisualizerCanvas.liveAudio.midsObject.midsEnergy)
        break
      default:
        VisualizerCanvas.shapeColour = this.rgbToHex(VisualizerCanvas.liveAudio.frequencyData[4], VisualizerCanvas.liveAudio.frequencyData[8], VisualizerCanvas.liveAudio.frequencyData[12])
    }
  }

  private setShapePosition () {
    let a = 0
    let f = 1
    let x = 0
    let y = 0
    let z = 0
    const distance = 25
    let shapeCount = 0
    const lim = 12

    // layer 0
    VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
    x = x + distance

    VisualizerCanvas.layerMarker[0] = 1

    // layer 1-<lim
    for (f; f < lim; f++) {
      for (a = 1; a < 2 * f; a++) {
        VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
        y = y - distance
      }
      for (a = 0; a < 2 * f; a++) {
        VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
        x = x - distance
      }
      for (a = 0; a < 2 * f; a++) {
        VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
        y = y + distance
      }
      for (a = -1; a < 2 * f; a++) {
        VisualizerCanvas.shapeArr[shapeCount++].position.set(x, y, z)
        x = x + distance
      }

      VisualizerCanvas.layerMarker[f] = shapeCount
      console.log(shapeCount)
      z = z - distance
    }
    console.log(VisualizerCanvas.layerMarker)
  }

  private removeShape () {
    console.log('removing shapes')
    for (let i = 0; i < VisualizerCanvas.shapeArr.length; i++) {
      VisualizerCanvas.scene.remove(VisualizerCanvas.shapeArr[i])
      VisualizerCanvas.shapeArr[i].geometry.dispose()
      const material = VisualizerCanvas.shapeArr[i].material as THREE.Material
      material.dispose()
    }
    VisualizerCanvas.shapeArr = []
  }

  private addOcean () {
    VisualizerCanvas.shapeArr.push(new THREE.Mesh(new THREE.PlaneBufferGeometry(window.innerWidth, window.innerWidth, 256, 256), new THREE.MeshLambertMaterial()))
    console.log(VisualizerCanvas.shapeArr)
    VisualizerCanvas.shapeArr[0].rotation.set(-Math.PI / 4, 0, Math.PI / 2)
    VisualizerCanvas.shapeArr[0].position.set(0, 0, -250)
    VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[0])
    console.log('added ocean')
  }

  private addShape (shapeType: number) {
    if (shapeType === 0) {
      const cubeGeo = new THREE.BoxGeometry(10, 10, 10)
      for (let i = 0; i < VisualizerCanvas.shapeMax; i++) {
        VisualizerCanvas.shapeArr.push(new THREE.Mesh(cubeGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[i])
      }
      console.log('added new cube grid')
    } else if (shapeType === 1) {
      const octaGeo = new THREE.OctahedronGeometry(10, 0)
      for (let i = 0; i < VisualizerCanvas.shapeMax; i++) {
        VisualizerCanvas.shapeArr.push(new THREE.Mesh(octaGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[i])
      }
      console.log('added new octa grid')
    } else if (shapeType === 2) {
      const sphereGeo = new THREE.SphereGeometry(5, 32, 32)
      for (let i = 0; i < VisualizerCanvas.shapeMax; i++) {
        VisualizerCanvas.shapeArr.push(new THREE.Mesh(sphereGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[i])
      }
      console.log('added new sphere grid')
    } else if (shapeType === 3) {
      const tetraGeo = new THREE.TetrahedronGeometry(10, 0)
      for (let i = 0; i < VisualizerCanvas.shapeMax; i++) {
        VisualizerCanvas.shapeArr.push(new THREE.Mesh(tetraGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[i])
      }
      console.log('added new tetra grid')
    } else {
      const dodecaGeo = new THREE.DodecahedronGeometry(10, 0)
      for (let i = 0; i < VisualizerCanvas.shapeMax; i++) {
        VisualizerCanvas.shapeArr.push(new THREE.Mesh(dodecaGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        VisualizerCanvas.scene.add(VisualizerCanvas.shapeArr[i])
      }
      console.log('added new dodeca grid')
    }
  }

  private addLighting () {
    const l1 = new THREE.PointLight(0xffffff)
    const spotLight = new THREE.SpotLight(0xffffff)
    l1.position.set(300, 200, 0)
    VisualizerCanvas.scene.add(l1)

    spotLight.position.set(0, 0, 90)
    spotLight.castShadow = true

    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024

    spotLight.shadow.camera.near = 500
    spotLight.shadow.camera.far = 4000
    spotLight.shadow.camera.fov = 30
    VisualizerCanvas.scene.add(spotLight)
  }

  private rgbToHexHelper (num: number) {
    const hex = Math.ceil(num).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  private rgbToHex (r: number, g: number, b: number) {
    return ('0x' + this.rgbToHexHelper(r) + this.rgbToHexHelper(g) + this.rgbToHexHelper(b))
  }

  private hslToHex (h: number, s: number, l: number) {
    h /= 360
    s /= 255
    l /= 255
    let r, g, b
    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `0x${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  private canvasResizeListener (el: Element) {
    el.addEventListener('onresize', re => {
      const width = el.clientWidth
      const height = el.clientHeight

      VisualizerCanvas.renderer.setSize(width, height)
      VisualizerCanvas.camera.aspect = width / height
      VisualizerCanvas.camera.updateProjectionMatrix()
    })
  }

  @Watch('ModeKey')
  onModeKeyChanged (value: number, oldValue: number) {
    console.log(`changing mode key to ${value} from ${oldValue}`)
    if (value) {
      this.changingMode = true
      this.removeShape()
      console.log(this.changingMode)

      if (value < 3) {
        this.addShape(Math.floor(Math.random() * 5))
        this.setShapePosition()
        this.rotateToggle = true
      } else {
        this.addOcean()
        VisualizerCanvas.noise = new SimplexNoise()
        this.rotateToggle = false
      }
      this.changingMode = false
      console.log(this.changingMode)
    }
  }
}
</script>

<style scoped>
  .sceneContainer {
    position: absolute;
    top: 0;
    height: 100vh;
    width: 100vw;
  }

  .scene {
    width: 100%;
    height: 100%;
  }

  canvas {
    width: 100%;
    height: 100%;
  }
</style>

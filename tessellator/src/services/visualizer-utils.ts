import * as THREE from 'three'
import LiveAudio from '@/services/liveAudio-utils'
import { SpotifyAnalysis } from '@/services/spotify-utils'

export default class VisualizerUtils {
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  public scene: THREE.Scene = new THREE.Scene();
  public shapeMax: number;
  public shapeArr: THREE.Mesh[];
  public layerMarker: number[];
  private liveAudio: LiveAudio;
  private colourKey: number;
  private shapeColour: string;
  private freqKey: number;
  private currentTrackFeatures: SpotifyApi.AudioFeaturesResponse | undefined
  private currentTrackAnalysis: SpotifyApi.AudioAnalysisResponse | undefined

  constructor () {
    this.liveAudio = new LiveAudio()
    this.camera = new THREE.PerspectiveCamera()
    this.renderer = new THREE.WebGLRenderer()
    this.scene = new THREE.Scene()
    this.shapeMax = 529
    this.shapeArr = []
    this.layerMarker = []
    this.colourKey = 1
    this.shapeColour = '#FFF'
    this.freqKey = 4
  }

  setTrackFeaturesAnalysis () {
    this.currentTrackFeatures = SpotifyAnalysis.prototype.trackFeatures
    this.currentTrackAnalysis = SpotifyAnalysis.prototype.trackAnalysis
  }

  setupCanvas (el: Element) {
    this.renderer.setSize(el.clientWidth, el.clientHeight)
    el.appendChild(this.renderer.domElement)

    this.canvasResizeListener(el)

    this.addLighting()
    this.addShape(1)
    this.setShapePosition()
    this.camera.position.z = 90

    this.setColourKey(Math.floor(Math.random() * 13))
    this.changeFreqMode()

    console.log(`colourKey: ${this.colourKey}`)

    const animate = () => {
      // Audio
      this.liveAudio.getData()
      requestAnimationFrame(animate)

      // Colour
      this.setColour(this.colourKey)

      console.log(SpotifyAnalysis.prototype.trackFeatures)
      console.log(SpotifyAnalysis.prototype.trackAnalysis)

      for (let i = 0; i < this.shapeMax; i++) {
        this.changeColour(this.shapeArr[i], this.shapeColour)
      }

      this.renderer.render(this.scene, this.camera)
    }

    animate()
  }

  changeColour (currShape: THREE.Mesh, currColour: string) {
    if (currShape.material instanceof THREE.Material) {
      const colour = new THREE.Color(parseInt(currColour))
      const params: THREE.MeshLambertMaterialParameters = { color: colour }
      currShape.material.setValues(params)
    }
  }

  private addShape (shapeType: number) {
    if (shapeType === 1) {
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshLambertMaterial({ color: 0x000000 })))
        this.scene.add(this.shapeArr[i])
        console.log('added new cube')
      }
    } else if (shapeType === 2) {
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(new THREE.OctahedronGeometry(10, 0), new THREE.MeshLambertMaterial({ color: 0x000000 })))
        this.scene.add(this.shapeArr[i])
        console.log('added new octa')
      }
    } else if (shapeType === 3) {
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshLambertMaterial({ color: 0x000000 })))
        this.scene.add(this.shapeArr[i])
        console.log('added new sphere')
      }
    } else if (shapeType === 4) {
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(new THREE.TetrahedronGeometry(10, 0), new THREE.MeshLambertMaterial({ color: 0x000000 })))
        this.scene.add(this.shapeArr[i])
        console.log('added new tetra')
      }
    } else {
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(new THREE.DodecahedronGeometry(10, 0), new THREE.MeshLambertMaterial({ color: 0x000000 })))
        this.scene.add(this.shapeArr[i])
        console.log('added new dodeca')
      }
    }
  }

  private addLighting () {
    const l1 = new THREE.PointLight(0xffffff)
    const spotLight = new THREE.SpotLight(0xffffff)
    l1.position.set(300, 200, 0)
    this.scene.add(l1)

    spotLight.position.set(0, 0, 90)
    spotLight.castShadow = true

    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024

    spotLight.shadow.camera.near = 500
    spotLight.shadow.camera.far = 4000
    spotLight.shadow.camera.fov = 30
    this.scene.add(spotLight)
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
    this.shapeArr[shapeCount++].position.set(x, y, z)
    x = x + distance

    this.layerMarker[0] = 1

    // layer 1-<lim
    for (f; f < lim; f++) {
      for (a = 1; a < 2 * f; a++) {
        this.shapeArr[shapeCount++].position.set(x, y, z)
        y = y - distance
      }
      for (a = 0; a < 2 * f; a++) {
        this.shapeArr[shapeCount++].position.set(x, y, z)
        x = x - distance
      }
      for (a = 0; a < 2 * f; a++) {
        this.shapeArr[shapeCount++].position.set(x, y, z)
        y = y + distance
      }
      for (a = -1; a < 2 * f; a++) {
        this.shapeArr[shapeCount++].position.set(x, y, z)
        x = x + distance
      }

      this.layerMarker[f] = shapeCount
      console.log(shapeCount)
      z = z - distance
    }
    console.log(this.layerMarker)
  }

  private canvasResizeListener (el: Element) {
    el.addEventListener('resize', re => {
      const width = el.clientWidth
      const height = el.clientHeight

      this.renderer.setSize(width, height)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    })
  }

  private setColour (key: number) {
    switch (key) {
      /* case 1:
        this.shapeColour = this.hslToHex(g_timbre[2], g_timbre[1], g_timbre[0])
        break
      case 2:
        this.shapeColour = this.hslToHex(g_timbre[1], g_timbre[2], g_timbre[0])
        break
      case 3:
        this.shapeColour = this.hslToHex(this.liveAudio.snareObject.snareEnergy, this.liveAudio.bassObject.bassAv, g_timbre[0])
        break */
      case 4:
        this.shapeColour = this.rgbToHex(this.liveAudio.highsObject.highsEnergy, this.liveAudio.midsObject.midsEnergy, this.liveAudio.snareObject.snareEnergy)
        break
      case 5:
        this.shapeColour = this.hslToHex(this.liveAudio.bassObject.bassEnergy, this.liveAudio.bassObject.bassAv + this.liveAudio.highsObject.highsEnergy, this.liveAudio.midsObject.midsEnergy)
        break
      case 6:
        this.shapeColour = this.rgbToHex(this.liveAudio.snareObject.snareAv, this.liveAudio.avFreq / 2, this.liveAudio.avFreq / 2)
        break
      case 7:
        this.shapeColour = this.rgbToHex(this.liveAudio.rms, this.liveAudio.avFreq, this.liveAudio.peak)
        break
      case 8:
        this.shapeColour = this.rgbToHex(this.liveAudio.peak, this.liveAudio.avFreq, this.liveAudio.rms)
        break
      case 9:
        this.shapeColour = this.rgbToHex(this.liveAudio.avFreq * 2, this.liveAudio.avFreq / 10, this.liveAudio.avFreq * 3)
        break
      case 10:
        this.shapeColour = this.rgbToHex(this.liveAudio.frequencyData[13], this.liveAudio.frequencyData[9], this.liveAudio.frequencyData[5])
        break
      case 11:
        this.shapeColour = this.hslToHex(this.liveAudio.highsObject.highsEnergy * this.liveAudio.avFreq, this.liveAudio.bassObject.bassEnergy, this.liveAudio.midsObject.midsEnergy)
        break
      case 12:
        this.shapeColour = this.hslToHex(360 - (this.liveAudio.highsObject.highsEnergy * this.liveAudio.avFreq), this.liveAudio.bassObject.bassEnergy, this.liveAudio.midsObject.midsEnergy)
        break
      default:
        this.shapeColour = this.rgbToHex(this.liveAudio.frequencyData[4], this.liveAudio.frequencyData[8], this.liveAudio.frequencyData[12])
    }
  }

  private setColourKey (key: number) {
    this.colourKey = key
  }

  private changeFreqMode () {
    // if(g_tatum % 53 == 0) {
    this.freqKey = Math.floor(Math.random() * (11 - 2)) + 2
    // console.log("freq mode: " + freqKey);
    // }
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
}

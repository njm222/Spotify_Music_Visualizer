import * as THREE from 'three'
import LiveAudio from '@/services/liveAudio-utils'

export default class VisualizerUtils {
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  public scene: THREE.Scene = new THREE.Scene();
  public shapeMax: number;
  public shapeArr: THREE.Mesh[];
  public layerMarker: number[];
  private liveAudio: LiveAudio;
  private colourKey: number;
  private modeKey: any;
  private shapeColour: string;
  private freqKey: number;
  private spinConstants: number[];
  private currentTrackFeatures: SpotifyApi.AudioFeaturesResponse | undefined
  private currentTrackAnalysis: SpotifyApi.AudioAnalysisResponse | undefined
  private updatedTrackData: boolean[];
  private changingMode!: boolean;

  constructor () {
    this.liveAudio = new LiveAudio()
    this.camera = new THREE.PerspectiveCamera()
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.scene = new THREE.Scene()
    this.shapeMax = 529
    this.shapeArr = []
    this.layerMarker = []
    this.colourKey = 1
    this.modeKey = {
      keyInternal: 1,
      set key (val) {
        this.keyInternal = val
        this.keyListener(val)
      },
      get key () {
        return this.keyInternal
      },
      registerListener: function (listener: any) {
        this.keyListener = listener
      }
    }
    this.modeKey.registerListener((val: number) => {
      console.log('modeKey changed to ' + val)
      this.changingMode = true
      console.log(this.changingMode)
      if (this.modeKey.key < 3) {
        this.removeShape()
        this.addShape(Math.floor(Math.random() * 5))
        this.setShapePosition()
      } else {
        this.removeShape()
        this.addShape(Math.floor(Math.random() * 5))
        this.setShapePosition()
      }
      this.changingMode = false
      console.log(this.changingMode)
    })
    this.changingMode = false
    this.shapeColour = '#FFF'
    this.freqKey = 4
    this.spinConstants = [0.03, 0.015, 0.075, 0.0025, 0.001]
    this.updatedTrackData = [false, false]
  }

  private removeShape () {
    console.log('removing shapes')
    for (let i = 0; i < this.shapeArr.length; i++) {
      this.scene.remove(this.shapeArr[i])
      this.shapeArr[i].geometry.dispose()
      const material = this.shapeArr[i].material as THREE.Material
      material.dispose()
    }
    this.shapeArr = []
  }

  setUpdatedTrackFeaturesFalse (bool: boolean) {
    this.updatedTrackData[0] = bool
  }

  setUpdatedTrackFeatures (bool: boolean, value: SpotifyApi.AudioFeaturesResponse) {
    this.updatedTrackData[0] = bool
    this.currentTrackFeatures = value
  }

  setUpdatedTrackAnalysisFalse (bool: boolean) {
    this.updatedTrackData[1] = bool
  }

  setUpdatedTrackAnalysis (bool: boolean, value: SpotifyApi.AudioAnalysisResponse) {
    this.updatedTrackData[1] = bool
    this.currentTrackAnalysis = value
  }

  setupCanvas (el: Element, SpotifyAnalysisUtils: any) {
    this.camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000)
    this.renderer.setSize(el.clientWidth, el.clientHeight)
    this.camera.aspect = el.clientWidth / el.clientHeight
    el.appendChild(this.renderer.domElement)

    this.canvasResizeListener(el)

    this.addLighting()
    this.addShape(1)
    this.setShapePosition()
    this.camera.position.z = 90

    this.setColourKey(5)

    const animate = () => {
      requestAnimationFrame(animate)
      if (this.updatedTrackData[0] && this.updatedTrackData[1]) {
        // Live Audio
        this.liveAudio.getData()

        if (!this.changingMode) {
          // Colour
          this.setColour(this.colourKey, SpotifyAnalysisUtils)

          // Rotate Shape
          for (let i = 0; i < this.shapeMax; i++) {
            this.rotateShape(this.shapeArr[i])
          }

          // Mode
          this.doMode(this.modeKey.key, SpotifyAnalysisUtils)
        }

        this.renderer.render(this.scene, this.camera)
      } else {
        console.log('pausing visualizer')
      }
    }
    animate()
  }

  doMode (key: number, SpotifyAnalysisUtils: any) {
    switch (key) {
      case 1:
        this.mode1(SpotifyAnalysisUtils)
        break
      case 2:
        this.mode2(SpotifyAnalysisUtils)
        break
      /* case 3:
          mode3()
          break
        case 4:
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

  private mode1 (SpotifyAnalysisUtils: any) {
    if (SpotifyAnalysisUtils.barCounter > 3) {
      for (let i = this.layerMarker[SpotifyAnalysisUtils.beatCounter - 4]; i < this.layerMarker[SpotifyAnalysisUtils.beatCounter - 3]; i++) {
        this.changeColour(this.shapeArr[i], '0x0000')
      }
      for (let i = this.layerMarker[SpotifyAnalysisUtils.beatCounter - 2]; i < this.layerMarker[SpotifyAnalysisUtils.beatCounter]; i++) {
        this.changeColour(this.shapeArr[i], this.shapeColour)
      }
    } else {
      if (SpotifyAnalysisUtils.beatCounter !== 0) {
        for (let i = this.layerMarker[SpotifyAnalysisUtils.beatCounter - 1]; i < this.layerMarker[SpotifyAnalysisUtils.beatCounter]; i++) {
          this.changeColour(this.shapeArr[i], this.shapeColour)
        }
      }
      this.changeColour(this.shapeArr[0], this.shapeColour)
    }

    if (SpotifyAnalysisUtils.beatCounter > this.layerMarker.length - 1) {
      SpotifyAnalysisUtils.beatCounter = 0
    }
  }

  private mode2 (SpotifyAnalysisUtils: any) {
    if (SpotifyAnalysisUtils.beatCounter > 3) {
      for (let i = this.layerMarker[SpotifyAnalysisUtils.beatCounter - 4]; i < this.layerMarker[SpotifyAnalysisUtils.beatCounter - 3]; i = i + 2) {
        this.changeColour(this.shapeArr[i], '0x0000')
      }
      for (let i = this.layerMarker[SpotifyAnalysisUtils.beatCounter - 2]; i < this.layerMarker[SpotifyAnalysisUtils.beatCounter]; i = i + 2) {
        this.changeColour(this.shapeArr[i], this.shapeColour)
      }
    } else {
      if (SpotifyAnalysisUtils.beatCounter !== 0) {
        for (let i = this.layerMarker[SpotifyAnalysisUtils.beatCounter - 1]; i < this.layerMarker[SpotifyAnalysisUtils.beatCounter]; i = i + 2) {
          this.changeColour(this.shapeArr[i], this.shapeColour)
        }
      } else {
        this.changeColour(this.shapeArr[0], this.shapeColour)
      }
    }

    if (SpotifyAnalysisUtils.beatCounter > this.layerMarker.length - 1) {
      SpotifyAnalysisUtils.beatCounter = 0
    }
  }

  private mode3 (SpotifyAnalysisUtils: any) {
    // a
  }

  changeColour (currShape: THREE.Mesh, currColour: string) {
    if (currShape.material instanceof THREE.Material) {
      const colour = new THREE.Color(parseInt(currColour))
      const params: THREE.MeshLambertMaterialParameters = { color: colour }
      currShape.material.setValues(params)
    }
  }

  rotateShape (shape: THREE.Mesh) {
    const spinf = this.liveAudio.frequencyData[this.freqKey]

    if (spinf > 150) {
      if (spinf > 200) {
        shape.rotation.x -= this.spinConstants[1]
        shape.rotation.y -= this.spinConstants[0]
        shape.rotation.z -= this.spinConstants[1]
      } else {
        shape.rotation.x -= this.spinConstants[2]
        shape.rotation.y -= this.spinConstants[1]
        shape.rotation.z -= this.spinConstants[2]
      }
    } else {
      if (spinf > 100) {
        shape.rotation.x -= this.spinConstants[3]
        shape.rotation.y += this.spinConstants[1]
        shape.rotation.z -= this.spinConstants[4]
      } else {
        shape.rotation.x -= this.spinConstants[4]
        shape.rotation.y += this.spinConstants[2]
        shape.rotation.z -= this.spinConstants[3]
      }
    }
  }

  private setColour (key: number, SpotifyAnalysisUtils: any) {
    switch (key) {
      case 1:
        this.shapeColour = this.hslToHex(SpotifyAnalysisUtils.g_timbre[2], SpotifyAnalysisUtils.g_timbre[1], SpotifyAnalysisUtils.g_timbre[0])
        break
      case 2:
        this.shapeColour = this.hslToHex(SpotifyAnalysisUtils.g_timbre[1], SpotifyAnalysisUtils.g_timbre[2], SpotifyAnalysisUtils.g_timbre[0])
        break
      case 3:
        this.shapeColour = this.hslToHex(this.liveAudio.snareObject.snareEnergy, this.liveAudio.bassObject.bassAv, SpotifyAnalysisUtils.g_timbre[0])
        break
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

  private addShape (shapeType: number) {
    if (shapeType === 0) {
      const cubeGeo = new THREE.BoxGeometry(10, 10, 10)
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(cubeGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        this.scene.add(this.shapeArr[i])
        console.log('added new cube')
      }
    } else if (shapeType === 1) {
      const octaGeo = new THREE.OctahedronGeometry(10, 0)
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(octaGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        this.scene.add(this.shapeArr[i])
        console.log('added new octa')
      }
    } else if (shapeType === 2) {
      const sphereGeo = new THREE.SphereGeometry(5, 32, 32)
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(sphereGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        this.scene.add(this.shapeArr[i])
        console.log('added new sphere')
      }
    } else if (shapeType === 3) {
      const tetraGeo = new THREE.TetrahedronGeometry(10, 0)
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(tetraGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
        this.scene.add(this.shapeArr[i])
        console.log('added new tetra')
      }
    } else {
      const dodecaGeo = new THREE.DodecahedronGeometry(10, 0)
      for (let i = 0; i < this.shapeMax; i++) {
        this.shapeArr.push(new THREE.Mesh(dodecaGeo, new THREE.MeshLambertMaterial({ color: 0x000000 })))
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

  private canvasResizeListener (el: Element) {
    el.addEventListener('resize', re => {
      const width = el.clientWidth
      const height = el.clientHeight

      this.renderer.setSize(width, height)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    })
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

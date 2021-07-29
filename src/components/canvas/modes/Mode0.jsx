import React, { useRef, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import simplex from 'simplex-noise'
import * as THREE from 'three'
import getColour from '@/helpers/getColour'
import useStore from '@/utils/store'

let simplexNoise = new simplex(Math.round(Math.random() * 1000))

const Terrain = () => {
  // Get reference of the terrain
  const terrainGeometryRef = useRef()
  const terrainMaterialRef = useRef()
  const sectionChangeRef = useRef()

  // Set the grid size and resolution
  const size = [10, 10]
  const res = [256, 256]

  const { tempo } = useStore((state) => state.spotifyAnalyzer?.section)

  useFrame((state, delta) => {
    // Set the variables for simplex
    const nAmplitude = Math.max(
      useStore.getState().audioAnalyzer?.avFreq / 150,
      0.1
    )
    const nScale =
      3 -
      useStore.getState().spotifyFeatures?.energy -
      useStore.getState().spotifyFeatures?.danceability

    // Get a reference of the terrain grid's geometry
    const terrainGeometry = terrainGeometryRef.current

    // Wait for Spotify to load
    if (!nScale || !nAmplitude || !terrainGeometry) {
      return
    }

    // Get the terrain vertices
    const { position } = terrainGeometry.attributes

    // Get the current time
    const time = state.clock.getElapsedTime() * (tempo / 500)

    // For each vertex set the position on the z-axis based on the noise function
    for (let i = 0; i < position.count; i++) {
      const z = simplexNoise.noise3D(
        position.getX(i) /
          (nScale - useStore.getState().audioAnalyzer?.bassObject.energy / 300),
        position.getY(i) /
          (nScale -
            useStore.getState().audioAnalyzer?.snareObject.energy / 300),
        time
      )
      position.setZ(i, z * nAmplitude)
    }

    // Update the vertices
    position.needsUpdate = true
    terrainGeometry.computeVertexNormals()
    terrainGeometry.normalsNeedUpdate = true

    // Update the material colour
    terrainMaterialRef.current.color.lerp(
      new THREE.Color(getColour()),
      delta * 2
    )

    // Update simplex seed on every section change
    if (sectionChangeRef.current !== tempo) {
      simplexNoise = new simplex(Math.round(Math.random() * 1000))
      sectionChangeRef.current = tempo
    }

    // Switch wireframe on every bar change
    terrainMaterialRef.current.wireframe =
      useStore.getState().spotifyAnalyzer?.barCounter % 2 === 0
  })

  return (
    <mesh receiveShadow rotation={[-Math.PI / 4, 0, 0]}>
      <planeBufferGeometry
        attach='geometry'
        args={[...size, ...res]}
        ref={terrainGeometryRef}
      />
      <meshPhongMaterial attach='material' ref={terrainMaterialRef} />
    </mesh>
  )
}

const Mode0 = () => {
  console.log('mode0')
  return (
    <>
      <Terrain />
    </>
  )
}

export default memo(Mode0)

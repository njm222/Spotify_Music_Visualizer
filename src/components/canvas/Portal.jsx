import * as THREE from 'three'
import { memo, useState, useRef } from 'react'
import { useFrame, createPortal } from '@react-three/fiber'
import { useFBO, PerspectiveCamera } from '@react-three/drei'
import useStore from '@/helpers/store'
import Bloom from './Bloom'
import Main from './Main'

function Portal({ children, ...props }) {
  console.log('portal')
  const set = useStore((state) => state.set)
  const isVisualizer = useStore((state) => state.isVisualizer)

  const mesh = useRef()
  const cam = useRef()
  // useFBO creates a WebGL2 buffer for us, it's a helper from the "drei" library
  const fbo = useFBO()
  const portalCamRef = useRef(false)
  // The is a separate scene that we create, React will portal into that
  const [scene] = useState(() => new THREE.Scene())
  // Tie this component into the render-loop
  useFrame((state, delta) => {
    // !Visualizer state
    if (!isVisualizer) {
      if (state.camera.position.distanceTo(mesh.current.position) > 5) {
        // reset camera if moved / rotated
        state.camera.position.lerp(new THREE.Vector3(0, 0, 10), delta * 2)
      }
      // if camera is close lerp closer
      if (
        !portalCamRef.current &&
        state.camera.position.distanceTo(mesh.current.position) < 5
      ) {
        console.log('lerping from dashboardScene to portal')
        // rotate camera center
        state.camera.quaternion.slerp(
          new THREE.Quaternion(-Math.PI * 2, 0, 0, 1),
          delta * 10
        )
        // position camera center
        state.camera.position.lerp(new THREE.Vector3(0, 0, 2), delta * 20)
        state.camera.updateProjectionMatrix()
        state.camera.updateMatrixWorld()
        if (cam.current.zoom > 0.3) {
          cam.current.zoom -= 0.01
        }
        cam.current.lookAt(mesh.current.position)
        cam.current.updateProjectionMatrix()
        cam.current.updateMatrixWorld()
      }
      // if camera is very close switch cams
      if (
        !portalCamRef.current &&
        state.camera.position.distanceTo(mesh.current.position) <= 2.1
      ) {
        set({ isVisualizer: true })
        portalCamRef.current = true
        console.log('switching into portal cam')
        return
      }

      // Our portal has its own camera, but we copy the originals world matrix
      cam.current?.matrixWorldInverse.copy(state.camera.matrixWorldInverse)
      // Then we set the render-target to the buffer that we have created
      state.gl.setRenderTarget(fbo)
      // We render the scene into it, using the local camera that is clamped to the planes aspect ratio
      state.gl.render(scene, cam.current)
      // And flip the render-target to the default again
      state.gl.setRenderTarget(null)
      return
    }

    // Visualizer state
    if (portalCamRef.current) {
      // reset camera if moved / rotated
      state.camera.position.lerp(new THREE.Vector3(0, 0, 3), delta * 2)
      // if cam is far lerp further
      if (state.camera.position.z > 5) {
        console.log('lerping from portal to dashboardScene')
        // rotate camera center
        state.camera.quaternion.slerp(
          new THREE.Quaternion(-Math.PI * 2, 0, 0, 1),
          delta * 5
        )
        // position camera center
        state.camera.position.lerp(new THREE.Vector3(0, 0, 10), delta * 10)
        state.camera.updateProjectionMatrix()
        state.camera.updateMatrixWorld()
      }
      // if cam is very far switch cams
      if (state.camera.position.z > 8) {
        portalCamRef.current = false
        set({ isVisualizer: false })
        console.log('switch out of portal cam')
      }
    }
  })

  return isVisualizer ? (
    children
  ) : (
    <>
      <Main>
        <mesh ref={mesh}>
          <planeGeometry args={[2.5, 5]} />
          {/* The "mirror" is just a boring plane, but it receives the buffer texture */}
          <meshBasicMaterial map={fbo.texture} />
        </mesh>
      </Main>
      <Bloom>
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[2.6, 5.1]} attach='geometry' />
          <meshBasicMaterial color='red' />
        </mesh>
        <ambientLight />
      </Bloom>
      <PerspectiveCamera
        manual
        ref={cam}
        fov={50}
        aspect={2.5 / 5}
        onUpdate={(c) => c.updateProjectionMatrix()}
      />
      {/* This is React being awesome, we portal this components children into the separate scene above */}
      {createPortal(children, scene)}
    </>
  )
}

export default memo(Portal)

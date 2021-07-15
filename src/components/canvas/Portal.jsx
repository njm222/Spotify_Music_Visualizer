import * as THREE from 'three'
import { memo, useState, useRef } from 'react'
import { useFrame, createPortal } from '@react-three/fiber'
import { useFBO, PerspectiveCamera } from '@react-three/drei'
import useStore from '@/helpers/store'

function Portal({ children, ...props }) {
  console.log('portal')
  const set = useStore((state) => state.set)
  const isVisualizer = useStore((state) => state.isVisualizer)

  const time = useRef(0)
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
        state.camera.position.lerp(new THREE.Vector3(0, 0, 10), delta)
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
          delta
        )
        // position camera center
        state.camera.position.lerp(new THREE.Vector3(0, 0, 2), delta)
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
        console.log('switching into portal cam')
        portalCamRef.current = true
      }
      // bounce if cam has been switched
      if (portalCamRef.current) {
        if (time.current < 50) {
          state.camera.fov =
            50 +
            10 *
              Math.sin((8 * Math.PI * time.current) / 100) *
              (1 - time.current / 100)
          state.camera.updateProjectionMatrix()
          state.camera.updateMatrixWorld()
        } else if (time.current < 51) {
          // switch into portal
          console.log('cams have been switched')
          set({ isVisualizer: true })
          return
        }
        time.current += 1
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
      state.camera.position.lerp(new THREE.Vector3(0, 0, 3), delta)
      // if cam is far lerp further
      if (state.camera.position.z > 5) {
        console.log('lerping from portal to dashboardScene')
        // rotate camera center
        state.camera.quaternion.slerp(
          new THREE.Quaternion(-Math.PI * 2, 0, 0, 1),
          delta
        )
        // position camera center
        state.camera.position.lerp(new THREE.Vector3(0, 0, 10), delta * 2)
        state.camera.updateProjectionMatrix()
        state.camera.updateMatrixWorld()

        time.current = 0
      }
      // if cam is very far switch cams
      if (state.camera.position.z > 8) {
        set({ isVisualizer: false })
        portalCamRef.current = false
        console.log('switch out of portal cam')
      }
      // bounce if cam has been switched
    }
  })

  return isVisualizer ? (
    children
  ) : (
    <>
      <mesh ref={mesh} {...props}>
        <planeGeometry args={[2.5, 5]} />
        {/* The "mirror" is just a boring plane, but it receives the buffer texture */}
        <meshBasicMaterial map={fbo.texture} />
      </mesh>
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

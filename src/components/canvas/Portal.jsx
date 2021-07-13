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
  const [portalCam, setPortalCam] = useState(false)
  // The is a separate scene that we create, React will portal into that
  const [scene] = useState(() => new THREE.Scene())
  // Tie this component into the render-loop
  useFrame((state, delta) => {
    if (isVisualizer) {
      state.camera.position.lerp(new THREE.Vector3(0, 0, 3), delta)
      return
    }

    if (
      !portalCam &&
      state.camera.position.distanceTo(mesh.current.position) <= 2.1
    ) {
      console.log('switching cams')
      setPortalCam(true)
    }

    if (state.camera.position.distanceTo(mesh.current.position) < 5) {
      console.log('lerping between cams')
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

    if (portalCam && !isVisualizer) {
      time.current += 1
      if (time.current < 50) {
        state.camera.fov =
          50 +
          10 *
            Math.sin((8 * Math.PI * time.current) / 100) *
            (1 - time.current / 100)
        state.camera.updateProjectionMatrix()
        state.camera.updateMatrixWorld()
      } else if (time.current < 51) {
        // switch out of portal
        console.log('cams have been switched')
        set({ isVisualizer: true })
        return
      }
    }
    // Our portal has its own camera, but we copy the originals world matrix
    cam.current?.matrixWorldInverse.copy(state.camera.matrixWorldInverse)
    // Then we set the render-target to the buffer that we have created
    state.gl.setRenderTarget(fbo)
    // We render the scene into it, using the local camera that is clamped to the planes aspect ratio
    state.gl.render(scene, cam.current)
    // And flip the render-target to the default again
    state.gl.setRenderTarget(null)
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

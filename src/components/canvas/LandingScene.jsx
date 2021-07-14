import { useState, useEffect, memo, Suspense } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '@/helpers/store'
import Text from './Text'
import { login } from '../../backendClient'

const LandingScene = () => {
  const camera = useThree((state) => state.camera)
  const [refreshToken, router] = useStore((state) => [
    state.refreshToken,
    state.router,
  ])
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    camera.position.z = 40
  }, [])

  useFrame((state, delta) => {
    if (clicked) {
      camera.position.lerp(new THREE.Vector3(0, 0, -40), delta) // TODO: lerp camera position
    }
  })

  const handleClick = async () => {
    setClicked(true)
    // check for refreshToken
    if (refreshToken) {
      router.push('/dashboard')
      return
    }
    // if no token present login normally
    setTimeout(async () => {
      const { uri } = await login()
      window.location = uri
    }, 500)
  }

  const setPointer = (value) => {
    document.documentElement.style.cursor = value ? 'pointer' : 'unset'
  }

  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.8} />
      <directionalLight castShadow position={[2.5, 12, 12]} intensity={4} />
      <pointLight position={[20, 20, 20]} />
      <pointLight position={[-20, -20, -20]} intensity={5} />
      <Stars
        radius={10}
        depth={50}
        count={1000}
        factor={4}
        saturation={0}
        fade
      />
      <Text
        onPointerDown={() => handleClick()}
        onPointerEnter={() => setPointer(true)}
        onPointerLeave={() => setPointer(false)}
      >
        tessellator
      </Text>
    </Suspense>
  )
}

export default memo(LandingScene)

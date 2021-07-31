import { Suspense, memo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useToggle } from '@/components/useToggle'
import Portal from './Portal'
import Visualizer from './Visualizer'
import Bridge from '../models/Bridge'
import Main from './effects/Main'

const SceneLighting = () => {
  return (
    <>
      <directionalLight castShadow position={[2.5, 12, 12]} intensity={0.5} />
      <pointLight castShadow position={[20, 20, 20]} intensity={1} />
      <pointLight castShadow position={[-20, -20, -20]} intensity={1} />
    </>
  )
}

const OuterScene = () => {
  return (
    <>
      <Stars radius={10} depth={50} count={5000} factor={2} fade />
      <Bridge position={[0, -2.5, 5]} rotation={[0, Math.PI / 2, 0]} />
      <SceneLighting />
    </>
  )
}

const DashboardScene = () => {
  console.log('dashboardScene')
  const camera = useThree((state) => state.camera)
  const ToggledOuterScene = useToggle(OuterScene, '!isVisualizer')

  useEffect(() => {
    camera.position.z = 10
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <Main>
          <Portal>
            <Visualizer />
          </Portal>
          <ToggledOuterScene />
        </Main>
      </Suspense>
    </>
  )
}

export default memo(DashboardScene)

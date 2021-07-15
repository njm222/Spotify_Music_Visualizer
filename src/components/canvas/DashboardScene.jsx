import { Suspense, memo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import useStore from '@/helpers/store'
import Portal from './Portal'
import Visualizer from './Visualizer'
import Bridge from '../models/Bridge'

const SceneLighting = () => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight castShadow position={[2.5, 12, 12]} intensity={4} />
      <pointLight position={[20, 20, 20]} />
      <pointLight position={[-20, -20, -20]} intensity={5} />
    </>
  )
}
const DashboardScene = () => {
  console.log('dashboardScene')
  const [ready, isVisualizer] = useStore((state) => [
    state.ready,
    state.isVisualizer,
  ])
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    camera.position.z = 10
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        {ready && (
          <>
            <Portal>
              <Visualizer />
            </Portal>
            {!isVisualizer && (
              <>
                <Bridge />
                <SceneLighting />
              </>
            )}
          </>
        )}
      </Suspense>
    </>
  )
}

export default memo(DashboardScene)

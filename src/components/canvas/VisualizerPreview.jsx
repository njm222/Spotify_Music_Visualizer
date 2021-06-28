import { Suspense, memo } from 'react'
import { OrbitControls } from '@react-three/drei'
import useStore from '@/helpers/store'
import Portal from './Portal'
import Visualizer from './Visualizer'

const VisualizerPreview = () => {
  console.log('visualizerPreview')
  const ready = useStore((state) => state.ready)
  return (
    <>
      <OrbitControls />
      <Suspense fallback={null}>
        {ready && (
          <>
            <Portal>
              <Visualizer />
            </Portal>
            <mesh position={[-1, -1, 2]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={'green'} />
            </mesh>
          </>
        )}
      </Suspense>
    </>
  )
}

export default memo(VisualizerPreview)

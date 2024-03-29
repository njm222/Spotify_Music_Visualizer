import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload, Loader } from '@react-three/drei'
import { A11yUserPreferences } from '@react-three/a11y'
import { useStore } from '@/utils/store'
import { useEffect, useRef, Suspense } from 'react'

const LControl = () => {
  const dom = useStore((state) => state.dom)
  const control = useRef(null)

  useEffect(() => {
    if (control) {
      dom.current.style['touch-action'] = 'none'
    }
  }, [dom, control])
  return <OrbitControls ref={control} domElement={dom.current} />
}

const LCanvas = ({ children }) => {
  const dom = useStore((state) => state.dom)

  return (
    <Canvas
      mode='concurrent'
      style={{
        position: 'absolute',
        top: 0,
        background: '#131313',
      }}
      onCreated={(state) => state.events.connect(dom.current)}
    >
      <Suspense fallback={Loader}>
        {location.pathname === '/' ? null : <LControl />}
        <A11yUserPreferences>
          <Preload all />
          {children}
        </A11yUserPreferences>
      </Suspense>
    </Canvas>
  )
}

export default LCanvas

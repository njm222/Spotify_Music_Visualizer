import * as THREE from 'three'
import React, { forwardRef, useEffect, useRef, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

const fontUrl = '/fonts/tomorrow_extralight_regular.json'

// eslint-disable-next-line react/display-name
const Text = forwardRef(
  (
    {
      children,
      vAlign = 'center',
      hAlign = 'center',
      size = 1,
      color = '#000000',
      ...props
    },
    ref
  ) => {
    const font = useLoader(FontLoader, fontUrl)
    const config = useMemo(() => ({ font, size: 40, height: 50 }), [font])
    const mesh = useRef()
    const text = useMemo(
      () => new TextGeometry(children, config),
      [config, children]
    )

    useEffect(() => {
      const size = new THREE.Vector3()
      mesh.current.geometry.computeBoundingBox()
      mesh.current.geometry.boundingBox.getSize(size)
      mesh.current.position.x =
        hAlign === 'center' ? -size.x / 2 : hAlign === 'right' ? 0 : -size.x
      mesh.current.position.y =
        vAlign === 'center' ? -size.y / 2 : vAlign === 'top' ? 0 : -size.y
    }, [children, vAlign, hAlign])

    return (
      <group ref={ref} {...props} scale={[0.1 * size, 0.1 * size, 0.1]}>
        <mesh ref={mesh} geometry={text}>
          <meshNormalMaterial />
        </mesh>
      </group>
    )
  }
)

export default Text

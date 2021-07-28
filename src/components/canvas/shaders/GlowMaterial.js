import * as THREE from 'three'
import { extend } from '@react-three/fiber'

export default class GlowMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        colour: { value: new THREE.Color('#ff005b') },
      },
      vertexShader: `
      varying vec3 vUv; 

      void main() {
        vec3 transformed = position + normal * 0.018;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
      }
      `,
      fragmentShader: `
      uniform vec3 colour;

      void main() {
        gl_FragColor = vec4(colour, 1.);
      }`,
    })
  }
}

extend({ GlowMaterial })

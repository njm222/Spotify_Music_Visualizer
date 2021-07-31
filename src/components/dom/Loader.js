import { useProgress } from '@react-three/drei'

const Loader = () => {
  const { progress } = useProgress
  return <div className='loader'>loading {progress?.toFixed()} %</div>
}

export default Loader

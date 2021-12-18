import { useStore } from '@/utils/store'
import { Stats } from '@react-three/drei'
import dynamic from 'next/dynamic'

const AboutScene = dynamic(() => import('@/components/canvas/AboutScene'), {
  ssr: false,
})

const Page = ({ title }) => {
  useStore.setState({ title })
  return (
    <>
      <AboutScene r3f />
      <Stats />
    </>
  )
}

export default Page

export async function getStaticProps() {
  return {
    props: {
      title: 'Tessellator - About',
    },
  }
}

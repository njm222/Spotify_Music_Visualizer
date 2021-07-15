import { useEffect, useState } from 'react'
import useStore from '@/helpers/store'
import dynamic from 'next/dynamic'
import { setAccessToken } from '@/spotifyClient'
import Keyboard from '@/components/dom/controls/Keybaord'
import { updateToken } from '@/backendClient'

const WelcomeUser = dynamic(() => import('@/components/dom/WelcomeUser'), {
  ssr: false,
})

const VisualizerPreview = dynamic(
  () => import('@/components/canvas/VisualizerPreview'),
  {
    ssr: false,
  }
)

const Playlists = dynamic(
  () => import('@/components/dom/playlists/Playlists'),
  {
    ssr: false,
  }
)

const Player = dynamic(() => import('@/components/dom/player/Player'), {
  ssr: false,
})

const Page = () => {
  const [set, isVisualizer, refreshToken, router] = useStore((state) => [
    state.set,
    state.isVisualizer,
    state.refreshToken,
    state.router,
  ])

  const [tokenReady, setTokenReady] = useState(false)

  useEffect(() => {
    set({ title: 'Dashboard' })
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('access_token') && searchParams.has('refresh_token')) {
      // get and store tokens from query string
      setAccessToken(searchParams.get('access_token'))
      set({
        accessToken: searchParams.get('access_token'),
        refreshToken: searchParams.get('refresh_token'),
      })
      setTokenReady(true)
    } else if (refreshToken) {
      // if refreshToken is present update accessToken
      ;(async () => {
        await updateToken(refreshToken)
        setTokenReady(true)
      })()
    } else {
      // redirect home for all edge cases
      router.push('/')
    }
  }, [])

  return (
    <>
      {tokenReady && !isVisualizer && (
        <>
          <WelcomeUser />
          {/* <Playlists /> */}
        </>
      )}
      {tokenReady && <Player />}
      <Keyboard />
      <VisualizerPreview r3f />
    </>
  )
}

export default Page

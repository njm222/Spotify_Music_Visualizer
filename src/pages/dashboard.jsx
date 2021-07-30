import { useEffect, useState } from 'react'
import useStore from '@/utils/store'
import dynamic from 'next/dynamic'
import { setAccessToken } from '@/spotifyClient'
import Keyboard from '@/components/dom/controls/Keybaord'
import IconButton from '@/components/dom/IconButton'
import SettingsIcon from '@/components/dom/SettingsIcon'
import { updateToken } from '@/backendClient'
import { Stats } from '@react-three/drei'

const WelcomeUser = dynamic(() => import('@/components/dom/WelcomeUser'), {
  ssr: false,
})

const DashboardScene = dynamic(
  () => import('@/components/canvas/DashboardScene'),
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

const Settings = dynamic(() => import('@/components/dom/Settings'), {
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
  const [showSettings, setShowSettings] = useState(false)

  const handleTokens = () => {
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
  }

  useEffect(() => {
    set({ title: 'Dashboard' })
    handleTokens()
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
      {showSettings ? (
        <Settings handleClose={() => setShowSettings(false)} />
      ) : (
        <IconButton
          title='settings'
          onClick={() => setShowSettings(true)}
          icon={<SettingsIcon />}
        />
      )}
      <DashboardScene r3f />
      <Stats />
    </>
  )
}

export default Page

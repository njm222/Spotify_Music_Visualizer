import { useEffect, useState } from 'react'
import { useStore } from '@/utils/store'
import dynamic from 'next/dynamic'
import { setAccessToken } from '@/spotifyClient'
import Keyboard from '@/components/dom/controls/Keybaord'
import IconButton from '@/components/dom/IconButton'
import Settings from '@/components/dom/Settings'
import SettingsIcon from '@/components/dom/SettingsIcon'
import Player from '@/components/dom/player/Player'
import WelcomeUser from '@/components/dom/WelcomeUser'
import DashboardScene from '@/components/canvas/DashboardScene'
import { updateToken } from '@/backendClient'
import { Stats } from '@react-three/drei'

const Playlists = dynamic(
  () => import('@/components/dom/playlists/Playlists'),
  {
    ssr: false,
  }
)

const Page = () => {
  console.log('dashboard')
  const refreshToken = useStore.getState().refreshToken
  const router = useStore.getState().router

  const [tokenReady, setTokenReady] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleTokens = () => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('access_token') && searchParams.has('refresh_token')) {
      // get and store tokens from query string
      setAccessToken(searchParams.get('access_token'))
      useStore.getState().set({
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
    useStore.getState().set({ title: 'Dashboard' })
    handleTokens()
  }, [])

  return (
    <>
      {tokenReady && (
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

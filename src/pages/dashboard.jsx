import { useEffect } from 'react'
import { setState, useStore } from '@/utils/store'
import { setAccessToken } from '@/spotifyClient'
import Keyboard from '@/components/dom/controls/Keybaord'
import IconButton from '@/components/dom/IconButton'
import Settings from '@/components/dom/Settings'
import SettingsIcon from '@/components/dom/SettingsIcon'
import Player from '@/components/dom/player/Player'
import WelcomeUser from '@/components/dom/WelcomeUser'
import Loader from '@/components/dom/Loader'
import DashboardScene from '@/components/canvas/DashboardScene'
import { updateToken } from '@/backendClient'
import { Stats } from '@react-three/drei'
import { useToggle } from '@/components/useToggle'

const Page = () => {
  console.log('dashboard')
  const refreshToken = useStore.getState().refreshToken
  const router = useStore.getState().router

  const handleTokens = () => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('access_token') && searchParams.has('refresh_token')) {
      // get and store tokens from query string
      setAccessToken(searchParams.get('access_token'))
      useStore.getState().set({
        accessToken: searchParams.get('access_token'),
        refreshToken: searchParams.get('refresh_token'),
      })
      useStore.getState().set({ tokenReady: true })
    } else if (refreshToken) {
      // if refreshToken is present update accessToken
      ;(async () => {
        await updateToken(refreshToken)
        useStore.getState().set({ tokenReady: true })
      })()
    } else {
      useStore.getState().set({ tokenReady: false })
      // redirect home for all edge cases
      router.push('/')
    }
  }

  useEffect(() => {
    useStore.getState().set({ title: 'Dashboard' })
    handleTokens()
  }, [])

  const ToggledPlayer = useToggle(Player, 'tokenReady')
  const ToggledWelcomeUser = useToggle(WelcomeUser, [
    'tokenReady',
    '!isVisualizer',
  ])
  const ToggledSettings = useToggle(Settings, 'settings')
  const ToggledSettingsIcon = useToggle(IconButton, '!settings')
  const ToggledScene = useToggle(DashboardScene, 'playerReady')
  const ToggledStats = useToggle(Stats, 'stats')
  const ToggledLoader = useToggle(Loader, 'sceneReady')
  return (
    <>
      <ToggledWelcomeUser />
      <ToggledPlayer />
      <ToggledSettings
        handleClose={() => useStore.getState().set({ settings: false })}
      />
      <ToggledSettingsIcon
        title='settings'
        onClick={() => useStore.getState().set({ settings: true })}
        icon={<SettingsIcon />}
      />
      <Keyboard />
      <ToggledScene r3f />
      <ToggledStats />
      <ToggledLoader />
    </>
  )
}

export default Page

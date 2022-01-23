import { useEffect } from 'react'
import { setState, getState } from '@/utils/store'
import { setAccessToken } from '@/spotifyClient'
import Keyboard from '@/components/dom/controls/Keybaord'
import MouseActivity from '@/components/dom/controls/MouseActivity'
import IconButton from '@/components/dom/IconButton'
import Settings from '@/components/dom/Settings'
import SettingsIcon from '@/components/dom/SettingsIcon'
import Player from '@/components/dom/player/Player'
import WelcomeUser from '@/components/dom/WelcomeUser'
import Loader from '@/components/dom/Loader'
import DashboardScene from '@/components/canvas/DashboardScene'
import { updateToken } from '@/backendClient'
import { Stats } from '@react-three/drei'
import {useToggle} from '@/components/useToggle'

const Page = () => {
  const refreshToken = getState().refreshToken
  const router = getState().router

  useEffect(() => {
    setState({ title: 'Dashboard' })
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.has('access_token') && searchParams.has('refresh_token')) {
      // get and store tokens from query string
      setAccessToken(searchParams.get('access_token'))
      setState({
        accessToken: searchParams.get('access_token'),
        refreshToken: searchParams.get('refresh_token'),
      })
      setState({ tokenReady: true })
    } else if (refreshToken) {
      // if refreshToken is present update accessToken
      ;(async () => {
        await updateToken(refreshToken)
        setState({ tokenReady: true })
      })()
    } else {
      setState({ tokenReady: false })
      // redirect home for all edge cases
      router.push('/')
    }
  }, [refreshToken, router])

  const ToggledPlayer = useToggle(Player, 'tokenReady')
  const ToggledWelcomeUser = useToggle(WelcomeUser, [
    'tokenReady',
    '!isVisualizer',
  ])
  const ToggledSettings = useToggle(Settings, ['mouseActive', 'settings'])
  const ToggledSettingsIcon = useToggle(IconButton, [
    'mouseActive',
    '!settings',
  ])
  const ToggledStats = useToggle(Stats, 'stats')
  const ToggledLoader = useToggle(Loader, '!playerReady')
  return (
    <>
      <ToggledWelcomeUser />
      <ToggledPlayer />
      <ToggledSettings
        handleClose={() => setState({ settings: false })}
      />
      <ToggledSettingsIcon
        title='settings'
        onClick={() => setState({ settings: true })}
        icon={<SettingsIcon />}
      />
      <Keyboard />
      <MouseActivity />
      <DashboardScene r3f />
      <ToggledStats />
      <ToggledLoader />
    </>
  )
}

export default Page

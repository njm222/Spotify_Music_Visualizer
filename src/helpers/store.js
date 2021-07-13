import create from 'zustand'
import { persist } from 'zustand/middleware'
import SpotifyAnalyzer from '@/helpers/SpotifyAnalyzer'

const useStore = create(
  persist(
    (set) => ({
      set,
      router: {},
      dom: null,
      accessToken: null,
      refreshToken: null,
      ready: false,
      isVisualizer: false,
      colourKey: 0,
      modeKey: 0,
      audioAnalyzer: null,
      spotifyAnalyzer: new SpotifyAnalyzer(),
      spotifyFeatures: null,
      player: {
        lastPlayed: null,
        playerState: null,
      },
    }),
    {
      name: 'tessellator-zustand',
      version: 1,
    }
  )
)

export const mutations = {
  position: 0,
}

export default useStore

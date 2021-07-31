import create from 'zustand'
import shallow from 'zustand/shallow'
import { persist } from 'zustand/middleware'
import SpotifyAnalyzer from '@/utils/SpotifyAnalyzer'
import { defaultAnalyzerOptions } from '@/constants'

const useStoreImpl = create(
  persist(
    (set) => ({
      set,
      router: {},
      dom: null,
      accessToken: null,
      refreshToken: null,
      tokenReady: false,
      playerReady: false,
      sceneReady: false,
      stats: true,
      settings: false,
      isVisualizer: false,
      colourKey: 0,
      modeKey: 0,
      audioAnalyzerOptions: defaultAnalyzerOptions,
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
      whitelist: ['accessToken', 'refreshToken', 'audioAnalyzerOptions'],
      merge: (persistedState, currentState) => {
        if (currentState?.refreshToken) {
          return currentState
        }
        return { ...currentState, ...persistedState }
      },
    }
  )
)

const mutations = {
  position: 0,
}

// shallow compare store
const useStore = (sel) => useStoreImpl(sel, shallow)
Object.assign(useStore, useStoreImpl)

const { getState, setState } = useStoreImpl

export { getState, setState, useStore, mutations }

import create from 'zustand'
import { persist } from 'zustand/middleware'
import SpotifyAnalyzer from '@/helpers/SpotifyAnalyzer'

const defaultAnalyzerOptions = {
  fftSize: 128,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -25,
}

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

export const mutations = {
  position: 0,
}

export default useStore

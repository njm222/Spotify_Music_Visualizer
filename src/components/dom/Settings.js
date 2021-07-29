import { button, useControls } from 'leva'
import useStore from '@/utils/store'
import { useEffect } from 'react'
import { defaultAnalyzerOptions } from '@/constants'

const Settings = ({ handleClose }) => {
  const audioAnalyzerOptions = useStore((state) => state.audioAnalyzerOptions)
  const set = useStore((state) => state.set)
  const { fftSize, smoothingTimeConstant, minDecibels, maxDecibels } =
    audioAnalyzerOptions

  const values = useControls({ close: button(() => handleClose()) })
  const analyzerValues = useControls(
    'Analyzer Options',
    {
      fftSize: {
        value: fftSize,
        options: [64, 128, 256, 512, 1024, 2048],
        onChange: (v) =>
          set({
            audioAnalyzerOptions: {
              ...audioAnalyzerOptions,
              fftSize: v,
            },
          }),
      },
      smoothingTimeConstant: {
        value: smoothingTimeConstant,
        min: 0.1,
        max: 1,
        step: 0.01,
        onChange: (v) =>
          set({
            audioAnalyzerOptions: {
              ...audioAnalyzerOptions,
              smoothingTimeConstant: v,
            },
          }),
      },
      minDecibels: {
        value: minDecibels,
        min: -200,
        max: maxDecibels - 1,
        step: 1,
        onChange: (v) =>
          set({
            audioAnalyzerOptions: {
              ...audioAnalyzerOptions,
              minDecibels: v,
            },
          }),
      },
      maxDecibels: {
        value: maxDecibels,
        min: minDecibels + 1,
        max: 0,
        step: 1,
        onChange: (v) =>
          set({
            audioAnalyzerOptions: {
              ...audioAnalyzerOptions,
              maxDecibels: v,
            },
          }),
      },
      reset: button(() =>
        set({ audioAnalyzerOptions: defaultAnalyzerOptions })
      ),
    },
    [audioAnalyzerOptions]
  )

  useEffect(() => {
    useStore.getState().audioAnalyzer?.updateAnalyser(audioAnalyzerOptions)
  }, [audioAnalyzerOptions])

  return null
}

export default Settings

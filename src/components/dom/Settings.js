import { Leva, useControls } from 'leva'
import useStore from '@/helpers/store'

const Settings = () => {
  const audioAnalyzerOptions = useStore((state) => state.audioAnalyzerOptions)
  const set = useStore((state) => state.set)

  const { fftSize, smoothingTimeConstant, minDecibels, maxDecibels } =
    audioAnalyzerOptions
  console.log(audioAnalyzerOptions)
  const options = useControls({
    fftSize: {
      value: fftSize,
      min: 128,
      max: 1028,
      step: 128,
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
      max: 0,
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
      min: -200,
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
  })

  return <Leva collapsed={true} />
}

export default Settings

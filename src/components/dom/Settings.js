import { button, useControls } from 'leva'
import { useStore, setState } from '@/utils/store'
import { useEffect } from 'react'
import { defaultAnalyzerOptions } from '@/constants'

const Settings = ({ handleClose }) => {
  console.log('settings')
  const audioAnalyzerOptions = useStore((state) => state.audioAnalyzerOptions)
  const set = useStore((state) => state.set)

  const { fftSize, smoothingTimeConstant, minDecibels, maxDecibels } =
    audioAnalyzerOptions

  const handleChange = (value, key) => {
    if (value === audioAnalyzerOptions[key]) {
      return
    }
    set((state) => ({
      audioAnalyzerOptions: {
        ...state.audioAnalyzerOptions,
        [key]: value,
      },
    }))
  }

  useEffect(() => {
    useStore.getState().audioAnalyzer?.updateAnalyser(audioAnalyzerOptions)
  }, [audioAnalyzerOptions])

  const values = useControls({ close: button(() => handleClose()) }, [])
  const analyzerValues = useControls(
    'Analyzer Options',
    {
      fftSize: {
        value: fftSize,
        options: [64, 128, 256, 512, 1024, 2048],
        onChange: (v) => handleChange(v, 'fftSize'),
        transient: true,
      },
      smoothingTimeConstant: {
        value: smoothingTimeConstant,
        min: 0.1,
        max: 1,
        step: 0.01,
        onChange: (v) => handleChange(v, 'smoothingTimeConstant'),
        transient: true,
      },
      minDecibels: {
        value: minDecibels,
        min: -200,
        max: maxDecibels - 1,
        step: 1,
        onChange: (v) => handleChange(v, 'minDecibels'),
        transient: true,
      },
      maxDecibels: {
        value: maxDecibels,
        min: minDecibels + 1,
        max: 0,
        step: 1,
        onChange: (v) => handleChange(v, 'maxDecibels'),
      },
      reset: button(
        () => set({ audioAnalyzerOptions: defaultAnalyzerOptions }) // TODO: reset bug
      ),
    },
    [audioAnalyzerOptions]
  )

  return null
}

export default Settings

import { memo, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import useStore, { mutations } from '@/helpers/store'
import { sdkInit } from '@/spotifyClient'
import PlayerControls from './PlayerControls'

const Player = () => {
  const playerState = useStore((state) => state.player.playerState)

  const initialTime = useRef()
  const timerRef = useRef(null)

  useEffect(() => {
    if (!document.getElementById('spotify-sdk')) {
      const sdk = document.createElement('script')
      sdk.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js')
      sdk.id = 'spotify-sdk'
      sdk.async = true
      sdkInit()
      document.head.appendChild(sdk)
    }
  }, [])

  useEffect(() => {
    if (!playerState) {
      return
    }

    clearInterval(timerRef.current)

    if (playerState?.paused) {
      // clear timeout
      return
    }
    initialTime.current = new Date().getTime()
    timerRef.current = setInterval(() => {
      const currentTime = new Date().getTime()
      const delay = currentTime - initialTime.current
      initialTime.current = currentTime
      console.log(delay)
      mutations.position += delay
    }, 50)
  }, [playerState])

  const progressBarStyles = useMemo(
    () => ({
      width: (mutations.position * 100) / playerState?.duration + '%',
    }),
    [playerState]
  )

  return playerState ? (
    <div className='playerContainer'>
      <div className='playerLeft'>
        <Image
          width={'50px'}
          height={'50px'}
          alt={'album art'}
          src={playerState?.track_window.current_track.album.images[0].url}
        />
        <div className='trackInfo'>
          <div className='trackName'>
            {playerState?.track_window.current_track.name}
          </div>
          <div className='trackArtist'>
            {playerState?.track_window.current_track.artists[0].name}
          </div>
        </div>
      </div>
      <div className='playerCenter'>
        <div className='playerControls'>
          <PlayerControls />
        </div>
        <div className='progress'>
          <div className='progress__bar' style={progressBarStyles} />
        </div>
      </div>
      <div className='playerRight'></div>
    </div>
  ) : null
}

export default memo(Player)

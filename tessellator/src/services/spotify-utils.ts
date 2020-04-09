import Axios from 'axios'

export class SpotifyPlayer {
  pausePlayer (accessToken: string) {
    console.log('=== pausing player ====')
    Axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).then(res => {
      console.log(res)
    }).catch((error) => {
      console.log(error)
    })
  }

  playPlayer (accessToken: string) {
    console.log('=== playing player ====')
    Axios.put('https://api.spotify.com/v1/me/player/play', {}, {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).then(res => {
      console.log(res)
    }).catch((error) => {
      console.log(error)
    })
  }
}

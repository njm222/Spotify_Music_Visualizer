import Axios from 'axios'

export class SpotifyAnalysis {
  trackFeatures: SpotifyApi.AudioFeaturesResponse | undefined;
  trackAnalysis: SpotifyApi.AudioAnalysisResponse | undefined;

  getTrackFeatures (accessToken: string, trackID: string) {
    console.log('=== track features ====')
    Axios.get(`https://api.spotify.com/v1/audio-features/${trackID}`, {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).then(res => {
      this.trackFeatures = res.data
    }).catch((error) => {
      console.log(error)
    })
  }

  getTrackAnalysis (accessToken: string, trackID: string) {
    console.log('=== track Analysis ====')
    Axios.get(`https://api.spotify.com/v1/audio-analysis/${trackID}`, {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).then(res => {
      this.trackAnalysis = res.data
    }).catch((error) => {
      console.log(error)
    })
  }
}

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

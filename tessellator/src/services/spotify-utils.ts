import Axios from 'axios'

export class SpotifyAnalysis {
  trackFeatures!: SpotifyApi.AudioFeaturesResponse;
  trackAnalysis!: SpotifyApi.AudioAnalysisResponse;
  g_section!: number;
  g_bar!: number;
  g_beat!: number;
  g_tatum!: number;
  g_segment!: number;
  g_sections: any;
  g_bars!: any;
  g_beats!: any;
  g_tatums!: any;
  g_segments!: any;
  barCounter!: number;
  beatCounter!: number;
  tatumCounter!: number;

  constructor () {
    this.resetTrackVariables()
  }

  getTrackFeaturesAnalysis (VisualizerUtils: any, accessToken: string, trackID: string) {
    console.log(VisualizerUtils)
    VisualizerUtils.setUpdatedTrackFeaturesFalse(false)
    VisualizerUtils.setUpdatedTrackAnalysisFalse(false)
    this.getTrackAnalysis(VisualizerUtils, accessToken, trackID)
    this.getTrackFeatures(VisualizerUtils, accessToken, trackID)
  }

  getTrackFeatures (VisualizerUtils: any, accessToken: string, trackID: string) {
    console.log('=== track Features ====')
    Axios.get(`https://api.spotify.com/v1/audio-features/${trackID}`, {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).then(res => {
      this.trackFeatures = res.data
      VisualizerUtils.setUpdatedTrackFeatures(true, res.data)
    }).catch((error) => {
      console.log(error)
    })
  }

  getTrackAnalysis (VisualizerUtils: any, accessToken: string, trackID: string) {
    console.log('=== track Analysis ====')
    Axios.get(`https://api.spotify.com/v1/audio-analysis/${trackID}`, {
      headers: { Authorization: 'Bearer ' + accessToken }
    }).then(res => {
      this.trackAnalysis = res.data
      this.setTrackAnalysisParts(res.data)
      VisualizerUtils.setUpdatedTrackAnalysis(true, res.data)
    }).catch((error) => {
      console.log(error)
    })
  }

  changeAnalysis (trackCounter: number) {
    this.changeSection(trackCounter)
    this.changeBar(trackCounter)
    this.changeBeat(trackCounter)
    this.changeTatum(trackCounter)
    this.changeSegment(trackCounter)
  }

  private changeSection (trackCounter: number) {
    if (this.g_sections[this.g_section]) {
      const sectionEnd = this.g_sections[this.g_section].start + this.g_sections[this.g_section].duration
      if (trackCounter > sectionEnd) {
        this.g_section++
      }
    }
  }

  private changeBar (trackCounter: number) {
    if (this.g_bars[this.g_bar]) {
      const barEnd = this.g_bars[this.g_bar].start + this.g_bars[this.g_bar].duration
      if (trackCounter > barEnd) {
        const barConfidence = this.g_bars[this.g_bar].confidence
        this.g_bar++
        if (barConfidence > 0.5) {
          this.barCounter++
        }
      }
    }
  }

  private changeBeat (trackCounter: number) {
    if (this.g_beats[this.g_beat]) {
      const beatEnd = this.g_beats[this.g_beat].start + this.g_beats[this.g_beat].duration
      if (trackCounter > beatEnd) {
        const beatConfidence = this.g_beats[this.g_beat].confidence
        this.g_beat++
        if (beatConfidence > 0.7) {
          this.beatCounter++
        }
      }
    }
  }

  private changeTatum (trackCounter: number) {
    if (this.g_tatums[this.g_tatum]) {
      const tatumEnd = this.g_tatums[this.g_tatum].start + this.g_tatums[this.g_tatum].duration
      if (trackCounter > tatumEnd) {
        this.g_tatum++
        this.tatumCounter++
      }
    }
  }

  private changeSegment (trackCounter: number) {
    if (this.g_segments[this.g_segment]) {
      const segmentEnd = this.g_segments[this.g_segment].start + this.g_segments[this.g_segment].duration
      if (trackCounter > segmentEnd) {
        this.g_segment++
      }
    }
  }

  private setTrackAnalysisParts (trackData: any) {
    this.resetTrackVariables()
    this.setSections(trackData.sections)
    this.setBars(trackData.bars)
    this.setBeats(trackData.beats)
    this.setTatums(trackData.tatums)
    this.setSegments(trackData.segments)
  }

  private resetTrackVariables () {
    this.g_sections = []
    this.g_bars = []
    this.g_beats = []
    this.g_tatums = []
    this.g_segments = []

    this.g_section = 0
    this.g_bar = 0
    this.g_beat = 0
    this.g_tatum = 0
    this.g_segment = 0

    this.barCounter = 0
    this.beatCounter = 0
    this.tatumCounter = 0
  }

  private setSections (sections: any) {
    this.g_sections = sections
  }

  private setBars (bars: any) {
    this.g_bars = bars
  }

  private setBeats (beats: any) {
    this.g_beats = beats
  }

  private setTatums (tatums: any) {
    this.g_tatums = tatums
  }

  private setSegments (segments: any) {
    this.g_segments = segments
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

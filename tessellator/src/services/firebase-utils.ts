/** Firebase utility  functions */
import Axios from 'axios'
import firebase from 'firebase'

const firebaseConfig = {
  apiKey: 'AIzaSyBARk3BcjSSYFGe3LkDQAu1H-6VMxrolNM',
  authDomain: 'tessellator-space.firebaseapp.com',
  databaseURL: 'https://tessellator-space.firebaseio.com',
  projectId: 'tessellator-space',
  storageBucket: 'tessellator-space.appspot.com',
  messagingSenderId: '1095910844942',
  appId: '1:1095910844942:web:1a329d270ba9ed1c05aa5f'
}

firebase.initializeApp(firebaseConfig)

export const firebaseRef = { firebase }

function handleUserPresense (auth: any, spotifyUrl: string) {
  const userID = auth.user.uid
  const myConnectionsRef = firebase.database().ref(`users/${userID}/connections`)

  // stores the timestamp of my last disconnect (the last time I was seen online)
  const lastOnlineRef = firebase.database().ref(`users/${userID}/lastOnline`)

  const spotifyLinkRef = firebase.database().ref(`users/${userID}/spotifyLink`)

  spotifyLinkRef.set(spotifyUrl)

  const connectedRef = firebase.database().ref('.info/connected')
  connectedRef.on('value', function (snap) {
    if (snap.val() === true) {
      // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)

      // When I disconnect, remove this device
      myConnectionsRef.onDisconnect().remove()

      // Add this device to my connections list
      // this value could contain info about the device or a timestamp too
      myConnectionsRef.set(userID)

      console.log(userID + ' is online')

      // When I disconnect, update the last time I was seen online
      lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP)
    }
  })
}

export function authUser (userData: SpotifyApi.UserProfileResponse): Promise<boolean> {
  return new Promise((resolve, reject) => {
    Axios.post('http://localhost:8081/authUser', userData).then((res) => {
      console.log(`Sent user id: ${userData.id} to server`)
      firebase.auth().signInWithCustomToken(res.data).then((res) => {
        handleUserPresense(res, userData.external_urls.spotify)
        resolve(true)
      }).catch(function (error) {
        reject(error)
      })
    })
  })
}

export function addUser (UserData: SpotifyApi.UserProfileResponse) {
  Axios.post('http://localhost:8081/addUser', {
    userData: UserData
  }).then((res) => {
    console.log(res)
  }).catch(function (error) {
    console.log(error)
  })
}

export function addTrackPlayed (trackData: SpotifyApi.TrackObjectFull, userID: string) {
  Axios.post('http://localhost:8081/addTrackPlayed', {
    trackData: trackData,
    userID: userID
  }).then((res) => {
    console.log(res)
  }).catch(function (error) {
    console.log(error)
  })
}

export function addArtistsPlayed (trackData: SpotifyApi.TrackObjectFull, userID: string) {
  Axios.post('http://localhost:8081/addArtistsPlayed', {
    artistsData: trackData.artists,
    userID: userID
  }).then((res) => {
    console.log(res)
  }).catch(function (error) {
    console.log(error)
  })
}

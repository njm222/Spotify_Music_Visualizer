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

export function authUser (userID: string, spotifyUrl: string) {
  Axios.post('http://localhost:8081/authUser', { uid: userID }).then((res) => {
    console.log(`Sent user id: ${userID} to server`)
    firebase.auth().signInWithCustomToken(res.data).then((res) => {
      handleUserPresense(res, spotifyUrl)
    }).catch(function (error) {
      // Handle Errors here.
      const errorCode = error.code
      const errorMessage = error.message
      alert(errorMessage)
      // ...
    })
  })
}

export function addUser (value: any) {
  firebase.firestore().collection('users').doc(value.id).set(value).then(ref => {
    console.log('Added document with ID: ', ref)
  }).catch((error) => {
    console.log(error)
  })
}

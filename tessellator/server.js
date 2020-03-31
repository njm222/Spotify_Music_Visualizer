const express = require('express');
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('query-string');
const fbAdmin = require('firebase-admin');
const app = express();
app.use(express.static(__dirname + '/public'))
  .use(cors("http://localhost:8080"));
app.use(express.json());

const client_id = '95d690a7b1ce48da9ba8fe7042a953d3';
const client_secret = '9bcb3d57b4294fa987b40fc9461deb9a';
const redirect_uri = 'http://localhost:8081/callback';
const server_address = 'http://localhost:8081'; // by default it should be http://localhost:8080 or 8081 by default
const server_port = '8081';
const frontend_server = 'http://localhost:8080'; // your Vue server port (8080 or 8081 by default)
const scope = 'user-read-private user-read-email user-read-birthdate user-top-read user-read-recently-played user-modify-playback-state user-read-playback-state user-read-currently-playing streaming';

app.listen(server_port, () =>{
  console.log("Server is listening on port: " + server_port);
});

app.get('/login', function (req, res) {
  // redirect to Spotify login page
  res.writeHead(302, {
    'Location': encodeURI(`https://accounts.spotify.com/authorize` +
      `?client_id=${client_id}` +
      `&response_type=code` +
      `&redirect_uri=${redirect_uri}` +
      `&scope=${scope}` +
      `&show_dialog=true`)
  });
  res.send();
});

app.get('/callback' , function (req, res) {
  const code = req.query.code || null;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      const refresh_token = body.refresh_token;
      res.cookie('accessToken', access_token);
      res.cookie('refreshToken', refresh_token);
      res.redirect(frontend_server);
    } else {
      res.redirect(server_address +
        querystring.stringify({
          error: 'invalid_token'
        }));
    }
  })
});

app.post('/refreshToken', function (req, res) {
  const refreshToken = req.body.refreshToken;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

/** Firebase */

const firebaseConfig = {
  apiKey: "AIzaSyBARk3BcjSSYFGe3LkDQAu1H-6VMxrolNM",
  authDomain: "tessellator-space.firebaseapp.com",
  databaseURL: "https://tessellator-space.firebaseio.com",
  projectId: "tessellator-space",
  storageBucket: "tessellator-space.appspot.com",
  messagingSenderId: "1095910844942",
  appId: "1:1095910844942:web:1a329d270ba9ed1c05aa5f"
};

const serviceAccount = require("./keys/serviceAccountKey.json");

fbAdmin.initializeApp({
  credential: fbAdmin.credential.cert(serviceAccount),
  databaseURL: "https://tessellator-space.firebaseio.com"
});

app.post('/authUser', function (req, res) {
  const userID = req.body.uid;
  fbAdmin.auth().createCustomToken(userID)
      .then(function(customToken) {
        // Send token back to client
        res.send(customToken);
      })
      .catch(function(error) {
        console.log('Error creating custom token:', error);
      })
});

import axios from 'axios'
import useStore from './utils/store'
import { setAccessToken } from './spotifyClient'

const backendClient = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://localhost:8888',
  withCredentials: true,
  headers: {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin':
      process.env.FRONTEND_URL || 'http://localhost:3000',
  },
})

export const updateToken = async (refreshToken) => {
  try {
    const { data } = await backendClient.post('/refresh-token', {
      refreshToken,
    })
    useStore.setState({
      accessToken: data?.access_token,
      refreshToken: data?.refresh_token,
    })
    setAccessToken(data?.access_token)
    return data
  } catch (err) {
    console.log(err) // TODO: toast messages
    useStore.setState({ refreshToken: null }) // reset refresh token just incase
    window.location = 'http://localhost:3000' // temp solution
  }
}

export const login = async () => {
  try {
    const { data } = await backendClient.get('/login')
    return data
  } catch (err) {
    console.error(err)
  }
}

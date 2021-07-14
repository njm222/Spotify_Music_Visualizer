import axios from 'axios'
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
    const { data } = await backendClient.post('/refreshToken', { refreshToken })
    setAccessToken(data?.access_token)
    return data
  } catch (err) {
    console.log(err)
    // TODO: toast messages
  }
}

export const login = async () => {
  try {
    const { data } = await backendClient.get('/login')
    console.log(data)
    return data
  } catch (err) {
    console.error(err)
  }
}
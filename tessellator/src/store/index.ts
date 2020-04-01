import Vue from 'vue'
import Vuex from 'vuex'
import { authUser } from '@/services/firebase-utils'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    accessToken: null,
    refreshToken: null,
    user: null,
    authUser: null,
    onlineUsers: null,
    lastOnlineUsers: null,
    playerTrack: null,
    playerArtist: null
  },
  mutations: {
    mutateAccessToken (state, payload) {
      state.accessToken = payload
    },
    mutateRefreshToken (state, payload) {
      state.refreshToken = payload
    },
    mutateUser (state, payload) {
      state.user = payload
    },
    mutateAuthUser (state, payload) {
      state.authUser = payload
    },
    mutateOnlineUsers (state, payload) {
      state.onlineUsers = payload
    },
    mutateLastOnlineUsers (state, payload) {
      state.lastOnlineUsers = payload
    },
    mutatePlayerTrack (state, payload) {
      state.playerTrack = payload
    },
    mutatePlayerArtist (state, payload) {
      state.playerArtist = payload
    }
  },
  getters: {
    getAccessToken (state) {
      return state.accessToken
    },
    getRefreshToken (state) {
      return state.refreshToken
    },
    getUser (state) {
      return state.user
    },
    getAuthUser (state) {
      return state.authUser
    },
    getOnlineUsers (state) {
      return state.onlineUsers
    },
    getLastOnlineUsers (state) {
      return state.lastOnlineUsers
    },
    getPlayerTrack (state) {
      return state.playerTrack
    },
    getPlayerArtist (state) {
      return state.playerArtist
    }
  },
  actions: {
    async actionAuthUser (context, payload) {
      context.commit('mutateAuthUser', await authUser(payload.id, payload.external_urls.spotify))
    }
  },
  modules: {
  }
})

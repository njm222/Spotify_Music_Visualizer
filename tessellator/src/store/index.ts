import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    accessToken: null,
    refreshToken: null,
    user: null
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
    }
  },
  actions: {
  },
  modules: {
  }
})

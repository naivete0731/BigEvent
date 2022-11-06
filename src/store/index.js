import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { getUserInfoAPI } from '@/api'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 1. 用来存储登录成功之后，得到的 token
    token: '',
    userInfo: {}
  },
  getters: {
    getToken (state) {
      return state.token
    },
    username: state => state.userInfo.username,
    nickname: state => state.userInfo.nickname,
    user_pic: state => state.userInfo.user_pic
  },
  mutations: {
    // 2. 更新 token 的 mutations函数
    updateToken (state, newToken) {
      state.token = newToken
    },
    updateUserInfo (state, info) {
      state.userInfo = info
    }
  },
  actions: {
    // 请求->用户信息
    async getUserInfoActions (state) {
      const { data: res } = await getUserInfoAPI()
      console.log(res)
      if (res.code === 0) {
        state.commit('updateUserInfo', res.data)
      }
    }
  },
  modules: {
  },
  plugins: [
    createPersistedState() // 添加持久化插件
  ]
})

// vuex默认保存在内存中的，所以页面刷新所有的值会回归初始化(不乏做到持久存储)
// vuex-persistedstate@3.2.1 这个插件可以让vuex持久化存储

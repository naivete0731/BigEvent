import Vue from 'vue'
import VueRouter from 'vue-router'
import vuex from '@/store'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home',
    component: () => import('@/views/layout'),
    children: [
      {
        path: 'home',
        component: () => import('@/views/home')
      },
      {
        path: 'user-info',
        component: () => import('@/views/User/userInfo')
      },
      {
        path: 'user-avatar',
        component: () => import('@/views/User/userAvatar')
      },
      {
        path: 'user-pwd',
        component: () => import('@/views/User/userPwd')
      },
      {
        path: 'art-cate',
        component: () => import('@/views/article/artCate')
      },
      {
        path: 'art-list',
        component: () => import('@/views/article/artList.vue')
      }
    ]
  },
  {
    path: '/reg',
    component: () => import('@/views/register')
  },
  {
    path: '/login',
    component: () => import('@/views/login')
  }
]

const router = new VueRouter({
  routes
})
// 路由白名单(无需登陆即可访问的路由地址)
const whiteList = ['/login', '/reg']
// 全局前置路由守卫
// 1. 浏览器第一次打开项目页面，会触发一次全局前置路由守卫函数
// 2. 判断登陆是否：有token证明登陆了，无token则未登录
// 3. next()如果强制切换路由地址，会再次走路由守卫再次区匹配路由表
router.beforeEach((to, from, next) => {
  const token = vuex.state.token
  if (token) {
    // 登陆了
    if (token && !vuex.state.userInfo.username) {
      // 本地有token值并且没有用户信息，才去请求用户信息
      vuex.dispatch('getUserInfoActions')
    }
    next()
  } else {
    // 未登录
    // 数组.includes(值)，作用：判断值是否在数组出现过，出现过返回true
    if (whiteList.includes(to.path)) {
      // 未登录，可以访问的路由地址，则放行(路由全局前置守卫不会再次触发了,而是匹配路由表,让组件挂载)
      next()
    } else {
      // next()强制切换到登陆路径上
      next('/login')
    }
  }
})
export default router

// 退出登陆,重新登陆,只走相关组件代码(异步dom切换，不会导致所有代码重新执行，App.vue不走)
// 效果不对：更换账号需要重新请求用户数据
// 解决：
// 1. 可以走登陆页面，登陆成功后，再发请求拿到用户信息
// 2. 可以在全局前置路由守卫中，写(路由跳转的时候，判断+截取)

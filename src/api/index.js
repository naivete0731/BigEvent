// 封装具体接口请求方法
// 注意：每个方法只负责请求一个url地址
import request from '@/utils/request'

// 导出接口方法
//                        因为传递过来的实参是对象 所以用解构赋值
export const registerAPI = ({ username, password, repassword }) => {
  return request({
    url: '/api/reg',
    method: 'POST',
    // axios传参  params, data
    data: {
      username,
      password,
      repassword
    }
  })
}
/**
 * 登录接口
 * @param {*} param0 { username: 用户名, password: 密码}
 * @returns Promise对象
 */
export const loginAPI = ({ username, password }) => {
  return request({
    url: '/api/login',
    method: 'POST',
    data: {
      username,
      password
    }
  })
}

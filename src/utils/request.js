// 基于axios封装，网络请求函数
import axios from 'axios'

// axios.create()创建一个带配置项的自定义axios函数
const request = axios.create({
  baseURL: 'http://big-event-vue-api-t.itheima.net'
})

export default request

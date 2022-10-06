<template>
  <!-- 注册页面的整体盒子 -->
  <div class="reg-container">
      <!-- 注册的盒子 -->
      <div class="reg-box">
        <!-- 标题的盒子 -->
        <div class="title-box">

        </div>
        <!-- 登陆表单区域 -->
        <el-form :model="loginForm" :rules="rules" ref="loginForm">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" show-password placeholder="请输入密码" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loginFn" style="width:100%">登陆</el-button>
            <el-link type="info" @click="$router.push('/reg')">还没账号？去注册</el-link>
          </el-form-item>
        </el-form>
      </div>
    </div>
</template>

<script>
import { loginAPI } from '@/api'
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: 'LoginVue',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]{1,10}$/, message: '用户名必须是1-10的大小写字符串', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { pattern: /^\S{6,15}$/, message: '密码长度必须在6-15个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['getToken'])
  },
  methods: {
    // 映射vuex中的方法
    ...mapMutations(['updateToken']),
    loginFn () {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return this.$message.error('登陆格式错误')
        const { data: res } = await loginAPI(this.loginForm)
        if (res.code !== 0) return this.$message.error(res.message)
        this.$message.success(res.message)
        console.log(res)
        // 提交给mutations把token字符串保存到vuex中
        this.updateToken(res.token)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.reg-container {
  background: url('@/assets/images/login_bg.jpg') center;
  background-size: cover;
  height: 100%;

  .reg-box {
    width: 400px;
    height: 280px;
    background-color: #fff;
    border-radius: 3px;
    box-sizing: border-box;
    padding: 0 30px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .title-box {
      height: 60px;
      background: url('@/assets/images/login_title.png') center no-repeat;
    }

    .btn-reg {
      width: 100%;
    }
  }

}
</style>

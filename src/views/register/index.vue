<template>
    <!-- 注册页面的整体盒子 -->
    <div class="reg-container">
      <!-- 注册的盒子 -->
      <div class="reg-box">
        <!-- 标题的盒子 -->
        <div class="title-box">

        </div>
        <!-- 注册表单区域 -->
        <el-form :model="form" :rules="rules" ref="form">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" show-password placeholder="请输入密码" type="password"></el-input>
          </el-form-item>
          <el-form-item prop="repassword">
            <el-input v-model="form.repassword" show-password placeholder="请在此确认密码" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="registerFn" style="width:100%">注册</el-button>
            <el-link type="info" @click="$router.push('/login')">去登陆</el-link>
          </el-form-item>
        </el-form>
      </div>
    </div>
</template>

<script>
import { registerAPI } from '@/api'
export default {
  name: 'RegisterVue',
  data () {
    // 注意：必须在data函数里定义此箭头函数，才能确保this.form使用
    const samePwdFn = (rule, value, callback) => {
      if (value !== this.form.password) {
        // 如果验证失败，则调用 回调函数时，指定一个Error对象
        callback(new Error('两次输入的密码不一致'))
      } else {
        // 如果验证成功，则直接调用 callback 回调函数即可
        callback()
      }
    }
    return {
      form: {
        username: '',
        password: '',
        repassword: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]{1,10}$/, message: '用户名必须是1-10的大小写字母盒和数字', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { pattern: /^\S{6,15}$/, message: '密码必须是6-15的非空字符', trigger: 'blur' }
        ],
        repassword: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          { pattern: /^\S{6,15}$/, message: '密码必须是6-15的非空字符', trigger: 'blur' },
          { validator: samePwdFn, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    registerFn () {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const { data: res } = await registerAPI(this.form)
          if (res.code !== 0) return this.$message.error(res.message)
          this.$message.success(res.message)
          this.$router.push('/login')
        } else {
          this.$message.error('注册失败')
          return false
        }
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
    height: 335px;
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

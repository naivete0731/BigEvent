<template>
   <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>基本资料</span>
    </div>
    <!-- 表单 -->
    <el-form
      :model="userForm"
      :rules="userFormRules"
      ref="userFormRef"
      label-width="100px"
    >
      <el-form-item label="登录名称" prop="username">
        <el-input v-model="userForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input
          v-model="userForm.nickname"
          minlength="1"
          maxlength="10"
        ></el-input>
      </el-form-item>
      <el-form-item label="用户邮箱" prop="email">
        <el-input v-model="userForm.email"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitFn">提交修改</el-button>
        <el-button @click="resetFn">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { updateUserInfoAPI } from '@/api'
export default {
  name: 'UserInfo',
  data () {
    return {
      userForm: {
        username: this.$store.state.userInfo.username,
        nickname: '',
        email: ''
      },
      userFormRules: {
        nickname: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          { pattern: /^\S{1,10}$/, message: '昵称必须是1-10位非空字符串', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 提交修改->点击事件
    submitFn () {
      this.$refs.userFormRef.validate(async valid => {
        if (valid) {
          console.log(this.userForm)
          // 因为后端更新用户基本资料接口，需要带id过去，userForm对象里本身没有
          // 所以缺少id，就给它添加一个
          this.userForm.id = this.$store.state.userInfo.id
          const { data: res } = await updateUserInfoAPI(this.userForm)
          if (res.code !== 0) return this.$message.error('更新用户信息失败！')
          // 更新用户信息成功，刷新 Vuex中的数据
          this.$message.success('修改成功!')
          // 重新让vuex获取最新的用户数据
          this.$store.dispatch('initUserInfo')
        } else {
          this.$message.error('未通过校验')
          return false
        }
      })
    },
    // 重置按钮->点击事件
    resetFn () {
      // this.userForm.nickname = ''
      // this.userForm.email = ''

      // el-form提供了一个重置表单(并且还能重置报错提示)
      this.$refs.userFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-form {
  width: 500px;
}
</style>

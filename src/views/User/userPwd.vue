<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>重置密码</span>
    </div>
    <!-- 表单 -->
    <el-form :model="pwdForm" :rules="pwdFormRules" ref="pwdFormRef" label-width="100px">
      <el-form-item label="原密码" prop="old_pwd">
        <el-input v-model="pwdForm.old_pwd" type="password"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="new_pwd">
        <el-input v-model="pwdForm.new_pwd" type="password"></el-input>
      </el-form-item>
      <el-form-item label="确认新密码" prop="re_pwd">
        <el-input v-model="pwdForm.re_pwd" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="updatePwdFn">修改密码</el-button>
        <el-button @click="resetFn">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { updatePwdAPI } from '@/api'
export default {
  data () {
    // 新密码不能相同
    const samePwd = (rule, value, callback) => {
      // value就是校验规则所对应输入框值(新密码)
      if (value === this.pwdForm.old_pwd) {
        callback(new Error('新密码不能和近期密码相同'))
      } else {
        callback()
      }
    }
    // 确认密码和新密码保持一致
    const rePwd = (rule, value, callback) => {
      if (value !== this.pwdForm.new_pwd) {
        callback(new Error('确认密码与新密码不相同'))
      } else {
        callback()
      }
    }
    return {
      pwdForm: {
        old_pwd: '',
        new_pwd: '',
        re_pwd: ''
      },
      // 表单验证规则对象
      pwdFormRules: {
        old_pwd: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { pattern: /^\S{6,15}$/, message: '密码长度必须是6-15位非空字符串', trigger: 'blur' }
        ],
        new_pwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { pattern: /^\S{6,15}$/, message: '密码长度必须是6-15位非空字符串', trigger: 'blur' },
          { validator: samePwd, trigger: 'blur' }
        ],
        re_pwd: [
          { required: true, message: '请再次确认新密码', trigger: 'blur' },
          { pattern: /^\S{6,15}$/, message: '密码长度必须是6-15位的非空字符串', trigger: 'blur' },
          { validator: rePwd, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    updatePwdFn () {
      this.$refs.pwdFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验不符合')
        const { data: res } = await updatePwdAPI(this.pwdForm)
        if (res.code !== 0) return this.$message.error('更改密码失败')
        this.$message.success('修改密码成功')
        this.$refs.pwdFormRef.resetFields()
        // 重置密码(被动退出)
        this.$store.commit('updateToken', '')
        this.$store.commit('updateUserInfo', {})
        this.$router.push('/login')
      })
    },
    resetFn () {
      this.$refs.pwdFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-form {
  width: 500px;
}
</style>

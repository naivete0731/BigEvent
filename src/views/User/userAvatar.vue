<template>
  <div>
    <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>更换头像</span>
    </div>
    <div>
      <!-- 图片，用来展示用户选择的头像 -->
      <img v-if="!avatar" class="the_img" src="../../assets/images/avatar.jpg" alt="" />
      <img v-else :src="avatar" class="the_img" alt="">
      <!-- 按钮区域 -->
      <div class="btn-box">
        <input type="file" accept="image/*" style="display: none" ref="iptRef" @change="onFileChange" />
        <el-button type="primary" icon="el-icon-plus" @click="chooseImg">选择图片</el-button>
        <el-button type="success" icon="el-icon-upload" @click="uploadFn" :disabled="avatar === ''">上传头像</el-button>
      </div>
    </div>
  </el-card>
  </div>
</template>

<script>
import { updateUserAvatarAPI } from '@/api'
export default {
  name: 'UserAvatar',
  data () {
    return {
      avatar: ''
    }
  },
  methods: {
    // 选择图片->点击事件
    chooseImg () {
      this.$refs.iptRef.click()
    },
    onFileChange (e) { // e 原生事件对象
      console.log(e)
      const files = e.target.files
      if (files.length === 0) {
        // 证明没有选择文件
      } else {
        // 选择了文件
        console.log(files[0])
        // 目标：选择的图片文件，要给到img标签上做纯前端预览
        // img标签的src值
        // * 只能是图片的“链接地址”(外链http://开头，图片文件相对路径)
        // 或者是图片的base64字符串（data:image/png;base64)开头，图片转base64字符串
        // 解决方案：文件 -> 内存临时地址(这个地址能能在js内存里不能发给后台)
        // 语法：URL.createObjectURL(文件)
        // this.avatar = URL.createObjectURL(files[0])

        // 解决方案2：文件 -> base64字符串(可以发给后台)
        // H5新增的方法
        const fr = new FileReader()
        // 传入文件对象开始读
        fr.readAsDataURL(files[0])
        // onload等待把文件读成base64字符串后会触发onload事件函数
        fr.onload = e => {
          // e.target.result的值就是读完的结果
          this.avatar = e.target.result // 赋予给变量，让他显示在img的src中
        }
      }
    },
    // 上传头像
    async uploadFn () {
      const { data: res } = await updateUserAvatarAPI(this.avatar)
      if (res.code !== 0) return this.$message.error(res.message)
      // 更新头像成功
      this.$message.success(res.message)
      // 立刻让vuex里actions(获取用户信息的actions)在请求一次后台更新vuex里值
      this.$store.dispatch('getUserInfoActions')
    }
  }
}
</script>

<style lang="less" scoped>
.btn-box {
  margin-top: 10px;
}
.preview {
  object-fit: cover;
}
.the_img{
    width: 350px;
    height: 350px;
}
</style>

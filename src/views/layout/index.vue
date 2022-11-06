<template>
  <el-container class="main-container">
    <!-- 头部区域 -->
    <el-header>
      <!-- 左侧的 logo -->
      <img src="../../assets/images/logo.png" alt="" />
      <!-- 右侧的菜单 -->
      <el-menu
        class="el-menu-top"
        mode="horizontal"
        background-color="#23262E"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-submenu index="1">
          <template slot="title">
            <!-- 头像 -->
            <img v-if="user_pic" :src="user_pic" class="avatar" alt="">
            <img v-else src="../../assets/images/logo.png" alt="" class="avatar" />
            <span>个人中心</span>
          </template>
          <el-menu-item index="1-1"><i class="el-icon-s-operation"></i>基本资料</el-menu-item>
          <el-menu-item index="1-2"><i class="el-icon-camera"></i>更换头像</el-menu-item>
          <el-menu-item index="1-3"><i class="el-icon-key"></i>重置密码</el-menu-item>
        </el-submenu>
        <el-menu-item index="2" @click="quitFn"><i class="el-icon-switch-button"></i>退出</el-menu-item>
      </el-menu>
    </el-header>
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside width="200px">
        <!-- 侧边栏-用户信息区域 -->
        <div class="user-box">
          <img v-if="user_pic" :src="user_pic" alt="" >
          <img v-else src="@/assets/images/logo.png" alt="" >
          <span>欢迎 {{ nickname || username }}</span>
        </div>
        <!-- 侧边栏导航-菜单 -->
        <el-menu
      :default-active="$route.path"
      class="el-menu-vertical-demo"
      unique-opened
      router
      background-color="#23262E"
      text-color="#fff"
      active-text-color="#409EFF">
      <template v-for="item in menus">
        <el-menu-item v-if="!item.children" :index="item.indexPath" :key="item.itemPath">
          <i :class="item.icon"></i>
          <span>{{ item.title }}</span>
        </el-menu-item>
      <el-submenu v-else :index="item.indexPath" :key="item.indexPath">
        <template slot="title">
          <i :class="item.icon"></i>
          <span>{{ item.title }}</span>
        </template>
        <el-menu-item v-for="obj, index in item.children" :index="obj.indexPath" :key="index">
          <i :class="obj.icon"></i>
          <span>{{ obj.title }}</span>
        </el-menu-item>
      </el-submenu>
      </template>

    </el-menu>
      </el-aside>
      <el-container>
        <!-- 页面主体区域 -->
        <el-main>
          <!-- 路由挂载点 -->
         <router-view></router-view>
        </el-main>
        <!-- 底部 footer 区域 -->
        <el-footer>© www.itheima.com - 黑马程序员</el-footer>
      </el-container>
    </el-container>
  </el-container>

</template>

<script>
import { mapGetters } from 'vuex'
// import { userInfoAPI } from '@/api'
import { getMenuListAPI } from '@/api'
// 在组件标签上绑定的所有事件(包括原生事件的名字，input等等)
// 都是自定义事件，都需要组件内的$emit来触发才行
// 万一组件内不支持原生时间码名字
// 解决：@事件名.native="methods里方法名"
// .native给组件内根标签，绑定这个原生的事件
export default {
  name: 'my-layout',
  data () {
    return {
      menus: []
    }
  },
  methods: {
    quitFn () {
      this.$confirm('退出登录，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.commit('updateToken', '')
        this.$store.commit('updateUserInfo', {})
        this.$router.push('/login')
        this.$message.success('退出成功')
      }).catch(() => {
        this.$message.error('取消登录')
      })
    },
    // 请求侧边栏数据
    async getMenuListFn () {
      const { data: res } = await getMenuListAPI()
      console.log(res)
      this.menus = res.data
    }
  },
  created () {
    // userInfoAPI(.then((res) => console.log(res))
    // this.$store.dispatch('getUserInfoActions')
    this.getMenuListFn()
  },
  computed: {
    ...mapGetters(['username', 'nickname', 'user_pic'])
  }
}
</script>

<style lang="less" scoped>
.main-container {
  height: 100%;
  .el-header,
  .el-aside {
    background-color: #23262e;
  }
  .el-header {
    padding: 0;
    display: flex;
    justify-content: space-between;
  }
  .el-main {
    overflow-y: scroll;
    height: 0;
    background-color: #F2F2F2;
  }
  .el-footer {
    background-color: #eee;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.avatar {
  border-radius: 50%;
  width: 35px;
  height: 35px;
  background-color: #fff;
  margin-right: 10px;
  object-fit: cover;
}

.user-box {
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  user-select: none;
  img {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 15px;
    object-fit: cover;
  }
  span {
    color: white;
    font-size: 12px;
  }
}
</style>

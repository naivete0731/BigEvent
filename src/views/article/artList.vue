<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>文章列表</span>
      </div>
      <!-- 搜索区域 -->
      <div class="search-box">
        <el-form :inline="true" :model="q">
          <el-form-item label="文章分类">
            <el-select v-model="q.cate_id" placeholder="请选择分类" size="small">
              <el-option v-for="obj in cateList" :key="obj.id"
              :label="obj.cate_alias"
              :value="obj.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布状态" style="margin-left: 15px;">
            <el-select v-model="q.state" placeholder="请选择状态" size="small">
              <el-option label="已发布" value="已发布"></el-option>
              <el-option label="草稿" value="草稿"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="choseFn">筛选</el-button>
            <el-button type="info" size="small" @click="resetFn">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 发表文章的按钮 -->
        <el-button type="primary" size="small" class="btn-pub" @click="showPubDialogFn">发表文章</el-button>
      </div>

  <!-- 文章表格区域 -->
  <el-table :data="artList" style="width: 100%;" border stripe>
    <el-table-column label="文章标题" prop="title">
      <template v-slot="scope">
        <el-link type="primary" @click="showDetailFn(scope.row.id)">{{ scope.row.title }}</el-link>
      </template>
    </el-table-column>
    <el-table-column label="分类" prop="cate_name"></el-table-column>
    <el-table-column label="发表时间" prop="pub_date">
      <template v-slot="scope">
        <span> {{ $formatDate(scope.row.pub_date)}}</span>
      </template>
    </el-table-column>
    <el-table-column label="状态" prop="state"></el-table-column>
    <el-table-column label="操作">
      <template v-slot="{ row }">
        <el-button type="danger" size="mini" @click="removeFn(row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChangeFn"
        @current-change="handleCurrentChangeFn"
        :current-page.sync="q.pagenum"
        :page-sizes="[2, 3, 5, 10]"
        :page-size.sync="q.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
</el-pagination>
    </el-card>

    <!-- 发表文章的 Dialog 对话框 -->
<!-- 发表文章的 Dialog 对话框 -->
<el-dialog
title="发表文章"
:visible.sync="pubDialogVisible"
fullscreen
:before-close="handleClose"
@close="dialogCloseFn"
>
  <el-form :model="pubForm" :rules="pubFormRules" ref="pubFormRef" label-width="100px">
  <el-form-item label="文章标题" prop="title">
    <el-input v-model="pubForm.title" placeholder="请输入标题"></el-input>
  </el-form-item>
  <el-form-item label="文章分类" prop="cate_id">
    <el-select v-model="pubForm.cate_id" placeholder="请选择分类" style="width: 100%;">
      <el-option v-for="obj in cateList"
      :key="obj.id"
      :label="obj.cate_alias"
      :value="obj.id"
      ></el-option>
    </el-select>
  </el-form-item>
  <el-form-item label="文章内容" prop="content">
    <quill-editor
    @blur="contentChange"

    v-model="pubForm.content"
    ></quill-editor>
  </el-form-item>
    <el-form-item label="文章封面" prop="cover_img">
  <!-- 用来显示封面的图片 -->
  <img src="../../assets/images/cover.jpg" alt="" class="cover-img" ref="imgRef" />
  <br />
  <!-- 文件选择框，默认被隐藏 -->
  <input @change="changeCoverFn" type="file" style="display: none;" accept="image/*" ref="iptFileRef" />
  <!-- 选择封面的按钮 -->
  <el-button type="text" @click="selCoverFn">+ 选择封面</el-button>
  </el-form-item>
  <el-form-item>
    <el-button type="primary" @click="pubArticleFn('已发布')">发布</el-button>
    <el-button type="info" @click="pubArticleFn('草稿')">存为草稿</el-button>
  </el-form-item>
</el-form>
</el-dialog>
  <!-- 查看文章详情的对话框 -->
    <el-dialog title="文章预览" :visible.sync="detailVisible" width="80%">
      <h1 class="title">{{ artDetail.title }}</h1>

      <div class="info">
        <span>作者：{{ artDetail.nickName || artDetail.username }}</span>
        <span>发布时间：{{ $formatDate(artDetail.pub_date) }}</span>
        <span>所属分类：{{ artDetail.cate_name }}</span>
        <span>状态：{{ artDetail.state }}</span>
      </div>

      <!-- 分割线 -->
      <el-divider></el-divider>

      <!-- 文章的封面 -->
      <img v-if="artDetail.cover_img" :src="baseURL + artDetail.cover_img" alt="">

      <!-- 文章的详情 -->
      <div class="detail-box" v-html="artDetail.content"></div>
    </el-dialog>
  </div>
</template>

<script>
import { getArtCateListAPI, uploadArticleAPI, getArticleListAPI, getArtDetailAPI, delArticleAPI } from '@/api'
import { baseURL } from '@/utils/request'
// webpack会把图片变为一个base64字符串/在打包后的图片临时地址
import imgObj from '../../assets/images/cover.jpg'
// 标签和样式中，引入图片文件直接写"静态路径"(把路径放在js的vue变量里在赋予是不行的)
// 原因：webpack分析标签的时候，如果src的值是一个相对路径,它会区帮我们找到那个路径的文件并一起打包
// 打包时候,会分析文件的大小,小图转成base64字符串在赋予给src,如果是大图拷贝图片换个路径给img的src显示(运行时)

// 解决："JS里引入图片，就用import引入",让webpack把它当做模块数据,是转换成打包的图片路径还是base64字符串
export default {
  name: 'ArtList',
  data () {
    return {
      baseURL: baseURL,
      // 查询参数对象
      q: {
        pagenum: 1, // 默认那第一页数据
        pagesize: 5, // 默认当前页需要几条数据(传递给后台，后台就返回几个数据)
        cate_id: '', // 文章id
        state: '' // 文章状态
      },
      pubDialogVisible: false, // 控制发表文章对话框的显示与隐藏
      pubForm: { // 表单的数据对象
        title: '', // 文章标题
        cate_id: '', // 文章分类ID
        content: '', // 文章内容
        cover_img: '', // 封面图片
        state: '' // 发布状态(已发布，草稿)
      },
      cateList: [],
      pubFormRules: { // 表单的验证规则对象
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' },
          { min: 1, max: 30, message: '文章标题的长度为1-30个字符', trigger: 'blur' }
        ],
        cate_id: [
          { required: true, message: '请选择文章标题', trigger: 'change' }
        ],
        content: [
          // 为何这个输入内容了，校验不会去掉
          // 原因：
          // content对应quill-editor富文本编辑器，他不是el提供表单标签
          // el-input等输入框的在blur事件进行校验
          // 下拉菜单，单选框，复选框，实在change事件进行校验
          // quill-editor2个事件都没有，所以你输入内容也不会自己走校验
          // 解决：
          // 自己来给quill-editor绑定change事件
          // 在事件处理函数中用el-form组件对象内，调用某个校验规则再重新执行

          { required: true, message: '请输入文章内容', trigger: 'change' }
        ],
        cover_img: [
          { required: true, message: '请上传封面', trigger: 'blur' }
        ]
      },
      artList: [], // 文章的列表数据
      total: 0, // 总数据条数
      detailVisible: false, // 文章详情对话框
      artDetail: {} // 文章详情
    }
  },
  created () {
    // 请求分类数据
    this.getCateListFn()
    // 请求文章列表
    this.getArticleListFn()
  },
  methods: {
    // 发表文章按钮点击事件 -> 让对话框出现
    showPubDialogFn () {
      this.pubDialogVisible = true
    },
    // 发布文章-对话框-关闭前的回调
    async handleClose (done) { // done的作用：调用才会放行让对话框关闭
      // 询问用户是否确认关闭对话框
      const confirmResult = await this.$confirm('此操作将导致文章信息丢失, 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonClass: '取消',
        type: 'warning'
      }).catch(err => err)

      // 取消了关闭-阻止
      if (confirmResult === 'cancel') return
      // 确认关闭
      done()
    },
    // 获取-所有分类
    async getCateListFn () {
      const { data: res } = await getArtCateListAPI()
      if (res.code !== 0) return this.$message.error(res.message)
      this.cateList = res.data
    },
    // 获取-所有文章列表
    async getArticleListFn () {
      const { data: res } = await getArticleListAPI(this.q)
      if (res.code !== 0) return this.$notify.error(res.message)
      this.artList = res.data // 保存当前页面数据
      this.total = res.total // 保存总数
      console.log(this.artList)
    },
    // 选择封面点击事件->让文件选择窗口出现
    selCoverFn () {
      this.$refs.iptFileRef.click()
    },
    // 用户选择了封面文件按
    changeCoverFn (e) {
      // e.target 拿到触发标签
      // e.target.files
      const files = e.target.files
      console.log(files)
      if (files.length === 0) {
        // 用户没有选择图片，要把cover_img属性清空
        this.pubForm.cover_img = null
        this.$refs.imgRef.setAttribute('src', imgObj)
      } else {
        this.pubForm.cover_img = files[0]
        // 把图片文件，要显示到img标签里
        const url = URL.createObjectURL(files[0])
        console.log(url)
        this.$refs.imgRef.setAttribute('src', url)
      }
      // 让表单单独校验封面的值
      this.$refs.pubFormRef.validateField('cover_img')
    },
    // 表单(发布/草稿)->按钮点击事件
    pubArticleFn (str) {
      // str: '已发布' or '草稿'
      this.pubForm.state = str // 保存到同意表单对象上

      this.$refs.pubFormRef.validate(async valid => {
        if (valid) {
          console.log(this.pubForm)
          const fd = new FormData() // 准备一个表单数据对象容器 FormData类是HTML5新出的专门为了装文件内容和其他参数的容器
          // fd.append('参数名', )
          fd.append('title', this.pubForm.title)
          fd.append('cate_id', this.pubForm.cate_id)
          fd.append('content', this.pubForm.content)
          fd.append('cover_img', this.pubForm.cover_img)
          fd.append('state', this.pubForm.state)

          const { data: res } = await uploadArticleAPI(fd)
          if (res.code !== 0) return this.$notify.error('发布文章失败！')
          this.$notify.success('发布文章成功')
          // 关闭对话框
          this.pubDialogVisible = false
          // 刷新文章列表
          this.getArticleListFn()
        } else {
          return false
        }
      })
    },
    // 富文本编辑器内容改变触发此事件方法
    contentChange () {
      // 目标：如何让el-form校验，只校验content这个规则？
      this.$refs.pubFormRef.validateField('content')
    },
    // 新增文章->对话框关闭时->清空表单
    dialogCloseFn () {
      this.$refs.pubFormRef.resetFields()
      // 我们需要手动给封面标签img重新设置一个值，因为它没有收到v-model影响
      this.$refs.imgRef.setAttribute('src', imgObj)
    },
    // 分页->每页条数改变触发
    // 根据选择的页码/条数，影响q对象对应属性的值，再重新发送请求返回数据
    handleSizeChangeFn (newPageSize) {
      // sizes: 当前需要每页显示的条数
      // 因为Pagination的标签上已经加了 .sync，子组件内会双向绑定到右侧vue变量上(q对象里pagesize已经改变了)
      this.pagesize = newPageSize

      // 问题：先点击最后一个页码，切换到每页显示条数2->3，总数不多，分页只能分到2
      // 每页条数改变了，页码从3到2页改变了，2个事件都会触发
      // 偶发性的bug：有的时候自动回到第二页有数据有的时候没有
      // 知识点：2个网络请求一起发，谁先回来不一定
      // 原因：所以可能第2页3条数据回来有值铺设，紧接着第3页的3条数据回来了，空数值所以页面就是空的
      // 解决：当切换每页显示的条数，我们九八当前页码设置为1，而且标签里要设置
      this.q.pagenum = 1
      this.getArticleListFn()
    },
    // 当前页码改变触发
    handleCurrentChangeFn (newPageNum) {
      // 页码
      this.pagenum = newPageNum
      this.getArticleListFn()
    },
    // 筛选按钮->点击事件
    choseFn () {
      // 当有了筛选的条件，我想让页码回归1，每页的条数回归初始值
      this.q.pagenum = 1
      this.q.pagesize = 5

      this.getArticleListFn()
    },
    // 重置按钮->点击事件
    resetFn () {
      this.q.pagenum = 1
      this.q.pagesize = 5
      this.q.cate_id = ''
      this.q.state = ''
      this.getArticleListFn()
    },
    // 文章标题点击事件->为了查看详情
    async showDetailFn (artId) {
      const { data: res } = await getArtDetailAPI(artId)
      if (res.code !== 0) return this.$message.error(res.message)
      this.artDetail = res.data
      this.detailVisible = true
    },
    // 删除文章按钮事件
    async removeFn (artId) {
      const { data: res } = await delArticleAPI(artId)
      if (res.code !== 0) return this.$message.error(res.message)
      this.$notify.success(res.message)

      // 数组里只有保存当前页的数据，别的页需要传参q给后台获取覆盖
      // 1的原因：虽然你调用删除接口但是那是后端删除，前端数组里你没有代码去修改它
      if (this.artList.length === 1) {
        if (this.q.pagenum > 1) { // 保证pagenum最小值为1
          this.q.pagenum--
        }
      }
      // 直接携带当前q里有的参数，重新去后台获取一次最新的数据列表
      this.getArticleListFn()
    }
  }
}
</script>

<style lang="less" scoped>
// scoped属性作用：让style里的选择器，只能选中当前组件的标签(为了保证样式的独立性，不影响别的组件)
// scoped原理：webpack打包的时候，会给组件标签添加相同 data-v-hash值，然后会给所有选择器后面
// 加上[data-v-hash]值的属性选择器
.search-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  .btn-pub {
    margin-top: 5px;
  }
}
// 设置富文本编辑器的默认最小高度
// ::v-deep作用: 穿透选择, 正常style上加了scope的话, 会给.ql-editor[data-v-hash]属性, 只能选择当前页面标签或者组件的根标签
// 如果想要选择组件内的标签(那些标签没有data-v-hash值)所以正常选择选不中, 加了::v-deep空格前置的话, 选择器就会变成如下形式
// [data-v-hash] .ql-editor 这样就能选中组件内的标签的class类名了

// 原来： .ql-editor[data-v-hash值]  标签上既有class也要有属性才能选中设置样式
// 解决：Vue提供了一个::v-deep样式语法，设置后，可以把属性选择器被子弟哦那个添加到左侧
// 现在 [data-v-hash值] .ql-editor
::v-deep .ql-editor {
  min-height: 300px;
}

// 总结：scoped不会给组件内的标签添加data-v属性，所以你要用::v-deep 穿透选择组件内的标签设置样式

// 设置图片封面的宽高
.cover-img {
  width: 400px;
  height: 280px;
  object-fit: cover;
}
</style>

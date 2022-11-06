<template>
  <div>
    <!-- 预览文章分类 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix header-box">
        <span>文章分类</span>
        <el-button type="primary" size="mini" @click="addCateShowDialogBenFn">添加分类</el-button>
      </div>

    <!-- 分类数据表格 -->
    <el-table style="width: 100%" border stripe :data="cateList">
      <el-table-column type="index" label="序号" width="100"></el-table-column>
      <el-table-column prop="cate_name" label="分类名称"></el-table-column>
      <el-table-column prop="cate_alias" label="分类别名"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="updateCateBtnFn(scope.row)">修改</el-button>
          <el-button type="danger" size="mini" @click="removeCateBtnFn(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
<!-- 添加文章分类-对话框 -->
  <el-dialog
  title="提示"
  :visible.sync="dialogVisible"
  width="30%"
  @closed="onAddClosedFn"
>
<el-form :model="addForm" :rules="addRules" ref="addRef" label-width="80px">
  <el-form-item label="分类名称" prop="cate_name">
    <el-input v-model="addForm.cate_name" minlength="1" maxlength="10"></el-input>
  </el-form-item>
  <el-form-item label="分类别名" prop="cate_alias">
    <el-input v-model="addForm.cate_alias" minlength="1" maxlength="15"></el-input>
  </el-form-item>
</el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="confirm">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
// 如果用同一个按钮，想要做状态区分
// 1. 定义一个标记变量isEdit (true编辑，false新增),还要定义本次要编辑德数据唯一id值，editId
// 2. 再点击修改德时候,isEdit改为true，editId保存要修改德数据id
// 3. 点击新增按钮德时候，isEdit改为false，editId置空
// 4. 在点击保存按钮时(确定按钮时),就可用isEdit变量做区分了5
import { getArtCateListAPI, addArtCateAPI, updateArtCateAPI, delArtCateAPI } from '@/api'
export default {
  name: 'ArtCate',
  data () {
    return {
      cateList: [], // 分类
      dialogVisible: false,
      addForm: {
        cate_name: '',
        cate_alias: ''
      },
      addRules: {
        cate_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { pattern: /^\S{1,10}$/, message: '分类名必须是1-10位的非空字符', trigger: 'blur' }
        ],
        cate_alias: [
          { required: true, message: '请输入分类别名', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]{1,15}$/, message: '分类别名必须是1-15位的字母数字', trigger: 'blur' }
        ]
      },
      isEdit: false, // true为编辑状态，false新增状态
      editId: '' // 保存正在要编辑德数据id值
    }
  },
  created () {
    this.getArtCateFn()
  },
  methods: {
    // 获取文章分类
    async getArtCateFn () {
      const { data: res } = await getArtCateListAPI()
      if (res.code !== 0) return this.$message.error(res.message)
      console.log(res)
      this.cateList = res.data
    },
    addCateShowDialogBenFn () {
      this.isEdit = false // 变回新增状态
      this.editId = ''
      this.dialogVisible = true
    },
    // 添加分类
    confirm () {
      this.$refs.addRef.validate(async valid => {
        if (!valid) return this.$message.error('未通过校验')
        if (!this.isEdit) {
          const { data: res } = await addArtCateAPI(this.addForm)
          if (res.code !== 0) return this.$message.error(res.message)
          this.$message.success(res.message)
          this.dialogVisible = false
          // 重新请求一次文章列表，拿到最新数据 让表格更新
          // 生命周期德方法比如created,不会挂载到this身上，无法this.created
          this.getArtCateFn()
        } else {
          // 修改
          // this.addForm.id = this.editId 把要编辑德文章分类id添加到对象上
          const { data: res } = await updateArtCateAPI({ id: this.editId, ...this.addForm })
          if (res.code !== 0) return this.$message.error(res.message)
          this.$message.success(res.message)
          this.dialogVisible = false
          this.getArtCateFn()
        }
      })
    },
    onAddClosedFn () {
      this.$refs.addRef.resetFields()
    },
    // 修改分类按钮-点击事件(先做数据回显)
    updateCateBtnFn (obj) {
      this.isEdit = true
      this.editId = obj.id
      this.dialogVisible = true

      // 让el-dialog第一次挂载el-form时，先用addForm空字符串初始值绑定到内部，后续用作resetFields重置
      // 所以让真实DOM先创建并在内部绑定好“复制”初始值

      // 接着我们真实DOM更新后绑定好了，再给数据回显
      // 注意：给v-model对象赋值只是影响当前显示德值，不会影响到reset Fields复制德初始值
      this.$nextTick(() => {
        // 数据回显(回填)
        this.addForm.cate_name = obj.cate_name
        this.addForm.cate_alias = obj.cate_alias
      })
    },
    async removeCateBtnFn (obj) {
      const { data: res } = await delArtCateAPI(obj.id)
      if (res.code !== 0) return this.$message.error(res.message)
      this.$message.success(res.message)
      this.getArtCateFn()
    }
  }
}

// 小bug：(el-form和el-dialog和数据回显 同时用，有bug)
// 复现：第一次打开页面，先点击修改，再点击新增，输入框不是空值
// 原因：点击修改后，关闭对话框德时候，置空失效了
// 具体分析：resetFields有问题
// 线索：Dialog 的内容是懒渲染的，即在第一次被打开之前，传入的默认slot不会被渲染到DOM上，第二次后续只是做css隐藏和显示
// 线索：vue数据改变(先执行同步所有) 再去更新DOM(异步代码)

// 无问题：第一次打开页面，先点击新增按钮 -> dialog出现 -> el-form组件第一次挂载(关联的addForm对象的属性值为空字符串)
//        el-form组件内绑定了初始值，所以后续调用resetFields，它可以用到空字符串的初始值来重置
// 有问题：第一次打开页面，先点击修改按钮 -> 虽然dialog变量为true 但是同步代码把addForm对象里赋值了(默认值) -> DOM更新异步 ->
//       dialog出现 -> el-form组件第一次挂载(使用addForm内置做回显然后第一次el-form内绑定了初始值(有值)) -> 它就用绑定带值的做重置
</script>

<style lang="less" scoped>
.header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

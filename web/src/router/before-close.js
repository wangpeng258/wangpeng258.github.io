const beforeClose = {
  before_close_normal: (resolve) => {
    if(confirm('确定要关闭这一页吗')){
      resolve(true)
    }else{
      resolve(false)
    }
  }
}
export default beforeClose

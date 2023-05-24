const path = require('path')
const resolve = dir => {
  return path.join(__dirname, dir)
}
module.exports = {
  outputDir: '../docs',
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  // publicPath: process.env.NODE_ENV === 'production' ? 'https://cdn.jsdelivr.net/gh/wangpeng1478/web@master/docs/' : '/',
  // publicPath: process.env.NODE_ENV === 'production' ? 'https://web-1254176432.cos.ap-shanghai.myqcloud.com/docs/' : '/',
  devServer: {
    port: 8889, // 端口
    disableHostCheck: true, //跳过检查
    proxy: {
      '/ydypc': {
        target: 'http://localhost:8084/',
        changeOrigin: true,
        ws: true
      }
    }
  },
  chainWebpack: config => {
      config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
  },
  lintOnSave: false, // 取消 eslint 验证
  productionSourceMap: true // 打包时生成.map文件
}

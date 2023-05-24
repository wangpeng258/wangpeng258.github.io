<template>
  <div class="homePage">
    <iframe ref="bgIframe" :src="`https://www.jq22.com/js/a${num[Math.floor((Math.random()*num.length))]}.html`"></iframe>
    <div class="home-wrapper">
      <h2 class="doc-block__title">应用</h2>
      <van-cell-group inset>
        <van-cell title="二维码识别" to="qrcode" is-link />
        <van-cell title="录屏" to="recording" is-link />
        <van-cell title="画中画" label="" to="pictureInPicture" is-link />
        <van-cell title="获取图片颜色" label="" to="colorThief" is-link />
        <van-cell title="签名板" label="带笔锋的签名板" to="signature" is-link />
      </van-cell-group>
      <h2 class="doc-block__title">tensorflow</h2>
      <van-cell-group inset>
        <van-cell title="手部姿势检测" label="手掌检测器和基于手部骨架的手指跟踪模型。根据检测到的手预测 21 个 3D 手部关键点" to="tensorflowHand" is-link />
        <van-cell title="人脸特征点检测" label="预测 486 个 3D 人脸特征点，推断出人脸的近似面部几何图形" to="faceTrait" is-link />
        <van-cell title="人脸检测" label="使用包含自定义编码器的单次检测器架构 (Blazeface) 检测图像中的人脸。" to="faceDetection" is-link />
        <van-cell title="对象检测" label="定位和识别单个图像中的多个对象 (Coco SSD)" to="objectDetection" is-link />
        <van-cell title="图片分类" label="对 ImageNet 数据库中带标签的图像进行分类 (MobileNet)" to="imgClassify" is-link />

        <van-cell title="智能防挡弹幕" label="实现哔哩哔哩视频效果" to="barrageAI" is-link />
        <van-cell title="智能防挡弹幕" label="实现哔哩哔哩视频效果" to="barrageAI" is-link />
        <van-cell title="虚拟试妆" to="tryMakeup" is-link />
        <van-cell title="运动计数" label="" to="keep" is-link />
        <van-cell title="人脸对比" label="" to="faceContrast2" is-link />
        <van-cell title="面部贴图" label="" to="faceMesh" is-link />
        <van-cell title="面部3D模型" label="" to="faceMesh3d" is-link />
      </van-cell-group>
      <h2 class="doc-block__title">tracking</h2>
      <van-cell-group inset>
        <van-cell title="人脸检测" to="trackingFace" is-link />
        <van-cell title="颜色追踪" to="trackingColor" is-link />
        <van-cell title="特征检测" to="trackingTrait" is-link />
      </van-cell-group>
      <h2 class="doc-block__title"></h2>
    </div>

    <!-- <a class="github" href="https://github.com/wangpeng1478/web" target="_blank" title="Visit the open-source code on GitHub!">
        <svg viewBox="0 0 250 250" aria-hidden="true">
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
          <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" class="octo-arm"></path>
          <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
        </svg>
    </a> -->
  </div>
</template>

<script>

export default {

  data() {
    return {
      num:[1,3,5,7,8,11,12,13,14,15]
    };
  },
  mounted() {

  },
  beforeDestroy() {
    try {
      const bgIframe = this.$refs.bgIframe;
       //把iframe指向空白页面，这样可以释放大部分内存。
       bgIframe.src = 'about:blank';
       bgIframe.remove();
    } catch (error) {
      console.log(error);
    }
  },
  methods: {

  },
};
</script>
<!-- lang="less" scoped -->
<style lang="less" scoped>
.homePage {
  width: 100%;
  min-height: 100%;
  background-color: #000;
  &>iframe{
    position:fixed;
    top:0;
    left:0;
    width:100vw;
    height:100vh;
    display: block;
    border: none;
  }
  .home-wrapper{
    max-width:650px;
    margin: 0 auto;
    position: relative;
  }

  .github{
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    border: 0;
    width: 80px;
    height: 80px;
    text-decoration: none;
  }
  .github svg {
    transition: all 1s;
    fill: #222;
    color: #fff;
    width: 100%;
    height: 100%;
  }
  .github:hover svg {
    width:90px;
    height:90px;
  }
  .doc-block__title {
    margin: 0;
    padding: 32px 16px 16px;
    color: rgba(255, 255, 255,0.9);
    font-size: 16px;
    line-height: 16px;
    font-weight: bold;
  }

  .van-cell__label {
    word-wrap: break-word;
    word-break: normal;
    word-break: break-all;
  }
  .van-cell{
    background-color: transparent;
    color: rgba(255, 255, 255,0.8);
  }
  .van-cell__right-icon,
  .van-cell__label{
    color: rgba(255, 255, 255,0.4);
  }
  .van-cell::after{
    opacity: 0.2;
  }
  .van-cell-group{
    background-color: transparent;
    backdrop-filter: blur(10px);
  }
  .van-hairline--top-bottom::after, .van-hairline-unset--top-bottom::after {
    border-width:0
  }
}
</style>


// https://router.vuejs.org/zh/api/#routes
export default [
  {
    path: '/',
    name: '/',
    component: () => import('@/page/home'),
    meta: {
      title: '首页'
    },
    children: [],
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/page/home'),
    meta: {
      title: '首页'
    },
    children: [],
  },
  {
    path: '/qrcode',
    name: 'qrcode',
    component: () => import('@/page/qrcode'),
    meta: {
      title: '二维码识别'
    },
    children: [],
  },
  {
    path: '/recording',
    name: 'recording',
    component: () => import('@/page/recording'),
    meta: {
      title: '录屏'
    },
    children: [],
  },
  {
    path: '/pictureInPicture',
    name: 'pictureInPicture',
    component: () => import('@/page/pictureInPicture'),
    meta: {
      title: '画中画'
    },
    children: [],
  },
  {
    path: '/signature',
    name: 'signature',
    component: () => import('@/page/signature'),
    meta: {
      title: '签名板'
    },
    children: [],
  },
  {
    path: '/tensorflowHand',
    name: 'tensorflowHand',
    component: () => import('@/page/tensorflow/hand'),
    meta: {
      title: '手'
    },
    children: [],
  },
  {
    path: '/barrageAI',
    name: 'barrageAI',
    component: () => import('@/page/tensorflow/barrageAI'),
    meta: {
      title: '防挡弹幕'
    },
    children: [],
  },
  {
    path: '/ImageSelect',
    name: 'ImageSelect',
    component: () => import('@/page/tensorflow/imageSelect'),
    meta: {
      title: '图片选择题'
    },
    children: [],
  },
  {
    path: '/keep',
    name: 'keep',
    component: () => import('@/page/tensorflow/keep'),
    meta: {
      title: '运动计数'
    },
    children: [],
  },
  {
    path: '/faceDetection',
    name: 'faceDetection',
    component: () => import('@/page/tensorflow/faceDetection'),
    meta: {
      title: '人脸检测'
    },
    children: [],
  },
  {
    path: '/objectDetection',
    name: 'objectDetection',
    component: () => import('@/page/tensorflow/objectDetection'),
    meta: {
      title: '对象检测'
    },
    children: [],
  },
  {
    path: '/imgClassify',
    name: 'imgClassify',
    component: () => import('@/page/tensorflow/imgClassify'),
    meta: {
      title: '图片分类'
    },
    children: [],
  },
  {
    path: '/faceTrait',
    name: 'faceTrait',
    component: () => import('@/page/tensorflow/faceTrait'),
    meta: {
      title: '人脸特征点检测'
    },
    children: [],
  },
  {
    path: '/tryMakeup',
    name: 'tryMakeup',
    component: () => import('@/page/tensorflow/tryMakeup'),
    meta: {
      title: '虚拟试妆'
    },
    children: [],
  },
  {
    path: '/faceContrast',
    name: 'faceContrast',
    component: () => import('@/page/tensorflow/faceContrast'),
    meta: {
      title: '人脸对比'
    },
    children: [],
  },
  {
    path: '/faceContrast2',
    name: 'faceContrast2',
    component: () => import('@/page/tensorflow/faceContrast2'),
    meta: {
      title: '人脸对比'
    },
    children: [],
  },
  {
    path: '/faceMesh',
    name: 'faceMesh',
    component: () => import('@/page/tensorflow/faceMesh'),
    meta: {
      title: '面部贴图'
    },
    children: [],
  },
  {
    path: '/faceMesh3d',
    name: 'faceMesh3d',
    component: () => import('@/page/tensorflow/faceMesh3d'),
    meta: {
      title: '面部3D模型'
    },
    children: [],
  },
  {
    path: '/colorThief',
    name: 'colorThief',
    component: () => import('@/page/colorThief'),
    meta: {
      title: '图片颜色'
    },
    children: [],
  },
  {
    path: '/trackingFace',
    name: 'trackingFace',
    component: () => import('@/page/tracking/face.vue'),
    meta: {
      title: '人脸检测'
    },
    children: [],
  },
  {
    path: '/trackingColor',
    name: 'trackingColor',
    component: () => import('@/page/tracking/color.vue'),
    meta: {
      title: '颜色追踪'
    },
    children: [],
  },
  {
    path: '/trackingTrait',
    name: 'trackingTrait',
    component: () => import('@/page/tracking/trait.vue'),
    meta: {
      title: '特征检测'
    },
    children: [],
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/page/404'),
    meta: {
      title: '404'
    },
    children: [],
  }
]

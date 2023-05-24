import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import {Dialog,Toast} from 'vant'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {
  isObjEmpty
} from '@/libs/utils'

// https://router.vuejs.org/zh/
Vue.use(Router);


NProgress.configure({
	easing: 'ease',  // 动画方式，和css动画属性一样（默认：ease）
	speed: 500,  // 递增进度条的速度，单位ms（默认： 200）
	showSpinner: true, // 是否显示加载ico
	trickle: true,//是否自动递增
	trickleSpeed: 200, // 自动递增间隔
	minimum: 0.3, // 初始化时的最小百分比，0-1（默认：0.08）
	parent: 'body'//指定此选项以更改父容器（默认：body）
})

/**
 * 重写路由的push方法
 */
 const routerPush = Router.prototype.push
 Router.prototype.push = function push(location) {
   return routerPush.call(this, location).catch(error=> error)
 }




const router = new Router({
  routes,
	mode:'hash', //hash history
	strict: process.env.NODE_ENV !== 'production'
});

router.beforeEach((to, from, next) => {
    NProgress.start()
    const title = to.meta && to.meta.title;
    if (!isObjEmpty(title)) {
      document.title = title;
    }
    if(isObjEmpty(to.matched)){
      next('404');
    }else{
      next();
    }
})

router.afterEach(() => {
    Toast.clear();
    Dialog.close();
    window.scrollTo(0, 0);
    NProgress.done();
})

export default router
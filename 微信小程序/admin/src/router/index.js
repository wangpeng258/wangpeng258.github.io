import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'view-design'
import { setToken, getToken, canTurnTo } from '@/libs/util'
import config from '@/config'
import { dynamicRouterAdd } from '@/libs/router-util'
const { homeName } = config

Vue.use(Router)
    //获取原型对象上的push函数
const originalPush = Router.prototype.push
    //修改原型对象中的push方法
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}
const router = new Router({
    routes
    // mode: 'history'
})
const LOGIN_PAGE_NAME = 'login'

const turnTo = (to, access, next) => {
        if (canTurnTo(to.name, access, routes)) next() // 有权限，可访问
        else next({ replace: true, name: 'error_401' }) // 无权限，重定向到401页面
    }
    // 这里是防止用户手动刷新页面，整个app要重新加载,动态新增的路由，会消失，所以我们重新add一次
const dynamicRouter = dynamicRouterAdd()
if (dynamicRouter && dynamicRouter.length > 0) {
    for (let r in dynamicRouter) {
        router.options.routes.push(dynamicRouter[r])
    }
    router.addRoutes(dynamicRouter)
}
store.state.app.menuList = router.options.routes

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start()
    const token = getToken();
    if (!token && to.name !== LOGIN_PAGE_NAME) {
       setToken('')
       iView.Notice.error({
          title: `${'未登录'}`
       });
        // 未登录且要跳转的页面不是登录页
        next({
            name: LOGIN_PAGE_NAME // 跳转到登录页
        })
    } else if (!token && to.name === LOGIN_PAGE_NAME) {
        setToken(token)
        // 未登陆且要跳转的页面是登录页
        next() // 跳转
    } else if (token && to.name === LOGIN_PAGE_NAME) {
        setToken(token)
        // 已登录且要跳转的页面是登录页
        next({
            name: homeName // 跳转到homeName页
        })
    } else {
        setToken(token)
        if (store.state.user.hasGetInfo) {
            turnTo(to, store.state.user.access, next)
        } else {
            store.dispatch('getUserInfo').then(user => {
                // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
                turnTo(to, user.access, next)
            }).catch(() => {
                setToken('')
                next({
                    name: 'login'
                })
            })
        }
    }
})

router.afterEach(to => {
    iView.LoadingBar.finish()
    window.scrollTo(0, 0)
})

export default router
const env = `wx-ba457a`;
const appid = `wx4bd62086cc140847`;
const scope = `snsapi_userinfo`;
// https://wx-ba457a-1254176432.ap-shanghai.app.tcloudbase.com
const baseURL = `/web`;
document.addEventListener('DOMContentLoaded', function() {
    var ua = window.navigator.userAgent;
    var isChrome = ua.indexOf("Chrome") === -1;
    var isSafari = ua.indexOf("Safari") === -1;
    var isWx = ua.toLowerCase().match(/MicroMessenger/i) != 'micromessenger';
    if (isChrome && isSafari && isWx) {
        setResult('使用谷歌浏览器（Chrome）\n获得更好的使用体验');
        return;
    };
    if (window['WeChatLogin']) {
        const app = cloudbase.init({
            env // 您的环境id
        });
        const auth = app.auth();
        const provider = auth.weixinAuthProvider({
            appid,
            scope
        });
        async function login() {
            // 1. 建议登录前先判断当前是否已经登录
            const loginState = await auth.getLoginState();
            loginState && (initVue(loginState.user, app));
            if (isObjEmpty(loginState)) {
                provider.getRedirectResult().then((loginState) => {
                    if (!isObjEmpty(loginState)) {
                        initVue(loginState.user, app);
                    } else {
                        // 未登录，唤起微信登录
                        if (isWeiXinClient()) {
                            provider.signInWithRedirect();
                        } else {
                            setResult('请使用微信浏览器打开');
                        }
                    }
                }).catch((err) => {
                    setResult(`微信登录失败[${err}]`);
                });
            }
        };
        login();
        if (window['WxFunction']){
            isWeiXinClient()&&wxConfig(); //微信状态下获取微信配置
        };
        function wxConfig() {
            Vue.http.get(`${baseURL}/config`, {
                params: {
                    url: location.href.split('#')[0]
                }
            }).then((getConfig) => {
                const res = getConfig.body || {};
                if (res.status === 200) {
                    const info = res.data || {};
                    //文档https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#7
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有 api 的返回值会在客户端 alert 出来，若要查看传入的参数，可以在 pc 端打开，参数信息会通过 log 打出，仅在 pc 端时才会打印。
                        appId: info.appId, // 必填，公众号的唯一标识
                        timestamp: info.timestamp, // 必填，生成签名的时间戳
                        nonceStr: info.nonceStr, // 必填，生成签名的随机串
                        signature: info.signature, // 必填，签名
                        jsApiList: [
                                'getLocation',
                                'openLocation',
                                'scanQRCode',
                                'chooseImage',
                                'previewImage',
                                'getLocalImgData',
                                'startRecord',
                                'stopRecord',
                                'onVoiceRecordEnd',
                                'playVoice',
                                'pauseVoice',
                                'stopVoice',
                                'onVoicePlayEnd',
                                'uploadVoice',
                                'downloadVoice',
                                'translateVoice',
                                'hideMenuItems',
                                'hideAllNonBaseMenuItem',
                                'closeWindow',
                            ] // 必填，需要使用的 JS 接口列表
                    });
                    wx.ready(function(e) {
                        console.log('wx.ready');
                        wx.hideAllNonBaseMenuItem();
                        wx.hideMenuItems({
                            menuList: [
                                "menuItem:delete",
                                "menuItem:editTag"
                            ]
                        });
                        wxReady(e);
                    });
                    wx.error(function(res) {
                        console.log('wx.error', res);
                    });
                };
            })

        };

    };
});




/**
 * 操作cookie
 */
 const CookieOper = {
    /**
     * 获取cookie值
     * @param  {String} sKey cookie名称
     * @return {String}      cookie值
     */
    getItem: function(sKey) {
        if (!sKey) { return null; }
        return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
    },
    /**
     * 设置cookie值
     * @param {String} sKey    cookie名称
     * @param {String} sValue  cookie值
     * @param {Number|String|Date} vEnd    保留时间
     * @param {String} sPath   路径
     * @param {String} sDomain 域
     * @param {Boolean} bSecure 是否开启安全协议
     */
    setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = '';
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
                    break;
                case String:
                    sExpires = '; expires=' + vEnd;
                    break;
                case Date:
                    sExpires = '; expires=' + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
        return true;
    },
    /**
     * 删除cookie
     * @param  {String} sKey    cookie名称
     * @param  {String} sPath   路径
     * @param  {String} sDomain 域
     */
    removeItem: function(sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '');
        return true;
    },
    /**
     * 是否拥有对应名称的cookie
     * @param  {String}  sKey cookie名称
     * @return {Boolean}      是否拥有cookie
     */
    hasItem: function(sKey) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
    },
    /**
     * 获取所有cookie名称
     * @return {Array} 名称集合
     */
    keys: function() {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
};


//初始化Vue
function initVue(user, cloudbase) {
    if (!isObjEmpty(user)) {
        const vEnd = 0; //7天
        const sPath = '/web'; //路径
        !isObjEmpty(user.avatarUrl) && (CookieOper.setItem('avatarUrl', user.avatarUrl,vEnd,sPath));
        !isObjEmpty(user.nickName) && (CookieOper.setItem('nickName', user.nickName,vEnd,sPath));
        !isObjEmpty(user.openid) && (CookieOper.setItem('openid', user.openid,vEnd,sPath));
        !isObjEmpty(user.uid) && (CookieOper.setItem('uid', user.uid,vEnd,sPath));
        !isObjEmpty(user.loginType) && (CookieOper.setItem('loginType', user.loginType,vEnd,sPath));
        const app = document.querySelector("#app");
        if (!isObjEmpty(app) && !isObjEmpty(app.__vue__) && !isObjEmpty(app.__vue__.init)) {
            app.__vue__.init(user, cloudbase);
        } else {
            console.error("初始化Vue_init失败");
        }
    } else {
        setResult(`获取用户失败[${err}]`);
    }
};
//微信SDK完成
function wxReady(e) {
    const app = document.querySelector("#app");
    if (!isObjEmpty(app) && !isObjEmpty(app.__vue__) && !isObjEmpty(app.__vue__.wxReady)) {
        app.__vue__.wxReady(e);
    }
};

// 设置结果
function setResult(description) {
    document.body.innerHTML = `
        <div class="van-empty">
            <div class="van-empty__image" style="text-align: center;line-height: 160px;">
                <i style="color: #fa5151;font-size: 70px;" class="van-icon van-icon-warning-o"></i>
            </div>
            <p class="van-empty__description">${description}</p>
            <div class="van-empty__bottom">
                <button style="min-width: 110px;" onclick="location.href='/web'" class="bottom-button van-button van-button--default van-button--normal van-button--round">
                  <div class="van-button__content"><span class="van-button__text">重新加载</span></div>
                </button>
            </div>
        </div>
    `;
};
/**
 * @ 获取地址栏参数
 */
function getQuery() {
    var url = location.search;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1),
            strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(decodeURIComponent(strs[i].split("=")[1]));
        }
    };
    return theRequest
};

/**
 * 判断是否是微信浏览器
 */
function isWeiXinClient() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
    } else {
        return false;
    }
};

/**
 * 判断数据是否为空
 * @param {*} obj
 * @returns
 */
function isObjEmpty(obj) {
    return (
        obj === undefined ||
        obj === "undefined" ||
        obj == null ||
        obj === "" ||
        obj.length === 0 ||
        (typeof obj === "object" && Object.keys(obj).length === 0)
    );
};

/**
 * @ 日期格式化
 * @param {String} fmt   YYYY-mm-dd HH:MM:SS
 * @date {String||Date} date
 */

function dateFormat(fmt, date = new Date()) {
    if (typeof date === "string") {
        date = new Date(date.replace(/-/g, "/"))
    }
    var ret;
    var opt = {
        "Y+": date.getFullYear().toString(), // 年
        "m+": (date.getMonth() + 1).toString(), // 月
        "d+": date.getDate().toString(), // 日
        "H+": date.getHours().toString(), // 时
        "M+": date.getMinutes().toString(), // 分
        "S+": date.getSeconds().toString() // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (var k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
};


// 连续点击 点击次数大于1使用
class ContinuityClick {
    constructor(options = {}) {
        // 参数
        this._options = options  // 包含 clickCount  需要点击的次数 clickCount为1时必须使用todoFunc回调方法
        this.clickCount = options.clickCount || 2
        this.todoFunc = options.todoFunc || function () {}  // 点击次数>=2的回调方法
        this.singleFunc = options.singleFunc || function() {}  // 单击1次的回调方法
        this.milliseconds = options.milliseconds || 300

        this.lastTime = 0
        this.count = 0
        this.timer = null
    }
    // 返回点击次数 包含点击次数为1时的使用方式  多次以上兼容为1时的用法
    click(e) {
        let currentTime = new Date().getTime()
        this.count = (currentTime - this.lastTime) < this.milliseconds ? this.count + 1 : 1
        this.lastTime = new Date().getTime()
        if (this.count == this.clickCount) {
            if (typeof(this.todoFunc) == 'function') {
                this.todoFunc(e);
            }
        } else {
            if (typeof(this.singleFunc) == 'function') {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    if (this.count == 1) {
                        this.singleFunc(e)
                    }
                }, 250);
            }
        }
    }
};

//使用方式
/* import ContinuityClick from './ContinuityClick'

template
    <button @click="clickBtn()">双击</button>

script
    export default {
        data() {
            continuityClickObj: null
        },
        create() {
            this.continuityClickObj = new ContinuityClick({
                clickCount: 2,
                todoFunc: this.doubleClickEvent,
                singleFunc: this.dingleClicEvent
            })
        },
        methods: {
            clickBtn() {
                this.continuityClickObj.click()
            },
            // 双击两次就会触发该方法
            doubleClickEvent() {
                // todo
            },
            // 单击按钮时触发该方法
            dingleClicEvent() {
                // todo
            }
        }
    } */
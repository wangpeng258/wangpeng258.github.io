const appid = `wx4bd62086cc140847`;
const scope = `snsapi_userinfo`; //snsapi_base openid      //snsapi_userinfo 基本信息
const baseURL = `http://101.34.52.7`;
document.addEventListener('DOMContentLoaded', function () {
    var ua = window.navigator.userAgent;
    var isChrome = ua.indexOf("Chrome") === -1;
    var isSafari = ua.indexOf("Safari") === -1;
    var isWx = ua.toLowerCase().match(/MicroMessenger/i) != 'micromessenger';
    if (isChrome && isSafari && isWx) {
        setResult('使用谷歌浏览器（Chrome）\n获得更好的使用体验');
        return;
    };
});

function goWx() {
    var redirectUrl = encodeURIComponent(currentLink());
    var wxUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + redirectUrl + '&response_type=code&scope=' + scope + '&state=1&connect_redirect=1#wechat_redirect';
    window.location.replace(wxUrl)
};

function getUser() {
    return new Promise((resolve, reject) => {
        var isWeixin = isWeiXinClient();
        var code = getQuery().code;
        var user = localStorage.getItem('user');
        if (isWeixin) {
            if (isObjEmpty(user)) {
                if (!isObjEmpty(code)) {
                    Vue.http.post(`${baseURL}/wx/api/get/user`, { code }, {
                        emulateJSON: true
                    }).then((xml) => {
                        var res = xml.body;
                        if (res.status === 200) {
                            localStorage.setItem('user', JSON.stringify(res.data));
                            resolve(res.data);
                        } else {
                            alert(res.errmsg || '获取用户信息失败，请稍后再试！')
                            goWx();
                            resolve({})
                        }
                    }).catch(err => {
                        console.error(err);
                        alert('获取用户信息失败，请稍后再试！')
                        goWx();
                        resolve({})
                    })
                } else {
                    goWx();
                    resolve({})
                }
            } else {
                resolve(JSON.parse(user));
            }
        } else {
            resolve({})
        }
    })
};

function wxConfig() {
    return new Promise((resolve, reject) => {
        const isWeixin = isWeiXinClient();
        if (isWeixin) {
            Vue.http.get(`${baseURL}/wx/api/config`, {
                params: {
                    url: location.href.split('#')[0]
                }
            }).then((getConfig) => {
                const res = getConfig.body || {};
                if (res.status === 200 && res.data) {
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
                    wx.ready((e) => {
                        console.log('wx.ready');
                        resolve(e);
                    });
                    wx.error((res) => {
                        console.error('wx.error', res);
                        resolve(res);
                    });
                };
            }).catch(err => {
                console.error('wx.catch', err);
                resolve(err)
            })
        } else {
            resolve('no wx');
        }
    })
};




// 特殊字符转义
function currentLink() {
    var object = getQuery();
    delete object.state;
    delete object.code;
    var search = urlEncode(object);
    if (search) {
        return window.location.origin + window.location.pathname + '?' + search
    } else {
        return window.location.origin + window.location.pathname
    }
};

// 特殊字符转义
function filter(str) {
    str += ''; // 隐式转换
    str = str.replace(/%/g, '%25');
    str = str.replace(/\+/g, '%2B');
    str = str.replace(/ /g, '%20');
    str = str.replace(/\//g, '%2F');
    str = str.replace(/\?/g, '%3F');
    str = str.replace(/&/g, '%26');
    str = str.replace(/\=/g, '%3D');
    str = str.replace(/#/g, '%23');
    return str;
};

function urlEncode(paramObj) {
    var sdata = [];
    for (let attr in paramObj) {
        sdata.push(attr + '=' + filter(paramObj[attr]));
    }
    return sdata.join('&');
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
        this.todoFunc = options.todoFunc || function () { }  // 点击次数>=2的回调方法
        this.singleFunc = options.singleFunc || function () { }  // 单击1次的回调方法
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
            if (typeof (this.todoFunc) == 'function') {
                this.todoFunc(e);
            }
        } else {
            if (typeof (this.singleFunc) == 'function') {
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
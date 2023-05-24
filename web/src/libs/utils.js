
/**
* 判断数据是否为空
* @param {*} obj
* @returns
*/
const isObjEmpty = (obj) => {
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
 * 存储localStorage
 */
const setStore = (name, content) => {
	if (!name) return;
	if (typeof content !== 'string') {
		content = JSON.stringify(content);
	}
	window.localStorage.setItem(name, content);
}
/**
 * 获取localStorage
 */
const getStore = (name) => {
	if (!name) return;
	return window.localStorage.getItem(name);
}

/**
 * 删除localStorage
 */

const removeStore = (name) => {
	if (!name) return;
	window.localStorage.removeItem(name);
}

const isPhone = () => {
	return (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))
}


/**
 * 判断是否是微信浏览器
 */
 const isWeiXinClient = ()=>{
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否安卓移动设备访问
 */
 const isAndroidMobileDevice = ()=>{
    return (/android/i.test(navigator.userAgent.toLowerCase()));
}



/**
 * @ 日期格式化
 * @param {String} fmt   YYYY-mm-dd HH:MM:SS
 * @date {String||Date} date
 */
 const dateFormat = (fmt, date=new Date)=>{
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
}

/**
 * @ 排序
 * @param {Object} property
 * @dome arr.sort(compare('date'))
 */
const compare = (property)=>{
    return function(a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value2 - value1;
    }
};

export {
	dateFormat,
	isWeiXinClient,
	isAndroidMobileDevice,
	isPhone,
	isObjEmpty,
	setStore,
	getStore,
	removeStore,
    compare
}


// var name = 'zhangsan'
// export { name }
// import { name } from "/.test.js"

// var name = 'zhangsan'
// export default name
// import name from "/.test.js"
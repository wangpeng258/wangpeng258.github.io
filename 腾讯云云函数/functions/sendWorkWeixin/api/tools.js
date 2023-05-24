


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
function dateFormat(fmt, date=new Date()) {
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
//str转json
function toJson(str){
    var obj = {};
    if(!isObjEmpty(str)){
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            obj[strs[i].split("=")[0]] = unescape(decodeURIComponent(strs[i].split("=")[1]));
        }
    };
    return obj
};
function resSuccess(data = null) {
    return {
        code: 200,
        message:'ok',
        data
    }
};
function resError(message = '错误', data = null) {
    return {
        code: -1,
        data,
        message
    }
};

module.exports = {
    isObjEmpty,
    dateFormat,
    toJson,
    resSuccess,
    resError
};
const sha1 = require("sha1");
const tcb = require('tcb-admin-node');
const {
    isObjEmpty,
    resSuccess,
    resError
} = require('./tools');
const {
    appId,
    env
} = require('./config');

module.exports = async function (event) {
    tcb.init({
        env
    });
    const db = tcb.database();
    const { url } = event.queryStringParameters || {};
    if(isObjEmpty(url)){
        return resError('url不能为空');
    };
    let ticket = null;
    const {data} = await db.collection('token').where({ appid:appId }).get();
    if(!isObjEmpty(data) && !isObjEmpty(data[0]) && !isObjEmpty(data[0].ticket)){
        ticket = data[0].ticket;
    }else{
        return resError('获取ticket失败');
    }
    const timestamp = Math.round(new Date().getTime() / 1000);// 必填，生成签名的时间戳
    const nonceStr = Math.random().toString(16).substring(2);// 必填，生成签名的随机串
    const string1 = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    const signature = sha1(string1);// 必填，签名
    return resSuccess({
        appId,
        timestamp,
        nonceStr,
        signature,
    })
}
const cloud = require('qq-server-sdk');
const appid = `ww79410a01fd009c66`;
const httprequest = require('./httprequest'); //请求
const {
    isObjEmpty,
    resSuccess,
    resError
} = require('./tools');
cloud.init({
    //env: cloud.DYNAMIC_CURRENT_ENV
    env: `wx-ba457a`
});
// decodeURIComponent解码
// https://developer.work.weixin.qq.com/document/path/90236#文件消息
// https://developer.work.weixin.qq.com/document/path/90236#文本卡片消息

module.exports = async (event) => {
    console.log('[event]',event);
    if (isObjEmpty(event)) {
        return resError(`send参数错误[0]`, event);
    };
    const db = cloud.database();
    const getAccessToken = await db.collection('token').where({ appid }).get();
    if (isObjEmpty(getAccessToken) || isObjEmpty(getAccessToken.data) || isObjEmpty(getAccessToken.data[0].access_token)) {
        return resError(`access_token获取失败`, getAccessToken);
    };
    const access_token = getAccessToken.data[0].access_token;
    var body = {
        "touser": "@all",
        "agentid": 1000002,
        "enable_duplicate_check": event.enable_duplicate_check || 0, //表示是否开启重复消息检查，0表示否，1表示是，默认0
        "duplicate_check_interval": event.duplicate_check_interval || 3600 //表示是否重复消息检查的时间间隔，默认1800s，最大不超过4小时
    };

    if (event.msgtype === "textcard" && !isObjEmpty(event.title) && !isObjEmpty(event.description) && !isObjEmpty(event.url)) {
        // 文本卡片消息
        body.msgtype = "textcard";
        body.textcard = {
            title: event.title,
            description: event.description,
            url:decodeURIComponent(event.url),
        };
        if (!isObjEmpty(event.btntxt)) {
            body.textcard.btntxt = event.btntxt;
        };
    } else if ((event.msgtype == "text" || isObjEmpty(event.msgtype)) && !isObjEmpty(event.content)) {
        //文本消息
        body.msgtype = "text";
        body.text = {content:event.content };
    } else {
        return resError(`send参数错误[1]`, event);
    };
    // console.log('[body]',body);
    const sendMsg = await httprequest({
        method: "POST",
        url: `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`,
        body
    });
    if(!isObjEmpty(sendMsg)&&sendMsg.errcode===0){
        return resSuccess(sendMsg)
    };
    return resError(`消息发送失败`,{
        sendMsg,
        body
    })
}
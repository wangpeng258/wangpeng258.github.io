'use strict';
const Send = require('./api/send'); //发送微信消息
const MyUrl = require("url");
const {
    isObjEmpty,
    toJson,
    resSuccess,
    resError
} = require('./api/tools');
// 文本消息
const TestText = {
      content:`测试内容\n<a href="https://www.baidu.com">百度</a>`,
};
// 文本卡片消息
const TestTextcard = {
      title:`测试标题`,
      description:`
         <div class="gray">灰色</div>
         <div class="highlight">高亮</div>
         <div class="normal">默认黑色</div>
      `,
      url:`https://www.baidu.com`
};
exports.main = async (event, context) => {
    let receiveData = {}; //接收数据
    if (event.httpMethod === "GET") {
        receiveData = event.queryStringParameters;
    }else if(event.httpMethod === "POST" && event.headers['content-type'].includes('application/x-www-form-urlencoded')){
        receiveData = MyUrl.parse(`http://t.tt?${event.body}`,true).query;
    } else {
        return resError(`请求失败,使用POST请求时，请使用['content-type':'application/x-www-form-urlencoded']`, event.headers['content-type'])
    };
    // console.log('[receiveData]',receiveData);
    const { content, title, description, url, btntxt, enable_duplicate_check, duplicate_check_interval } = receiveData;
    try {
        //enable_duplicate_check   表示是否开启重复消息检查，0表示否，1表示是，默认0
        //duplicate_check_interval 表示是否重复消息检查的时间间隔，默认1800s，最大不超过4小时
        let sendData = {};
        if (enable_duplicate_check == 0 || enable_duplicate_check == 1) {
            sendData['enable_duplicate_check'] = enable_duplicate_check;
        };
        if (isObjEmpty(enable_duplicate_check)) {
            sendData['enable_duplicate_check'] = 0;
        };
        if (isObjEmpty(duplicate_check_interval)) {
            sendData['duplicate_check_interval'] = 1800;
        } else {
            const toNumberTime = parseInt(duplicate_check_interval);
            sendData['duplicate_check_interval'] = isNaN(toNumberTime) ? 1800 : toNumberTime > 4 * 60 * 60 ? 1800 : toNumberTime;
        }
        if (!isObjEmpty(content)) {
            // 文本消息
            // @content      消息内容，最长不超过2048个字节

            sendData['msgtype'] = "text";
            sendData['content'] = content.replace(/\\n/ig, '\n');
        } else if (!isObjEmpty(title) && !isObjEmpty(description) && !isObjEmpty(url)) {
            // 文本卡片消息
            // @title        标题，不超过128个字节，超过会自动截断
            // @description  描述，不超过512个字节，超过会自动截断
            // @url          点击后跳转的链接。最长2048字节，请确保包含了协议头(http/https)
            // @btntxt       按钮文字。 默认为“详情”， 不超过4个文字，超过自动截断。

            // @description 内容说明 支持<br />
            // <div class="gray">灰色</div>
            // <div class="highlight">高亮</div>
            // <div class="normal">默认黑色</div>
            sendData['msgtype'] = "textcard";
            sendData['title'] = title;
            sendData['description'] = description.includes(`</div>`) ? description : `<div class="normal">${description}</div>`;
            sendData['url'] = url;
            if (!isObjEmpty(btntxt)) {
                sendData['btntxt'] = btntxt;
            };
        } else {
            return resError(`参数错误`, receiveData);
        }
        return Send(sendData);
    } catch (err) {
        console.log(err)
        return resError(`请求失败`, err)
    };

};

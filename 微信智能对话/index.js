const axios = require("axios");
const fs = require('fs');
const FormData = require('form-data');

//监听机器人
const wxChatId = `ryDIjwetmblo6wFF8izp2GjO7xgXri`;

// 嵌入到第三方系统 - 匿名无鉴权
// https://openai.weixin.qq.com/webapp/ryDIjwetmblo6wFF8izp2GjO7xgXri?robotName=user1

// 嵌入到第三方系统 - 有鉴权
// https://openai.weixin.qq.com/webapp/auth/ryDIjwetmblo6wFF8izp2GjO7xgXri?openid=user001&nickname=iphone&avatar=&robotName=user1

// http://www.axios-js.com/  文档
// https://support.apple.com/zh-cn/guide/shortcuts/welcome/ios   快捷指令

//获取token
async function getToken() {
    const { request } = await axios.get(`https://openai.weixin.qq.com/webapp/auth/isTT1WBTVq3ArtesyqJoIFsSDAdgW7?openid=001&nickname=iphone&avatar=&robotName=test`)
    if (request && request.path) {
        var token = '';
        var queryObj = request.path.split("&");
        for (let index = 0; index < queryObj.length; index++) {
            const elObj = queryObj[index].split("=");
            if (elObj[0] == 'token') {
                token = decodeURIComponent(elObj[1]);
            }
        }
        return token
    };
};

// 发送消息
// @ query = 你好  [文本内容]
// @ query = JSON.stringify({image:{url:"地址"}})  [图片]
// @ query = JSON.stringify({video:{url:"地址"}})  [视频]

async function SendMessage(query = '') {
    const { data, status, statusText, headers, config } = await axios({
        method: 'post',
        url: `https://openai.weixin.qq.com/weixinh5/webapp/${wxChatId}/msg`,
        params: {
            s: new Date().getTime(),
        },
        data: JSON.stringify({
            query
        }),
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'x-client-token': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c2VyMDAxIiwic2lnbmV0aW1lIjoxNjU2MDU4MTcxOTQ4LCJ1aW5mbyI6eyJvcGVuaWQiOiJ1c2VyMDAxIiwibmlja25hbWUiOiJpcGhvbmUiLCJwcml2aWxlZ2UiOltdLCJhbm9ueW1vdXMiOjAsImhlYWRpbWd1cmwiOiJodHRwczovL3Jlcy53eC5xcS5jb20vbW1zcHJhaXdlYl9ub2RlL2Rpc3Qvc3RhdGljL21pbmlwcm9ncmFtcGFnZUltYWdlcy90YWxrL3JpZ2h0SGVhZGVyLnBuZyJ9LCJpYXQiOjE2NTYwNTgxNzEsImV4cCI6MTY4NzU5NDE3MX0.1AteEbo0RXQz7XZtITl9Yg6fKv7RjjKTkp0IwexQjMs`
        }
    });
    console.log(`#########[start]#########`);
    console.log('[status]', status);
    console.log('[statusText]', statusText);
    console.log('[data]', data);
    console.log(`#########[end]#########\n\n`);
};

SendMessage(`你好-${new Date().toLocaleString()}`);



//获取历史消息
async function getHistory(pageNo = 1, pageSize = 10) {
    const { data, status, statusText, headers, config } = await axios({
        method: 'get',
        url: `https://openai.weixin.qq.com/weixinh5/webapp/${wxChatId}/get/chat/history`,
        params: {
            pageNo,
            pageSize,
            s: new Date().getTime(),
        },
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'x-client-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ1c2VyMDAxIiwic2lnbmV0aW1lIjoxNjU2MDU4MTcxOTQ4LCJ1aW5mbyI6eyJvcGVuaWQiOiJ1c2VyMDAxIiwibmlja25hbWUiOiJpcGhvbmUiLCJwcml2aWxlZ2UiOltdLCJhbm9ueW1vdXMiOjAsImhlYWRpbWd1cmwiOiJodHRwczovL3Jlcy53eC5xcS5jb20vbW1zcHJhaXdlYl9ub2RlL2Rpc3Qvc3RhdGljL21pbmlwcm9ncmFtcGFnZUltYWdlcy90YWxrL3JpZ2h0SGVhZGVyLnBuZyJ9LCJpYXQiOjE2NTYwNTgxNzEsImV4cCI6MTY4NzU5NDE3MX0.1AteEbo0RXQz7XZtITl9Yg6fKv7RjjKTkp0IwexQjMs'
        }
    });
    console.log(`#########[start]#########`);
    console.log('[status]', status);
    console.log('[statusText]', statusText);
    // console.log('[data]', data);
    var array = data.list || [];
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        console.log((element.content.answer || element.content.msg) + '\n');
    }
    console.log(`#########[end]#########\n\n`);
};
// getHistory();

//上传文件
async function upload() {
    let formData = new FormData()
    formData.append('media', fs.createReadStream(`./testViedo1.mp4`));
    let getHeaders = formData.getHeaders(); //获取headers
    formData.getLength(async(err, length) => {
        if (err) {
            console.log('[getLength] 失败', err);
            return err
        };
        //设置长度，important!!!
        getHeaders['content-length'] = length;
        const { data, status, statusText, headers, config } = await axios({
            method: 'post',
            url: `https://openai.weixin.qq.com/weixinh5/webapp/${wxChatId}/cos/upload`,
            params: {
                s: new Date().getTime(),
            },
            data: formData,
            headers: getHeaders
        });
        console.log(`#########[start]#########`);
        console.log('[status]', status);
        console.log('[statusText]', statusText);
        console.log('[data]', data);
        console.log(`#########[end]#########\n\n`);
    })

};
// upload();

// async function main(event = {}) {
// };
// main();
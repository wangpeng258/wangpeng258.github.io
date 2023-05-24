// 云函数入口文件
const tcb = require('tcb-admin-node');
const request = require('request');
tcb.init({
    env: `wx-ba457a`
})
const AppList = [
    // {
    //     id: "3a573aaa5e8974100046e56767a7af36",
    //     name: "表盘壁纸",
    //     appid: "1110148552",
    //     secret: "qtEydYE3l1jzDjlI"
    // },
    // {
    //     id: "79a2c43f5e8a902d00561bec04a90102",
    //     name: "实时地震",
    //     appid: "1110030098",
    //     secret: "2M2ThJMnjTpfzsg0"
    // },
    // {
    //     id: "8960d4cd5e9ffd090005b27d4283db24",
    //     name: "ssr",
    //     appid: "1109701335",
    //     secret: "27Mz43eWZ5DpyWMT"
    // },
    // {
    //     id: "a9bfcffc5eaf8c600005fda07215c7dd",
    //     name: "句子铺",
    //     appid: "1109857160",
    //     secret: "CoGwbfwmGTw2ZZ1M"
    // },
    // {
    //     id: "982133855eb428b10041a4877cf56505",
    //     name: "逗比人生",
    //     appid: "1109775672",
    //     secret: "a74dhDIpiNcsEKmW"
    // },
    // {
    //     id: "5e847ab25eb546e9006715be07b1b367",
    //     name: "日韩杂志图片",
    //     appid: "1110194054",
    //     secret: "Mjx5K4i2sliDIgmT"
    // },
    // {
    //     id: "37e26adb5eb94d0f0084fd4a597b00c5",
    //     name: "一笔画",
    //     appid: "1109980641",
    //     secret: "HW47zQVeG1Doy9lx"
    // },
]
function getAccessToken(event) {
    return new Promise((resolve, reject) => {
        let appid = event.appid;
        let secret = event.secret;
        let option = {
            method: "GET", //POST
            url: `https://api.q.qq.com/api/getToken?grant_type=client_credential&appid=${appid}&secret=${secret}`,
            json: true
        }
        request(option, function (error, response, body) {
            if (body.errcode == 0 && body.errmsg == 'ok') {
                resolve(body)
            }
        });
    });
};

function getTicket(access_token) {
    return new Promise((resolve, reject) => {
        let option = {
            method: "GET", //POST
            url: `https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=${access_token}`,
            json: true
        }
        request(option, function (error, response, body) {
            if (body.errcode == 0 && body.errmsg == 'ok') {
                resolve(body.ticket)
            }
        });
    });
};

function getwxOfficeAccessToken() {
    return new Promise((resolve, reject) => {
        const corpid = `ww79410a01fd009c66`;
        // const corpsecret = `SD3ePWK9VlWQE4kMv2nIgkeJPP3FZJJcWR4-KdksMeE`; //通讯录同步
        const corpsecret = `RHh__qC7CWs4vYFKEji9mh8cqUzYcTxGXhc1bySy41c`; //王朋朋（测试）
        let option = {
            method: "GET", //POST
            url: `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`,
            json: true
        }
        request(option, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body)
            }
        });
    });
};

//前端英语单词本
function getwxWordeAccessToken() {
    return new Promise((resolve, reject) => {
        const appid = `wx4d1e9381cd3b5925`;
        const secret = `a302fba5257f760658a57d96390ae20a`;
        let option = {
            method: "GET", //POST
            url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
            json: true
        }
        request(option, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body)
            }
        });
    });
};

//测试公众号【测试号管理】 access_token
function getwxTestAccessToken() {
    return new Promise((resolve, reject) => {
        const appid = `wx4bd62086cc140847`;
        const secret = `d161bcccb3b65f08dc7f71ea81a30992`;
        let option = {
            method: "GET", //POST
            url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
            json: true
        }
        request(option, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body)
            }
        });
    });
};

//测试公众号【测试号管理】ticket
function getTestTicket(access_token) {
    return new Promise((resolve, reject) => {
        let option = {
            method: "GET", //POST
            url: `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`,
            json: true
        }
        request(option, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body.ticket)
            }
        });
    });
};



async function GetAccessTokenInit(id, name, appid, secret) {
    const db = tcb.database();
    try {
        let Token = await getAccessToken({ appid, secret });
        if (Token.errcode == "0") {
            let { access_token } = Token;
            return await db.collection("token").doc(id).update({
                name,
                update: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toLocaleString(),
                access_token
            });
        }
    } catch (err) {
        return {
            errmsg: `[${name}]GetAccessToken 失败`
        }
    }
};
exports.main = async (event, context) => {
    try {
        const db = tcb.database();
        //企业微信
        let wxofficeToken = await getwxOfficeAccessToken();
        if (wxofficeToken.access_token) {
            // const ticket = await getTicket(wxofficeToken.access_token);
            await db.collection("token").doc("4d5a19345ed9baa2003a2afc0040ac81").update({
                name: "企业微信",
                update: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toLocaleString(),
                // ticket,
                access_token: wxofficeToken.access_token
            });
        }
        //企业微信

        //前端英语单词本
        // let wxWordeToken = await getwxWordeAccessToken();
        // if (wxWordeToken.access_token) {
        //     const ticket = await getTicket(wxWordeToken.access_token);
        //     await db.collection("token").doc("e62469b25fbb182700450402258cc7a3").update({
        //         name: "前端英语单词本",
        //         update: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toLocaleString(),
        //         ticket,
        //         access_token: wxWordeToken.access_token
        //     });
        // }
        //前端英语单词本


        //测试公众号【测试号管理】
        let wxTestToken = await getwxTestAccessToken();
        if (wxTestToken.access_token) {
            const ticket = await getTestTicket(wxTestToken.access_token);
            console.log('[ticket]',ticket)
            return await db.collection("token").doc("b69f67c062946ef005228850578d7e68").update({
                name: "测试公众号测试号",
                update: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toLocaleString(),
                ticket,
                access_token: wxTestToken.access_token
            });
        }
        //测试公众号【测试号管理】


        // const GetAll = AppList.map(async e => {
        //     return await GetAccessTokenInit(e.id, e.name, e.appid, e.secret);
        // })
        // return Promise.all(GetAll);
    } catch (err) {
        console.log(err)
        return {
            status: -4,
            message: err,
        }
    }
}
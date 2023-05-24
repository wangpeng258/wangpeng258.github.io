// 云函数入口文件
const tcb = require('tcb-admin-node')
const request = require('request');
function httprequest(event) {
    return new Promise((resolve, reject) => {
        let option = {
            method: "GET", //POST
            json: true,
            headers: {
                "User-Agent": "LeanCloud-Swift-SDK/17.3.0",
                "Content-Type": "application/json;charset=UTF-8",
                "X-LC-Id": "NECACk3YmXdaG9BIfSEtiXzB-gzGzoHsz",
                "X-LC-Prod": "1",
                "X-LC-Sign": "f200485b467917a02ad4c4bb86c7a47a,1585897849935"
            },
        }

        if (event.type == "list") {
            //首页
            option.url = `https://api.pengranapp.com/1.1/classes/Album?className=Album&limit=${event.limit}&order=${event.order}&skip=${event.skip}&where={"type":{"$ne":1}}`;
        }

        if (event.type == "hot") {
            //热门搜索
            option.url = `https://api.pengranapp.com/1.1/classes/TrendingZh?className=TrendingZh&order=-clickTimes`;
        }


        if (event.type == "search") {
            // 搜索
            var keywords = event.keywords;
            var emojiReg = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi;
            option.url = `https://api.pengranapp.com/1.1/classes/Album?className=Album&order=-just_download&where={"keywords":{"$regex":"${encodeURIComponent(keywords.replace(emojiReg, "").replace(/\s*/g, ""))}"}}`;
        }

        //实时地震
        if (event.type == "dz_list") {
            // 最近一年内地震
            option.url = `http://www.ceic.ac.cn/ajax/search?page=${event.page}&&start=${event.date}&&end=${event.date2}&&jingdu1=&&jingdu2=&&weidu1=&&weidu2=&&height1=&&height2=&&zhenji1=${event.min}&&zhenji2=${event.max}`;
        }

        //ssr 工具
        if (event.type == "ssr_tool") {
            // 下载工具
            // option.method = "POST";
            option.headers = { 'x-hydrogen-client-id': '185bd6f1220bb168457a' }
            option.url = `https://185bd6f1220bb168457a.myminapp.com/hserve/v2.0/table/81801/record/?limit=40&offset=0&order_by=-created_at&where={}`;
        }
        //ssr
        if (event.type == "ssr_list") {
            // ssr
            // option.method = "POST";
            option.headers = { 'x-hydrogen-client-id': '185bd6f1220bb168457a' }
            option.url = `https://185bd6f1220bb168457a.myminapp.com/hserve/v2.0/table/88924/record/?limit=40&offset=0&order_by=-created_at&where={}`;
        }
        //ssr
        if (event.type == "ssr_appleid") {
            // ssr
            // option.method = "POST";
            option.headers = { 'x-hydrogen-client-id': '185bd6f1220bb168457a' }
            option.url = `https://bika.club/appleid.json`;
        }

        request(option, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body)
            }
        });
    });
};
function htmlEscape(text) {
    return text.replace(/[<>"&]/g, function (match, pos, originalText) {
        switch (match) {
            case "<": return "";
            case ">": return "";
            case "&": return ",";
            case "\"": return "";
        }
    });
}
// 云函数入口函数
exports.main = async (event, context) => {
    if (event.type == "list" || event.type == "search") {
        var results = await httprequest(event);
        var Arr = [];
        results.results.forEach(e => {
            e.title = htmlEscape(e.title)
            e.keywords = htmlEscape(e.keywords) || ""
            Arr.push(e);
        })
        return {
            results: Arr
        }
    };
    if (event.type == 'ssr_list') {
        //暂时
        return {
            objects: [
                {
                    title: "暂时失效"
                }
            ]
        }
    };
    if (event.type == "ssr_appleid") {
        return [
            {
                id: "x28k0v0v@icloud.com",
                pw: "Dd112211"
            }
        ]
    };
    if (event.type == "ssr_tool") {
        return {
            objects: [
                {
                    content: "https://bika.club",
                    cpm: "点击获取已解锁",
                    created_at: 1574748855,
                    created_by: 43404936,
                    id: "5ddcc2b7b0889932c711ddd5",
                    ip: "2020-4-20",
                    menu: "请认准SSR节点小程序",
                    read_perm: ["user:anonymous"],
                    image: {
                        path: "https://cloud-minapp-29551.cloud.ifanrusercontent.com/1iZUqNUe2WvQGMPv.jpg"
                    },
                    title: "IOS推进器",
                    updated_at: 1587997141,
                    write_perm: ["user:43404936"],
                    _id: "5ddcc066b088993a2e11e0e8",
                },
                {
                    content: "https://github.com/shadowsocksrr/shadowsocksr-android/releases/download/3.5.4/shadowsocksr-android-3.5.4.apk",
                    cpm: "点击获取已解锁",
                    created_at: 1574748855,
                    created_by: 43404936,
                    id: "5ddcc2b7b0889932c711ddd5",
                    ip: "2020-4-20",
                    menu: "请认准SSR节点小程序",
                    read_perm: ["user:anonymous"],
                    image: {
                        path: "https://cloud-minapp-29551.cloud.ifanrusercontent.com/1iZVE3EWJcmV8czz.png"
                    },
                    title: "安卓推进器",
                    updated_at: 1587997141,
                    write_perm: ["user:43404936"],
                    _id: "5ddcc2b7b0889932c711ddd5",
                }
            ]
        }
    };

    var results = await httprequest(event);
    return results
    // tcb.init({
    // 	env: tcb.getCurrentEnv()
    // })

    // const auth = tcb.auth();
    // const userInfo = await tcb.auth().getAuthContext(context);

    // return {
    // 	event,
    // 	openid: userInfo.openId,  //小程序openId
    // 	appid: userInfo.appId,    //小程序应用appId
    // 	uid: userInfo.uid         //云开发用户唯一ID
    // }
}
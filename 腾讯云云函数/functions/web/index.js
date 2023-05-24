'use strict';
const fs = require('fs')
const path = require('path')
const wxAuth = require('./method/wxAuth')
const wxConfig = require('./method/wxConfig')

const setLocation = require('./method/locationSet');
const getLocation = require('./method/locationGet');
const remLocation = require('./method/locationRem');
const sendMessage = require('./method/sendMessage');
const getDb = require('./method/db');

const {
    cdnUrl
} = require('./method/config');

const {
    resError,
    resSuccess,
    isObjEmpty,
    dateFormat,
    render
} = require('./method/tools');

exports.main = async(event, context) => {
    const { queryStringParameters, httpMethod, headers, body } = event || {};
    const IP = headers['x-forwarded-for']; //访问者IP
    const userAgent = headers['user-agent']; //访问者UA[设备信息]
    const cookie = headers['cookie']; //访问者cookie

    //首页页面
    if (event.path === "/" && httpMethod === "GET") {
        let html;
        if(userAgent.search(/MicroMessenger/i)===-1){
            html = fs.readFileSync(path.resolve(__dirname, './html/error.html'), {
                encoding: 'utf-8'
            });
            html = render(html, {
                title: '错误',
                errorMsg:'请使用微信浏览器打开',
                cdnUrl
            });
        }else{
            html = fs.readFileSync(path.resolve(__dirname, './html/index.html'), {
                encoding: 'utf-8'
            });
            html = render(html, {
                title: 'web',
                cdnUrl
            });
        };

        // 'Set-Cookie': 'cookie1=abc;'
        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: html
        }
    };
    //位置页面
    if ((event.path === "/location" && httpMethod === "GET") || event.path === "/location/" && httpMethod === "GET") {
        let html = fs.readFileSync(path.resolve(__dirname, './html/location.html'), {
            encoding: 'utf-8'
        });
        html = render(html, {
            title: 'location',
            cdnUrl
        });
        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: html
        }
    };
    //数据库页面
    if ((event.path === "/db" && httpMethod === "GET") || event.path === "/db/" && httpMethod === "GET") {
        let html;
        if(userAgent.search(/MicroMessenger/i)>=0){
            const tokens = [
                '17621683744'
            ];
            if(isObjEmpty(cookie) || (cookie.indexOf(`openid=oI9Uo6yKQKrfRYzqmaa68muor6BE`)===-1 && tokens.some(e=>cookie.indexOf(`token=${e}`)===-1))){
                html = fs.readFileSync(path.resolve(__dirname, './html/error.html'), {
                    encoding: 'utf-8'
                });
                html = render(html, {
                    title: '错误',
                    errorMsg:'抱歉！你没有权限访问此页面！',
                    enter:'true',
                    cdnUrl
                });
            }else{
                html = fs.readFileSync(path.resolve(__dirname, './html/db.html'), {
                    encoding: 'utf-8'
                });
                html = render(html, {
                    title: 'DB',
                    cdnUrl
                });
            };
        }else{
            html = fs.readFileSync(path.resolve(__dirname, './html/error.html'), {
                encoding: 'utf-8'
            });
            html = render(html, {
                title: '错误',
                errorMsg:'请使用微信浏览器打开',
                cdnUrl
            });
        };


        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            body: html
        }
    };
    //获取位置
    if (event.path === "/location/get") {
        if (isObjEmpty(queryStringParameters.time) || isObjEmpty(queryStringParameters.user)) {
            return resError(`参数错误(/location/get)`, queryStringParameters)
        };
        return await getLocation({
            user: queryStringParameters.user || 'all',
            time: queryStringParameters.time
        })
    };
    //设置位置
    if (event.path === "/location/set") {
        if (isObjEmpty(queryStringParameters.user) || isObjEmpty(queryStringParameters.lon) || isObjEmpty(queryStringParameters.lat)) {
            return resError(`参数错误(/location/set)`, queryStringParameters)
        };
        // 微信获取位置 设置 type: 'wgs84'时，type不用传;
        // IOS快捷指令不用传;
        // 高德地图经纬度获取坐标需要传 type: 'gd';
        return await setLocation({
            user: queryStringParameters.user || 'all',
            type: queryStringParameters.type || '',
            time: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).getTime(),
            // timeString: dateFormat(`YYYY-mm-dd HH:MM:SS`, new Date(new Date().getTime() + 8 * 60 * 60 * 1000)),
            lon: Number(queryStringParameters.lon),
            lat: Number(queryStringParameters.lat),
            note: queryStringParameters.note || '',
            sort:'location',
        })
    };
    // 删除位置
    if (event.path === "/location/rem") {
        return await remLocation(queryStringParameters, cookie)
    };
    //获取数据库
    if (event.path === "/get/db"||event.path === "/get/db/"){
        return await getDb(httpMethod,queryStringParameters, headers, body)
    }
    // 微信[使用 JS-SDK]
    if (event.path === "/config" && httpMethod === "GET") {
        return await wxConfig(event);
    };
    // 微信授权
    if (event.path === "/auth" && httpMethod === "GET") {
        return await wxAuth(event);
    };
    if (event.path.includes("/static/index.js")) {
        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
            body: fs.readFileSync(path.resolve(__dirname, './static/index.js'), {
                encoding: 'utf-8'
            })
        }
    };
    if (event.path.includes("/static/index.css")) {
        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: { 'Content-Type': 'text/css; charset=utf-8' },
            body: fs.readFileSync(path.resolve(__dirname, './static/index.css'), {
                encoding: 'utf-8'
            })
        }
    };
    // 发送模板消息
    if (event.path === "/message/send") {
        return await sendMessage(event)
    }
    return resError(`参数错误(003)`, Object.assign(queryStringParameters, { path: event.path, body }))
};
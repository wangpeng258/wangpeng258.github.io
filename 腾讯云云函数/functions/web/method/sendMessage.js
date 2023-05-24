//发送模板消息

const tcb = require('tcb-admin-node');
const axios = require("axios");
const {
    appId,
    env
} = require('./config');
const {
    isObjEmpty,
    resSuccess,
    resError
} = require('./tools');
//文档 https://mp.weixin.qq.com/debug/cgi-bin/readtmpl?t=tmplmsg/faq_tmpl
module.exports = async (event) => {
    const { httpMethod,headers, body } = event || {};
    try {
        if((httpMethod === "POST" && (isObjEmpty(headers['content-type']) || !headers['content-type'].includes('application/json'))) || httpMethod != "POST"){
            return resError(`请使用POST请求 ['content-type':'application/json']`,headers['content-type']);
        };
        //测试
        let receiveData = {
            touser:'oI9Uo6yKQKrfRYzqmaa68muor6BE', //自己
            template_id:"v7RI3tJ5AaVzK_3x-k8EYkMO_2Z9KL-00usGU9RMhu4", //模板ID
            data:{
                User:{value:"黄先生", color:"#173177"}
            }
        };
        if(!isObjEmpty(body)){
            receiveData = Object.assign(receiveData,JSON.parse(body||"{}"));
        }else{
            return resError(`参数不全[json]`);
        };
        if(isObjEmpty(receiveData.touser)||isObjEmpty(receiveData.template_id)||isObjEmpty(receiveData.data)){
            return resError(`参数不全[receiveData]`,receiveData);
        };
        tcb.init({
            env,
        });
        const db = tcb.database();
        let access_token = null;
        const {data} = await db.collection('token').where({ appid:appId }).get();
        if(!isObjEmpty(data) && !isObjEmpty(data[0]) && !isObjEmpty(data[0].access_token)){
            access_token = data[0].access_token;
        }else{
            return resError('获取access_token失败');
        };
        const sendMsg = await axios({
            method: 'post',
            url: `https://api.weixin.qq.com/cgi-bin/message/template/send`,
            params: {
                access_token,
                s: new Date().getTime(),
            },
            data:JSON.stringify(receiveData),
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            }
        });
        if(!isObjEmpty(sendMsg) && !isObjEmpty(sendMsg.data) && sendMsg.data.errcode===0){
            return resSuccess(sendMsg.data);
        }else{
            return resError('模板消息发送失败',sendMsg.data);
        }
    } catch (error) {
        console.log('[error]',error);
        return resError('[error]',event);
    }

}
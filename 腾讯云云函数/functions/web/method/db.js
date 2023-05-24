const tcb = require('tcb-admin-node');
const {
    env
} = require('./config');
const {
    resSuccess,
    resError,
    isObjEmpty
} = require('./tools');

/*
{
    "dbName":"checkSend",
    "pageIndex":1,
    "pageSize":10,
    "where":{},
    "vague":{
        "message":"四川"
    },
    "field":{
        "appid":false
    }
}
*/
module.exports = async (httpMethod,queryStringParameters, headers, body) => {
    try {
        var event = {};
        if(httpMethod=="GET"){
            event = queryStringParameters||{};
        }else if(httpMethod=="POST"){
            if(headers['content-type'].search(/application\/json/i)>=0){
                event = JSON.parse(body||"[]")||{};
            }else{
                return resError(`请使用[Content-Type:application/json]`)   //返回错误
            }
        }else{
            return resError(`[httpMethod]错误-${httpMethod}`)   //返回错误
        };
        if(!isObjEmpty(event.dbName) && !isObjEmpty(event.pageIndex) && !isObjEmpty(event.pageSize)){
            tcb.init({
                env: env
            });
            //云开发文档
            //https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/init/server.init.html

            //模糊查询
            // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/Database.RegExp.html

            const db = tcb.database();
            const dbName = event.dbName;
            const field = event.field||{}; //排除保留
            const where = event.where||{}; //查询条件
            let vague = event.vague||{}; //模糊查询
            Object.keys(vague).forEach(e=>{
                vague[e] = db.RegExp({
                    regexp: vague[e],
                    options: 'i',
                })
            });
            const pageIndex = +event.pageIndex;
            const pageSize = +event.pageSize;
            const countResult =  await db.collection(dbName).field(field).where(Object.assign(where,vague)).count(); //获取总数
            const total = countResult.total; //总数
            const totalPage = Math.ceil(total/pageSize); //总页数
            var hasMore = true; //是否还有数据
            if(pageIndex>=totalPage){
                hasMore = false;
            };
            if(total>0){
               const res =  await db.collection(dbName).field(field).where(Object.assign(where,vague)).skip((pageIndex-1)*pageSize).limit(pageSize).get();
                    res.pageIndex = pageIndex;
                    res.total = total;
                    res.totalPage = totalPage;
                    res.pageSize = pageSize;
                    res.hasMore = hasMore;
                    return resSuccess(res);
            }else{
                return resSuccess({
                    data:[],
                    pageIndex,
                    pageSize,
                    totalPage,
                    total,
                    hasMore
                })
            }
        }else{
            return resError(`参错错误`,event)
        }
    } catch (error) {
        console.log('locationSet',error);
        return resError('db失败',{
            httpMethod,queryStringParameters, headers, body
        })
    }
}

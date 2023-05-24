const tcb = require('tcb-admin-node');
const {
    env,
    dbName
} = require('./config');
const {
    resSuccess,
    resError
} = require('./tools');
const MAX_LIMIT = 50;
module.exports = async (event) => {
    tcb.init({
        env,
    })
    const db = tcb.database();
    const _ = db.command;
    const today = new Date(event.time).toLocaleDateString();
    const countResult = await db.collection(dbName).where({
        sort:'location',
        user: event.user,
        time: _.and(_.gte(new Date(`${today} 00:00:00`).getTime()), _.lte(new Date(`${today} 23:59:59`).getTime()))
    }).count();
    const total = countResult.total;
    //计算需分几次取
    let batchTimes = Math.ceil(total / MAX_LIMIT);
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection(dbName).where({
            sort:'location',
            user: event.user,
            time: _.and(_.gte(new Date(`${today} 00:00:00`).getTime()), _.lte(new Date(`${today} 23:59:59`).getTime()))
        }).field({
            //排除
            sort:false
        }).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
    }
    try {
        if(total>0){
            const getData = (await Promise.all(tasks)).reduce((acc, cur) => {
                return {
                    data: acc.data.concat(cur.data),
                    errMsg: acc.errMsg,
                }
            })
            return resSuccess(getData.data || [])
        }else{
            return resSuccess([])
        }
    } catch (error) {
        console.error('locationGet',error);
        return resError('数据获取失败',event)
    }
}
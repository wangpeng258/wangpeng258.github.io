const tcb = require('tcb-admin-node');
const {
    env,
    dbName
} = require('./config');
const {
    resSuccess,
    resError,
    isObjEmpty
} = require('./tools');
module.exports = async (event,cookie) => {
    // @删除当前数据         type=1 id
    // @删除当前日期数据     type=2 user time
    // @删除当前用户名数据   type=3 user
    // @清空数据            type=4 user
    console.log('[cookie]',cookie);
    if(isObjEmpty(cookie) || cookie.indexOf(`openid=oI9Uo6yKQKrfRYzqmaa68muor6BE`)===-1 || cookie.indexOf(`uid=4731f66afd70415bb2ef950ea6d61442`)=== -1){
        return resError('没有权限删除')
    };
    const {type,id,user,time} = event||{};
    tcb.init({
        env
    });
    const db = tcb.database();
    const _ = db.command;
    try {
        if(type==4){
            return resSuccess(await db.collection(dbName).where({
                sort:'location',
                time: _.gt(0)
            }).remove());
        }else if(type==3&&!isObjEmpty(user)){
            return resSuccess(await db.collection(dbName).where({
                sort:'location',
                user
            }).remove());
        }else if(type==2&&!isObjEmpty(user)&&!isObjEmpty(time)){
            const today = new Date(time).toLocaleDateString();
            return resSuccess(await db.collection(dbName).where({
                sort:'location',
                user:event.user,
                time: _.and(_.gte(new Date(`${today} 00:00:00`).getTime()), _.lte(new Date(`${today} 23:59:59`).getTime()))
            }).remove());
        }else if((type==1 || isObjEmpty(type)) && !isObjEmpty(id)){
            return resSuccess(await db.collection(dbName).doc(id).remove());
        }else{
            return resError('参数不全2[locationRem]',event)
        }
    } catch (error) {
        console.log('locationRem',error);
        return resError('删除失败',event)
    }
}
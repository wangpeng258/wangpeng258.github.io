const tcb = require('tcb-admin-node');
const {
    env,
    dbName
} = require('./config');
const {
    resSuccess,
    resError
} = require('./tools');
module.exports = async (event) => {
    tcb.init({
        env: env
    })
    try {
        const db = tcb.database();
        return resSuccess(await db.collection(dbName).add(event))
    } catch (error) {
        console.log('locationSet',error);
        return resError('设置失败',event)
    }
}
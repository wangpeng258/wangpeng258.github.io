'use strict';
const tcb = require('tcb-admin-node');

const dbName = `mydb`; //数据库名称


exports.main = async (event, context) => {
    /**
     * 字段
     * 科目+题目名称 不能重复
     * @suject  {String} 科目
     * @name    {String} 题目名称
     * @type    {String} 分类
     * @answer  {String} 答案
     */

    if (event.httpMethod === "POST") {
        tcb.init({
            env: tcb.getCurrentEnv()
        })
        const db = tcb.database();
        try {
            const { suject } = event.queryStringParameters;
            if (event.path == "/set") {
                if (isObjEmpty(event.body)) {
                    return resError(`参数不全[/set]`)
                };
                if (isObjEmpty(suject)) {
                    return resError(`参数不全[科目][/set]`)
                };
                const all = [];
                const array = JSON.parse(event.body);
                console.log('set_'+suject,array);
                for (let index = 0; index < array.length; index++) {
                    const element = array[index];
                    if (
                        !isObjEmpty(trimAll(suject)) &&
                        !isObjEmpty(element.name) &&
                        !isObjEmpty(element.answer)
                    ) {
                        const IsRepeat = await db.collection(dbName).where({
                            suject: trimAll(suject),
                            name: element.name
                        }).get();
                        if (!isObjEmpty(IsRepeat) && !isObjEmpty(IsRepeat.data)) {
                            const _id = IsRepeat.data[0]._id;
                            element.msg = 'update';
                            element.res = await db.collection(dbName).where({ _id }).update({
                                suject: trimAll(suject),
                                name: element.name,
                                type: element.type,
                                answer: element.answer
                            });
                        } else {
                            element.msg = 'add';
                            element.res = await db.collection(dbName).add({
                                suject: trimAll(suject),
                                name: element.name,
                                type: element.type,
                                answer: element.answer
                            })
                        };
                    } else {
                        element.msg = 'error';
                    };
                    all.push(element)
                };
                return resSuccess(all)
            } else if (event.path == "/get") {
                if (isObjEmpty(event.body)) {
                    return resError(`参数不全[/get]`)
                };
                if (isObjEmpty(suject)) {
                    return resError(`参数不全[科目][/get]`)
                };
                const all = [];
                const array = JSON.parse(event.body);
                console.log('get_'+suject,array);
                for (let index = 0; index < array.length; index++) {
                    const element = array[index];
                    if (
                        !isObjEmpty(trimAll(suject)) &&
                        !isObjEmpty(element.name)
                    ) {
                        const getAnswer = await db.collection(dbName).where({
                            suject: trimAll(suject),
                            name: element.name,
                        }).get();
                        if (!isObjEmpty(getAnswer) && !isObjEmpty(getAnswer.data)) {
                           element.answer = getAnswer.data[0].answer;
                        }
                    } else {
                        element.msg = 'error';
                    };
                    all.push(element)
                };
                return resSuccess(all)

            } else {
                return resError(`请求方式错误[1]`)
            }

        } catch (error) {
            return resError(`${error}`, event)
        }
    } else {
        return resError(`请求方式错误[2]`)
    }
};



function resSuccess(data = null) {
    return {
        status: 200,
        data
    }
};
function resError(errmsg = '错误', data = null) {
    return {
        status: -1,
        data,
        errmsg
    }
};


/**
 * 判断数据是否为空
 * @param {*} obj
 * @returns
 */
function isObjEmpty(obj) {
    return (
        obj === undefined ||
        obj === "undefined" ||
        obj == null ||
        obj === "" ||
        obj.length === 0 ||
        (typeof obj === "object" && Object.keys(obj).length === 0)
    );
}

/**
 * 去除所有空格&&解码
 * @param {*} obj
 * @returns
 */
function trimAll(str = "") {
    return str.replace(/\s/g, "");
}

//URL中的参数并转换为对象

function paramsObj(str = "") {
    const params = str.split("&");
    var obj = {};
    params.map(item => obj[item.split("=")[0]] = decodeURIComponent(item.split("=")[1]))
    return obj
}


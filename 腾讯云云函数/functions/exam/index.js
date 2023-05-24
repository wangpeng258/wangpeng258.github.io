'use strict';
const tcb = require('tcb-admin-node');

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



exports.main = async (event, context) => {
    /**
     * 字段
     * @name    {String} 题目名称
     * @type    {String} 题目类型      单选,多选
     * @answer  {String} 答案
     */
    if (event.httpMethod === "POST") {
        tcb.init({
            env: tcb.getCurrentEnv()
        })
        const db = tcb.database();

        try {
            const body = paramsObj(event.body);
            if (event.path == "/set") {
                if (
                    !isObjEmpty(body) &&
                    !isObjEmpty(trimAll(body.name)) &&
                    !isObjEmpty(trimAll(body.type)) &&
                    !isObjEmpty(trimAll(body.answer))
                ) {
                    const IsRepeat = await db.collection('exam').where({
                        name:trimAll(body.name)
                    }).get();
                    if(IsRepeat&&IsRepeat.data&&IsRepeat.data.length>0){
                        const _id = IsRepeat.data[0]._id;
                        return resSuccess(await db.collection('exam').where({_id}).update({
                            name:trimAll(body.name),
                            type:trimAll(body.type),
                            answer:trimAll(body.answer)
                        }))
                    }else{
                        return resSuccess(await db.collection('exam').add({
                            name:trimAll(body.name),
                            type:trimAll(body.type),
                            answer:trimAll(body.answer)
                        }))
                    }

                } else {
                    return resError(`参数不全[1]`, body)
                }
            }else if(event.path == "/get"){
                if (!isObjEmpty(body) && !isObjEmpty(trimAll(body.name))){
                     const Info = await db.collection('exam').where({
                        name:trimAll(body.name)
                    }).get();
                    if(Info&&Info.data&&Info.data.length>0){
                        return resSuccess(Info.data[0])
                    }else{
                        return resError(`没有找到答案`, body)
                    }

                }else{
                    return resError(`参数不全[2]`, body)
                }
            }else if(event.path == "/verify"){
                const verifyCodes = [
                    '20220310'
                ];
                const is =  verifyCodes.indexOf(body.code)===-1;
                if(is){
                    return resError(`验证码已失效`, body)
                }else{
                    return resSuccess('验证成功')
                }
            }else if(event.path == "/fix"){
                //修复 首字母为｛复制｝
                const getBugData = await db.collection('exam').where({
                        name:db.RegExp({
                                regexp: "复制",
                                //从搜索栏中获取的value作为规则进行匹配。
                                options: 'i',
                                //大小写不区分
                            })
                    }).get();
                    const BugData = getBugData.data||[];
                    if(!isObjEmpty(BugData)){
                        for(let i = 0;i<BugData.length;i++){
                            var el = BugData[i];
                            var is = el.name.substr(0,2) == "复制";
                            if(is){
                                await db.collection('exam').where({_id:el._id}).update({
                                    name:trimAll(el.name.replace('复制','')),
                                    type:trimAll(el.type),
                                    answer:trimAll(el.answer)
                                })
                            }
                        }
                    }
                return resSuccess(BugData)
            }else{
                return resError(`请求方式错误[1]`)
            }
        } catch (err) {
            console.log(err)
            return resError(`${err}`,event)
        }

    } else {
        return resError(`请求方式错误[2]`)
    }
};

// ==UserScript==
// @name         郑大【在线测试】
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  QQ:760635994
// @author       You
// @match        **://ols.v.zzu.edu.cn/**
// @require      https://cdn.jsdelivr.net/gh/wangpeng1478/Tools/Ajax-hook.min.js
// @connect      127.0.0.1
// @connect      api-5gmc47ob67d0c1ea-1254176432.ap-shanghai.app.tcloudbase.com
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAOVJREFUOE+tkjEOwjAMRR0lJ2DlBnAAZg5BZzYuUCnOxJa6Ug/BjsSMWJiRGJi4BCuwtUVGqtSGpCkCj5Hf849lAT+WGMJnWbbkPmPMxu2PCvI8X9d1vQCAhxDiorVetSW9ggZWSiVpml6J6ORKggIXbqYS0RkAdoho+c0rCMEMENFRCHHTWideQQxmCBHnTaJOgm/hjwREVCulpryw9qY5tjvZm4AFiNhJ1Qd7E7QFMdgrAIADANwBYBSKHTwka+1MSjnmhqqqnsaYfezU3/8timJSliWf6+CSUm552f8RDB7raXwB/gODETTud78AAAAASUVORK5CYII=
// @updateURL    https://cdn.jsdelivr.net/gh/wangpeng1478/wangpeng1478.github.io/tampermonkey/%E9%83%91%E5%A4%A7-%E5%9C%A8%E7%BA%BF%E6%B5%8B%E8%AF%95.js
// @downloadURL  https://cdn.jsdelivr.net/gh/wangpeng1478/wangpeng1478.github.io/tampermonkey/%E9%83%91%E5%A4%A7-%E5%9C%A8%E7%BA%BF%E6%B5%8B%E8%AF%95.js
// @noframes     true
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        window.focus
// ==/UserScript==

(function() {
    'use strict';
    function getSecretkey() {
        var date = new Date();
        return date.getFullYear() + (date.getMonth() + 1) + date.getDate()
    };

    if (getSecretkey() != 2040) {
        //alert(`Program expired,请联系开发者`)
        //return;
    };
    function Notify(html){
        var NotifyHtml = document.querySelector('#Notify');
        if(!NotifyHtml){
            document.body.insertAdjacentHTML('beforeEnd', `<div style="position: fixed;max-width: 50vw;top: 0;left: 50%;background: #000;color: #fff;transform: translateX(-50%);padding: 10px 15px;border-radius: 0 0 10px 10px;font-size: 12px;z-index: 10;text-align: center;word-wrap: break-word;word-break: break-all;" id="Notify">${html}</div>`);
        }else{
            NotifyHtml.innerHTML = html;
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
    };
    //修复decodeURIComponent % 错误
    function repairPerReplace(str) {
        if (str) {
            str = str.replace(/%/ig, '％');
            return str
        };
        return ""
    };
    /**
     * @ JSON转url
     */
    function getParam(data = {}) {
        let url = '';
        for (var k in data) {
            let value = data[k] !== undefined?data[k] : '';
            url += `&${k}=${encodeURIComponent(value)}`
        }
        return url?url.substring(1) : ''
    };

    const W = typeof unsafeWindow === 'undefined'?window : unsafeWindow;
    // localStorage
    // XMLHttpRequest //允许脚本访问本地文件:
    // GM
    // Cloud
    const model = `localStorage`;
    const root = `http://127.0.0.1:8888`;

    setInterval(() => {
        //进入开始测试
        if (W.location.hash.includes('#/index/online')) {
            W.location.href = `/xsd/#/index/testdire`;
        }
    }, 1000);



    W.addEventListener("hashchange", examStart);
    // W.location.href = `/xsd/#/index/testdire`;
    // window.atob() 解密
    // window.btoa() 加密
    // encodeURIComponent 编码
    // decodeURIComponent 解码

    function examStart() {
        //console.clear();
        //在线测试页面
        if (W.location.hash === "#/index/testdire") {
            W.sessionStorage.setItem('activeName', '');
            //初始化
            const clickTask = setInterval(() => {
                const collapseItem = document.querySelectorAll('.ant-collapse-item');
                if (collapseItem.length > 0) {
                    collapseItem.forEach(el =>{
                        if(!el.classList.contains('ant-collapse-item-active')){
                            el.querySelector('.ant-collapse-header').click()
                        }
                    });
                    const activeAll = document.querySelectorAll('.ant-collapse-item.ant-collapse-item-active');
                    if(activeAll.length===collapseItem.length){
                        clearInterval(clickTask);
                    }
                }
            }, 500);
        };

        //进入开始测试
        if (W.location.hash.includes('#/index/testmess/')) {
            setTimeout(() => {
                document.querySelector("#root section > a")?.click();
            }, 200);
        }

        //进入查看错题
        if (W.location.hash.includes('#/index/testsub/')) {
            setTimeout(() => {
                // document.querySelector(`a[class^='testsub_look']`)?.click()
            }, 5000);
        }
        if (
            W.location.hash.includes("#/index/testdire") ||
            W.location.hash.includes('#/index/testmess/') ||
            W.location.hash.includes('#/index/testsub') ||
            W.location.hash.includes('#/index/mistakes')
        ) {
            //测试页面
            if (ah && !W['ahInit']) {
                W['ahInit'] = true; //防止重复执行
                ah.proxy({
                    //请求发起前进入
                    onRequest: (config, handler) => {
                        handler.next(config);
                    },
                    //请求成功后进入
                    onResponse: async(res, handler) => {
                        try {
                            //在线测试页面
                            if (res.config.url.includes(`/appCourseSubject/queryUserCourseList`)) {
                                const response = JSON.parse(res.response);
                                if (response.code === 0 && !isObjEmpty(response.data)){
                                    const CourseList = [];
                                    const resCourseList = response.data;
                                    resCourseList.forEach(element=>{
                                        const children = element.children||[];
                                        children.forEach(e=>{
                                            e.courseCode = element.courseCode;
                                            e.courseName = element.courseName;
                                            e.termCode = element.termCode;
                                            CourseList.push(e);
                                        })

                                    });
                                    console.log('CourseList',CourseList);
                                    var completeNum = 0;
                                    for (let index = 0; index < CourseList.length; index++) {
                                        const el = CourseList[index];
                                        if(el.curScore != el.totalScore){
                                            console.log('el',el);
                                            W.sessionStorage.setItem('activeName', el.courseName);
                                            W.sessionStorage.setItem('activeNameTitle', el.name);
                                            W.location.href = `/xsd/#/index/testsub/${el.chapterCode}/${el.courseCode}?redirect=${W.btoa(location.hash.replace('#',''))}&title=${W.btoa(encodeURIComponent(el.courseName))}&s=${new Date().getTime()}`;
                                            break;
                                        }else{
                                            completeNum++;
                                        }
                                    };
                                    document.title = `${completeNum}/${CourseList.length}`;
                                    if(completeNum>0 && completeNum===CourseList.length){
                                        document.title = `🔊 在线测试已完成 ${completeNum}/${CourseList.length}`;
                                        Notify(`🔊 在线测试已完成 ${completeNum}/${CourseList.length}`);
                                        GM_notification({
                                            title: document.querySelector("#root span[class^='header_name']")?.innerText,
                                            text: document.title,
                                            image: document.querySelector("#root img[class^='header_logo']")?.src,
                                            highlight: true, //是否突出显示发送通知的选项卡
                                            timeout: 0, //通知将被隐藏的时间（0 =禁用）
                                            onclick: _ => {
                                                window.focus();
                                            },
                                        })
                                    }
                                }
                            };
                            //考试页面
                            if (res.config.url.includes(`/appCourseSubject/queryChaptersTest`)) {
                                const response = JSON.parse(res.response);
                                if (response.code === 0 && !isObjEmpty(response.data) && !isObjEmpty(response.data[0].list)) {
                                    const list = response.data[0].list || [];
                                    var allAnswer = [];
                                    if (model === "Cloud") {
                                        var batchAnswer = [];
                                        list.forEach(element => {
                                            batchAnswer.push({
                                                name: repairPerReplace(element.content),
                                                type:repairPerReplace(element.type)
                                            })
                                        });
                                        allAnswer = await getAnswer(batchAnswer) || [];
                                        console.log('allAnswer', allAnswer);
                                    };

                                    for (let index = 0; index < list.length; index++) {
                                        const element = list[index];
                                        element.Inquire = false;
                                        const content = element.content;
                                        var answer = "";
                                        if (model === "Cloud") {
                                            answer = allAnswer.find(e => repairPerReplace(e.name) === repairPerReplace(content))?.answer;
                                        } else {
                                            answer = await getAnswer(content);
                                        }
                                        console.group((index + 1) + '_' + content)
                                        console.log(answer)
                                        console.groupEnd()
                                        if (!isObjEmpty(answer)) {
                                            const options = element.options;
                                            const arr = [];
                                            const answerArr = answer.split('~');
                                            //查询答案
                                            answerArr.forEach(a => {
                                                var index = options.findIndex(e => repairPerReplace(e) == repairPerReplace(a));
                                                if (index >= 0) {
                                                    arr.push(index)
                                                }
                                            });
                                            if (!isObjEmpty(arr)) {
                                                //查询到
                                                element.answer = arr.sort().join('~');
                                                element.Inquire = true;
                                                element.answerText = answer;
                                            } else {
                                                //未查询到 默认第一个
                                                element.answer = 0;
                                                element.answerText = element.options[0];
                                            }
                                        } else {
                                            //未查询到 默认第一个
                                            element.answer = 0;
                                            element.answerText = element.options[0];
                                        }
                                    }
                                    console.log('list', list);
                                    W['topicList'] = list;
                                    const buttonList = [...document.querySelectorAll("section[class^='testsub_buts'] > button")];
                                    if (!isObjEmpty(buttonList)) {
                                        //查找选择
                                        const autoSelect = _ => {
                                            setTimeout(() => {
                                                const $pageDom = document.querySelector("#root p[class^='testsub_page']>span");
                                                if (!isObjEmpty($pageDom)) {
                                                    const page = +($pageDom?.innerText) - 1;
                                                    const info = list[page];
                                                    document.title = `${page}`;
                                                    Notify(`${page}`);
                                                    if (!isObjEmpty(info)) {
                                                        if (info.type == "1" || info.type == "3") {
                                                            //单选题 || 判断
                                                            [...document.querySelectorAll("label.ant-radio-wrapper")][info.answer]?.click();
                                                            autoClickNext();
                                                        } else if (info.type == "2") {
                                                            //多选题
                                                            const array = (info.answer + '').split('~');
                                                            array.forEach(i => {
                                                                [...document.querySelectorAll("label.ant-checkbox-wrapper")][i]?.click();
                                                            });
                                                            autoClickNext();
                                                        } else {
                                                            document.title = `未知题型`
                                                        }
                                                    } else {
                                                        document.title = `未找到题目[info]`
                                                    }
                                                } else {
                                                    document.title = `pageDom不存在`
                                                }

                                            }, 500);

                                        };
                                        autoSelect();


                                        //点击下一步
                                        const autoClickNext = _ => {
                                            setTimeout(() => {
                                                //可以下一步
                                                if (buttonList[1].style.display != 'none') {
                                                    buttonList[1].click();
                                                    autoSelect();
                                                } else {
                                                    const InquireNum = list.filter(e => e.Inquire === true);
                                                    //点击提交
                                                    if (W['autoClickSubmit']) {
                                                        clearInterval(W['autoClickSubmit']);
                                                        W['autoClickSubmit'] = null;
                                                    }
                                                    W['autoClickSubmit'] = setInterval(() => {
                                                        let time = `未开始`;
                                                        try {
                                                            time = document.querySelector("#root span[class^='testsub_time__']")?.innerText;
                                                        } catch (error) {}
                                                        document.title = `[${time}]-${InquireNum.length}/${list.length}-[${(W.sessionStorage.getItem('测试次数') || 0)}]`;
                                                        Notify(`[${time}]-${InquireNum.length}/${list.length}-[${(W.sessionStorage.getItem('测试次数') || 0)}]`);
                                                        if (!buttonList[2].disabled) {
                                                            clearInterval(W['autoClickSubmit']);
                                                            W['autoClickSubmit'] = null;
                                                            buttonList[2].click();
                                                        }
                                                    }, 1000);
                                                }
                                            }, 500);

                                        };
                                    }
                                }
                            };



                            //提交
                            if (res.config.url.includes(`/appCourseSubject/checkUserSubjectAnswer2`)) {
                                const response = JSON.parse(res.response);
                                if (response.code === 0 && !isObjEmpty(response.data) && !isObjEmpty(response.data[0]) && !isObjEmpty(response.data[0].result)) {
                                    const examResult = response.data[0];
                                    const result = examResult.result;
                                    const topicList = W['topicList'];
                                    const batchArr = [];
                                    for (let index = 0; index < result.length; index++) {
                                        const element = result[index];
                                        if (element == "对") {
                                            const info = topicList[index];
                                            if (!info.Inquire) {
                                                if (model === "Cloud") {
                                                    batchArr.push({
                                                        name: info.content,
                                                        type: info.type,
                                                        answer: info.answerText,
                                                    })
                                                } else {
                                                    await setAnswer(info.content, info.answerText);
                                                }
                                            }
                                        }
                                    }
                                    if (model === "Cloud") {
                                        await setAnswer(batchArr,'Cloud');
                                    }
                                    document.title = `采集完成${examResult.curScore}/${examResult.totalScore}`;
                                    Notify(`采集完成${examResult.curScore}/${examResult.totalScore}`);
                                    try {
                                        W.sessionStorage.setItem('测试次数', (+W.sessionStorage.getItem('测试次数') || 0) + 1);
                                        //W.sessionStorage.setItem('fraction', `${examResult.curScore}/${examResult.totalScore}-${(examResult.curScore / examResult.totalScore) * 100}%`)
                                        //分数高于等于65%
                                        //if ((examResult.curScore / examResult.totalScore) * 100 >= 65) {
                                        //    let fullScore = JSON.parse(W.sessionStorage.getItem('fullScore') || "[]");
                                        //    if (W.sessionStorage.getItem('activeNameTitle')) {
                                        //        fullScore.push(W.sessionStorage.getItem('activeNameTitle'));
                                        //        W.sessionStorage.setItem('fullScore', JSON.stringify(fullScore))
                                        //    }
                                        //}
                                    } catch (error) {

                                    }
                                    setTimeout(() => {
                                        document.querySelector(`a[class^='testsub_look']`)?.click()
                                    }, 500);
                                } else {
                                    W.location.reload();
                                }
                            }

                            //解析
                            if (res.config.url.includes(`/appCourseSubject/queryCurErrorSubject`)) {
                                const response = JSON.parse(res.response);
                                if (response.code === 0 && !isObjEmpty(response.data)) {
                                    const array = response.data;
                                    const batchArr = [];
                                    for (let index = 0; index < array.length; index++) {
                                        const x = array[index];
                                        if (model === "Cloud") {
                                            batchArr.push({
                                                name: x.content,
                                                type: x.type,
                                                answer: x.answerList.join('~'),
                                            })
                                        } else {
                                            await setAnswer(x.content, x.answerList.join('~'));
                                        }
                                    };

                                    if (model === "Cloud") {
                                        await setAnswer(batchArr,'Cloud');
                                    }
                                    setTimeout(() => {
                                        W.location.href = `/xsd/#/index/testdire`;
                                    }, 1000);
                                } else {
                                    W.location.href = `/xsd/#/index/testdire`;
                                }
                            }
                        } catch (error) {
                            console.log(error);
                        };
                        handler.next(res)
                    }
                })
            }
        }
    };

    //获取答案
    async function getAnswer(str) {
        return new Promise((resolve) => {
            try {
                if (model === "GM") {
                    resolve(GM_getValue(`[郑大]${repairPerReplace(str)}`))
                }
                if (model === "localStorage") {
                    resolve(W.localStorage.getItem(`[郑大]${repairPerReplace(str)}`))
                }
                if (model === "XMLHttpRequest") {
                    GM_xmlhttpRequest({
                        method: "GET", //GET, HEAD, POST的其中之一
                        url: `${root}/get?title=${repairPerReplace(str)}&s=${new Date().getTime()}`,
                        responseType: 'json',
                        anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                        onload: (xhr) => {
                            const res = xhr.response;
                            if (res && res.code == "ok" && !isObjEmpty(res.result)) {
                                resolve(res.result[0].answer)
                            } else {
                                resolve()
                            }
                        },
                        onerror: (err) => {
                            console.error(err);
                            resolve()
                        }
                    })
                };
                if (model === "Cloud") {
                    // [{
                    //     name: "",
                    //     type:"",
                    //     answer:"qweqw|123123"
                    // }]
                    var activeName = repairPerReplace(W.sessionStorage.getItem('activeName'));
                    GM_xmlhttpRequest({
                        method: "POST", //GET, HEAD, POST的其中之一
                        url: `https://api-5gmc47ob67d0c1ea-1254176432.ap-shanghai.app.tcloudbase.com/mydb/get?suject=${activeName}&s=${new Date().getTime()}`,
                        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                        responseType: 'json',
                        anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                        data: JSON.stringify(str),
                        onload: (xhr) => {
                            const res = xhr.response;
                            if (res && res.status == 200 && !isObjEmpty(res.data)) {
                                resolve(res.data)
                            } else {
                                resolve([])
                            }
                        },
                        onerror: (err) => {
                            console.error(err);
                            resolve([])
                        }
                    })
                }

            } catch (error) {
                console.error(error);
                resolve()
            }
        })
    };

    //设置答案
    async function setAnswer(title, answer) {
        return new Promise((resolve) => {
            if (!isObjEmpty(title) && !isObjEmpty(answer)) {
                if (model === "GM") {
                    resolve(GM_setValue(`[郑大]${repairPerReplace(title)}`, repairPerReplace(answer)));
                };
                if (model === "localStorage") {
                    resolve(W.localStorage.setItem(`[郑大]${repairPerReplace(title)}`, repairPerReplace(answer)));
                };
                if (model === "XMLHttpRequest") {
                    GM_xmlhttpRequest({
                        method: "POST", //GET, HEAD, POST的其中之一
                        url: `${root}/add?notKey=title&s=${new Date().getTime()}`,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        responseType: 'json',
                        anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                        data: getParam({
                            name: repairPerReplace(W.sessionStorage.getItem('activeName')),
                            title: repairPerReplace(title),
                            answer: repairPerReplace(answer),
                        }),
                        onload: (xhr) => {
                            const res = xhr.response;
                            if (res && res.code == "ok" && !isObjEmpty(res.result)) {
                                resolve(res)
                            } else {
                                resolve()
                            }
                        },
                        onerror: (err) => {
                            console.error(err);
                            resolve()
                        }
                    })
                }
                if (model === "Cloud") {
                    // [{
                    //     name: "",
                    //     type:"",
                    //     answer:"qweqw|123123"
                    // }]
                    var activeName = repairPerReplace(W.sessionStorage.getItem('activeName'));
                    GM_xmlhttpRequest({
                        method: "POST", //GET, HEAD, POST的其中之一
                        url: `https://api-5gmc47ob67d0c1ea-1254176432.ap-shanghai.app.tcloudbase.com/mydb/set?suject=${activeName}&s=${new Date().getTime()}`,
                        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                        responseType: 'json',
                        anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                        data: JSON.stringify(title),
                        onload: (xhr) => {
                            const res = xhr.response;
                            if (res && res.status == 200 && !isObjEmpty(res.data)) {
                                resolve(res)
                            } else {
                                resolve()
                            }
                        },
                        onerror: (err) => {
                            console.error(err);
                            resolve()
                        }
                    })
                }
            } else {
                console.error('参数错误');
                resolve()
            }
        })

    };
    examStart();
})();
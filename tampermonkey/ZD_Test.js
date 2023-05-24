// ==UserScript==
// @name         ZD_Test
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  QQ:760635994
// @author       You
// @match        **://ols.v.zzu.edu.cn/**
// @connect      api-5gmc47ob67d0c1ea-1254176432.ap-shanghai.app.tcloudbase.com
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAJZJREFUOE+90zEOQUEQxvHfu4qSG7iHTsRR9I5AIRHN0ykplBpnEL04w5MVkg0vL1mTmHJ35//NfjNTCUYVzJcAfYww6IDdMMf1800CnHHBtgOQRGY8BfPopYOm5aKNVb9EdphigmEp4I4xjlijLgXssczKa0oByafcq/8DDlhEvvA28YQVNr948NXG8CCFRzm0T+FtfAAryS5NxJZN/AAAAABJRU5ErkJggg==
// @noframes     true
// @grant        unsafeWindow
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        window.focus
// ==/UserScript==

(function() {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;

    const timedTaskAppendHtml = setInterval(() => {
        console.count('timedTaskAppendHtml');
        const $button = document.querySelector('#StartButton');
        if (!$button) {
            document.body.insertAdjacentHTML('beforeEnd', `
                     <div>
                        <button onclick="Start()" id="StartButton" type="button" style="-webkit-appearance: none;position: fixed;bottom: 100px;left: 50%;transform: translateX(-50%);z-index:999;padding: 5px 20px;border: 1px solid #AAA;background-image: linear-gradient(to bottom,#fff 0,#F8F8F8 100%);background-repeat: repeat-x;border-radius: 2px;">开始</button>
                        <video style="position: fixed;top: 0;left: 0;width: 220px;z-index: 9999;" src="http://123.15.57.19/codplay/003402/h/0034021001.mp4" loop muted autoplay controls></video>
                      <div>`);
            clearInterval(timedTaskAppendHtml);
        }
    }, 500);

    W.Start = Start;

    //开始[在线测试]
    // async function Start() {
    //     console.clear();
    //     const $button = document.querySelector('#StartButton');
    //     if ($button) {
    //         $button.disabled = true;
    //         $button.innerText = '进行中...';
    //     };
    //     const GetCourseList = await Ajax('GET', `/s/appCourseSubject/queryUserCourseList?s=${new Date().getTime()}`);
    //     if (GetCourseList.code === 0 && !isObjEmpty(GetCourseList.data)) {
    //         const List = [];
    //         const array = GetCourseList.data || [];
    //         array.forEach(el1 => {
    //             const children = el1.children || [];
    //             children.forEach(el2 => {
    //                 //判断是否满分
    //                 if(el2.curScore!=el2.totalScore){
    //                     el2.termCode = el1.termCode;
    //                     el2.courseName = el1.courseName;
    //                     el2.courseCode = el1.courseCode;
    //                     List.push(el2);
    //                 }
    //             });
    //         });
    //         if (!isObjEmpty(List)){
    //             console.log(`一共${List.length}门未为考试`);
    //             const FirstInfo = List[0];
    //             // console.log('FirstInfo',FirstInfo);
    //             // courseName 课程名称
    //             // name 章节
    //             // courseCode 科目ID
    //             // chapterCode 章节ID
    //             const {courseName,name,courseCode,chapterCode} = FirstInfo;
    //             Exam(courseName,name,courseCode,chapterCode);
    //         }else{
    //             const $button = document.querySelector('#StartButton');
    //             if ($button) {
    //                 $button.disabled = false;
    //                 $button.innerText = '重新开始';
    //             };
    //             GM_notification({
    //                 title: document.querySelector("#root span[class^='header_name']").innerText,
    //                 text: `🔊在线测试已完成`,
    //                 image: document.querySelector("#root img[class^='header_logo']").src,
    //                 highlight: true, //是否突出显示发送通知的选项卡
    //                 timeout: 0, //通知将被隐藏的时间（0 =禁用）
    //                 onclick: _ => {
    //                     window.focus();
    //                 },
    //             });
    //         };
    //     } else {
    //         Notify(`<span style="color:red">ajax1</span>`);
    //     };
    // };


    //开始[素质教育]
    async function Start() {
        console.clear();
        const $button = document.querySelector('#StartButton');
        if ($button) {
            $button.disabled = true;
            $button.innerText = '进行中...';
        };
        const GetCourseList = await Ajax('GET', `/s/appCourse/queryMyQualityEducationList?s=${new Date().getTime()}`);
        if (GetCourseList.code === 0 && !isObjEmpty(GetCourseList.data)) {
            const List = [];
            const TestArr = [];
            const array = GetCourseList.data || [];
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                const getContentByCourseCode = await Ajax('POST', `/s/appCourseContent/getContentByCourseCode`,`courseCode=${element.courseCode}`,{
                    'Content-Type': 'application/x-www-form-urlencoded',
                });
                if (getContentByCourseCode.code === 0 && !isObjEmpty(getContentByCourseCode.data)){
                    getContentByCourseCode.data.forEach(k => {
                        const children = k.children || [];
                        children.forEach(x => {
                            let completedExam = JSON.parse(W.sessionStorage.getItem('已完成考试') || "[]");
                            if(x.dataType==="测试"&&completedExam.indexOf(element.courseCode+'_'+x.contentCode)===-1){
                                List.push({
                                    courseCode:element.courseCode,
                                    courseName:element.courseName,
                                    contentCode:x.contentCode,
                                    title:x.title,
                                })
                            }
                        });
                    });
                }
            };
            if (!isObjEmpty(List)){
                console.log(`一共${List.length}门未为考试`);
                const FirstInfo = List[0];
                console.log('FirstInfo',FirstInfo);
                // courseName 课程名称
                // title 章节
                // courseCode 科目ID
                // contentCode 章节ID
                const {courseName,title,courseCode,contentCode} = FirstInfo;
                Exam(courseName,title,courseCode,contentCode);
            }else{
                const $button = document.querySelector('#StartButton');
                if ($button) {
                    $button.disabled = false;
                    $button.innerText = '重新开始';
                };
                GM_notification({
                    title: document.querySelector("#root span[class^='header_name']").innerText,
                    text: `🔊在线测试已完成`,
                    image: document.querySelector("#root img[class^='header_logo']").src,
                    highlight: true, //是否突出显示发送通知的选项卡
                    timeout: 0, //通知将被隐藏的时间（0 =禁用）
                    onclick: _ => {
                        window.focus();
                    },
                });
            };
        } else {
            Notify(`<span style="color:red">ajax1</span>`);
        };
    };

    //考试
    async function Exam(courseName,name,courseCode,chapterCode){
        Notify(`[${courseName}]-[${name}]-[${courseCode}]-${chapterCode}`);
        console.log(`[${courseName}]-[${name}]-[${courseCode}]-${chapterCode}`);
        if(isObjEmpty(courseName) || isObjEmpty(name) || isObjEmpty(courseCode) || isObjEmpty(chapterCode)){
            Notify(`<span style="color:red">参数不合法！[Exam]</span>`);
            return false;
        };
        const startExam = await Ajax('POST', `/s/appCourseSubject/queryChaptersTest?chapterCode=${chapterCode}&s=${new Date().getTime()}`);
        if (startExam.code === 0 && !isObjEmpty(startExam.data) && !isObjEmpty(startExam.data[0])) {
            const ExamInfo = startExam.data[0];
            const testUUID = ExamInfo.testUUID; //考试ID
            const testList = ExamInfo.list; //考试题目
            const queryTestList  = [];
            testList.forEach(element => {
                queryTestList.push({
                    name: repairPerReplace(element.content),
                    type: repairPerReplace(element.type)
                });
            });
            var quantity = 0;
            const isQueriedTopicList = []; //判断是否查询到答案数组
            const answerArr = [];
            const queryAnswer = await getAnswer(courseName,queryTestList) || [];
            queryAnswer.forEach(element => {
                element.Inquire = false;
                const info = testList.find(e=>repairPerReplace(e.content)==repairPerReplace(element.name));
                if(!isObjEmpty(element.answer)){
                    const answerItemArr = element.answer.split('~');
                    if(element.type==1||element.type==2||element.type==3){
                        //单选题 || 判断
                        const arr = [];
                        if(info&&info.options&&info.options.length>0){
                            const options = info.options||[];
                            answerItemArr.forEach(el=>{
                                const I = options.indexOf(el);
                                if(I!=-1){
                                    arr.push(I);
                                };
                            });
                            if(!isObjEmpty(arr)){
                                quantity++;
                                answerArr.push(arr.sort().join('~'));
                                element.Inquire = true;
                            }else{
                                answerArr.push(0);
                                element.answerText = info.options[0];
                            }
                        }else{
                            answerArr.push(0);
                            element.answerText = info.options[0];
                        }
                    }else{
                        answerArr.push(0);
                        element.answerText = info.options[0];
                    }
                }else{
                    answerArr.push(0);
                    element.answerText = info.options[0];
                }
                isQueriedTopicList.push(element);
            })
            console.log('testUUID',testUUID);
            console.log('answerArr',answerArr);
            console.log(`开始考试[${quantity}/${testList.length}]`);
            if(answerArr.length>0 && testList.length===answerArr.length){
                //等待考试结束
                if (W['TimingExamTask']) {
                    clearInterval(W['TimingExamTask']);
                    W['TimingExamTask'] = null;
                };
                W['SecondExam'] = 0;
                W['TimingExamTask'] = setInterval(async () => {
                    W['SecondExam']++;
                    document.title = second(W['SecondExam']);
                    if (W['SecondExam'] >= 2.5 * 60) {
                        clearInterval(W['TimingExamTask']);
                        W['TimingExamTask'] = null;
                        const data = getParam({
                            answerStr:answerArr.join('~~'),
                            courseCode:courseCode,
                            chapterCode:chapterCode,
                            testUUID:testUUID,
                        });
                        const waitExam = await Ajax('POST', `/s/appCourseSubject/checkUserSubjectAnswer2`,data,{
                            'Content-Type': 'application/x-www-form-urlencoded',
                        });
                        if(waitExam.code===0&&!isObjEmpty(waitExam.data)&&!isObjEmpty(waitExam.data[0])){
                            //curScore 当前得分
                            //intFlag 是否可以继续考试
                            //newScore 新的得分
                            //oldScore 旧的得分
                            //totalScore 总分
                            //result
                            const waitExamInfo = waitExam.data[0];
                            const result = waitExamInfo.result;
                            console.log(`考试结果[${waitExamInfo.newScore}/${waitExamInfo.totalScore}]`);
                            const batchArr = [];
                            result.forEach((element,index) => {
                                const info = isQueriedTopicList[index];
                                if (element== "对"&&!info.Inquire){
                                    batchArr.push({
                                        name: repairPerReplace(info.name),
                                        type: repairPerReplace(info.type),
                                        answer: repairPerReplace(info.answerText),
                                    })
                                }
                            });


                            const CurErrorSubject = await Ajax('POST', `/s/appCourseSubject/queryCurErrorSubject`,`intFlag=${waitExamInfo.intFlag}`,{
                                'Content-Type': 'application/x-www-form-urlencoded',
                            });
                            if(CurErrorSubject.code===0&&!isObjEmpty(CurErrorSubject.data)){
                                const array = CurErrorSubject.data;
                                array.forEach(element => {
                                    batchArr.push({
                                        name:repairPerReplace(element.content),
                                        type:repairPerReplace(element.type),
                                        answer:repairPerReplace(element.answerList.join('~')),
                                    })
                                });
                            }
                            console.log(`解析`,CurErrorSubject);
                            if(waitExamInfo.newScore==waitExamInfo.totalScore){
                               Notify(`满分`);
                               let completedExam = JSON.parse(W.sessionStorage.getItem('已完成考试') || "[]");
                                   completedExam.push(courseCode+'_'+chapterCode);
                               W.sessionStorage.setItem('已完成考试', JSON.stringify(completedExam));
                            };
                            if(!isObjEmpty(batchArr)){
                                const setAnswerresult = await setAnswer(courseName,batchArr);
                                console.log(`设置答案`,setAnswerresult);
                            };
                            Start();
                        }else{
                            Start();
                        }
                    };
                }, 1000);


            }else{
                Notify(`<span style="color:red">参数不合法！</span>`);
            };
        }else{
            Notify(`<span style="color:red">ajax2</span>`);
        };
    };
    //通知
    function Notify(html) {
        var NotifyHtml = document.querySelector('#Notify');
        if (!NotifyHtml) {
            document.body.insertAdjacentHTML('beforeEnd', `<div style="position: fixed;max-width: 50vw;top: 0;left: 50%;background: #000;color: #fff;transform: translateX(-50%);padding: 10px 15px;border-radius: 0 0 10px 10px;font-size: 12px;z-index: 99999999;text-align: center;word-wrap: break-word;word-break: break-all;" id="Notify">${html}</div>`);
        } else {
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
    /**
     * @ JSON转url
     */
    function getParam(data = {}) {
        let url = '';
        for (var k in data) {
            let value = data[k] !== undefined ? data[k] : '';
            url += `&${k}=${encodeURIComponent(value)}`
        }
        return url ? url.substring(1) : ''
    };
    //秒转时间
    function second(value) {
        var theTime = parseInt(value); // 秒
        var middle = 0; // 分
        var hour = 0; // 小时

        if (theTime >= 60) {
            middle = parseInt(theTime / 60);
            theTime = parseInt(theTime % 60);
            if (middle >= 60) {
                hour = parseInt(middle / 60);
                middle = parseInt(middle % 60);
            }
        }
        var result = "" + parseInt(theTime) + "秒";
        if (middle > 0) {
            result = "" + parseInt(middle) + "分" + result;
        }
        if (hour > 0) {
            result = "" + parseInt(hour) + "小时" + result;
        }
        return result;
    };
    //修复decodeURIComponent % 错误
    function repairPerReplace(str) {
        if (str) {
            str = str.replace(/%/ig, '％');
            return str
        };
        return ""
    };
    async function Ajax(method, url, body, headers) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open(method || "GET", url, true);
            for (const key in headers) {
                if (Object.hasOwnProperty.call(headers, key)) {
                    const element = headers[key];
                    xhr.setRequestHeader(key, element);
                }
            }
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(xhr.status);
                    }
                }
            }
            xhr.send(body);
        })
    };


    //获取答案
    async function getAnswer(activeName, arr=[]) {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "POST", //GET, HEAD, POST的其中之一
                url: `https://api-5gmc47ob67d0c1ea-1254176432.ap-shanghai.app.tcloudbase.com/mydb/get?suject=${activeName}&s=${new Date().getTime()}`,
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                responseType: 'json',
                anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                data: JSON.stringify(arr),
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
        })
    };

    //设置答案
    async function setAnswer(activeName, arr=[]) {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "POST", //GET, HEAD, POST的其中之一
                url: `https://api-5gmc47ob67d0c1ea-1254176432.ap-shanghai.app.tcloudbase.com/mydb/set?suject=${activeName}&s=${new Date().getTime()}`,
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                responseType: 'json',
                anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                data: JSON.stringify(arr),
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
        })
    };
})();
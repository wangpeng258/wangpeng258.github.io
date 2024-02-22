// ==UserScript==
// @name         国开新网址-考试
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @connect      192.168.3.16
// @connect      47.115.215.229
// @icon         https://lms.ouchn.cn/static/assets/images/favicon-ouchn-d8ff1235.ico
// @include      https://*/exam/*/subjects
// @require      https://cdn.bootcdn.net/ajax/libs/sweetalert/2.1.2/sweetalert.min.js
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    // const ROOT = 'http://192.168.3.16:1995/sqlite/api'; //本地
    const ROOT = 'http://47.115.215.229:1995/sqlite/api'; //线上
    W.addEventListener("hashchange", examStart);
    examStart();
    GM_addStyle(`.swal-footer{text-align: center !important;}`)
    async function examStart() {
        try {
            const title = document.title;
            const hrefArr = W.location.href.split('/');
            //采集
            if (/\#\/submission\/\d+/.test(W.location.hash)) {
                console.clear();
                console.log(`采集-${title}`, hrefArr);

                var contentDom = document.createElement('div');
                contentDom.innerHTML = `
                    <ul style="height: auto;max-height: 230px;overflow: auto;text-align: left;font-size: 12px;" id="swalContent"></ul>
                `;
                swal({
                    title: "采集",
                    closeOnClickOutside: false,
                    content: contentDom,
                    buttons: ["关闭", "返回上一页"],
                }).then((willDelete) => {
                    willDelete && history.back();
                })
                swalContent.insertAdjacentHTML('afterbegin', `<li style="color:#1989fa">开始采集<br /><hr /></li>`);
                const examsRes = await xmlhttpRequest({
                    method: 'GET',
                    url: `/api/exams/${hrefArr[4]}/submissions/${hrefArr[7]}`,
                    anonymous: false
                })
                if (examsRes.code === 200) {
                    const subjectsData = examsRes.data.subjects_data.subjects || []; //题目
                    const submissionData = examsRes.data.submission_data.subjects || []; //提交答案数据
                    const submissionScoreData = examsRes.data.submission_score_data || []; //分数
                    const correctAnswers = examsRes.data.correct_answers_data?.correct_answers || []; //答案
                    console.log('[采集]题目', subjectsData);
                    console.log('[采集]提交答案数据', submissionData);
                    console.log('[采集]分数', submissionScoreData);
                    console.log('[采集]答案', correctAnswers);
                    if(submissionScoreData.length===0 && confirm('当前试卷没有公布成绩，是否需要采集？')===false){
                        swalContent.insertAdjacentHTML('afterbegin', `<li style="color:red">[停止采集]<br /><hr /</li>`);
                        return;
                    }
                    var num = 0;
                    for (let index = 0; index < subjectsData.length; index++) {
                        const element = subjectsData[index];
                        const id = element.id;//题目Id
                        const type = element.type;//题目类型
                        const description = element.description;//题目标题
                        const score = Number(submissionScoreData[id]);
                        if (score > 0 || submissionScoreData.length===0) {
                            let answerIdArr = [];
                            let answer = "";
                            const answerInfo = submissionData.find(e => e.subject_id === id) || {};
                            //判断题 单选题  多选题
                            if (element.type == "true_or_false" || element.type == "single_selection" || element.type == "multiple_selection") {
                                answerIdArr = JSON.stringify(answerInfo.answer_option_ids)
                                const options = element.options.filter(e => answerInfo.answer_option_ids.includes(e.id));
                                var arr = [];
                                options.forEach(el => {
                                    if (el.type === "text") {
                                        arr.push(htmlToText(el.content))
                                    } else {
                                        arr.push(el.content)
                                    }
                                });
                                answer = JSON.stringify(arr);
                            }
                            //简答题
                            if (element.type == "short_answer") {
                                answer = answerInfo.answer;
                            }
                            const formData = {
                                Course: title,//课程
                                ExamType: type,//试题类型
                                Name: htmlToText(description),
                                Answer: answer,
                                RefAnswer: answerIdArr,//参考答案
                                Url: W.location.href,
                                Remark: '',
                            };

                            if (formData.ExamType && formData.Name && formData.Answer) {
                                const resAdd = await xmlhttpRequest({
                                    method: 'POST',
                                    url: `${ROOT}/add`,
                                    anonymous: true,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    data: new URLSearchParams(formData).toString()
                                })
                                if (resAdd.code === 200) {
                                    if (resAdd.data.status === 200) {
                                        swalContent.insertAdjacentHTML('afterbegin', `<li style="color:#1989fa">[采集成功]-${formData.Name.slice(0, 20)}<br /><hr /></li>`);
                                        num++;
                                    } else {
                                        if (resAdd.data.errmsg.includes('已存在')) {
                                            swalContent.insertAdjacentHTML('afterbegin', `<li style="color:#ff976a">[已存在]-${formData.Name.slice(0, 20)}<br /><hr /></li>`);
                                        } else {
                                            swalContent.insertAdjacentHTML('afterbegin', `<li style="color:#07c160">[保存失败]-${resAdd.data.errmsg}<br /><hr /></li>`);
                                        }
                                    }
                                } else {
                                    swalContent.insertAdjacentHTML('afterbegin', `<li style="color:#07c160">[保存失败]-${resAdd.errMsg}<br /><hr /</li>`);
                                }
                            }
                        }
                    }
                    swalContent.insertAdjacentHTML('afterbegin', `<li style="color:#07c160">[全部采集完成]-(${num})<br /><hr /</li>`);
                } else {
                    swalContent.insertAdjacentHTML('afterbegin', `<li style="color:red">[采集失败]-${examsRes.errMsg}<br /><hr /</li>`);
                }

            };

            //答题
            if (W.location.hash===`#/take`){
                let isComplete = false;
                swal({
                    title: "答题",
                    closeOnClickOutside: false,
                    text: '页面加载完毕以后点击“开始答题”',
                    button:{
                        text: "开始答题",
                        value: true,
                        visible: true,
                        className: "",
                        closeModal: false,
                    },
                }).then(() => {
                    const subjectArr = document.querySelectorAll('.subjects-jit-display>.subject');
                    if (subjectArr.length > 0) {
                        swal.close();
                        var contentDom = document.createElement('div');
                        contentDom.innerHTML = `
                            <ul style="height: auto;max-height: 230px;overflow: auto;text-align: left;font-size: 12px;" id="answerContent"></ul>
                        `;
                        swal({
                            title: "查找答案",
                            closeOnClickOutside: false,
                            content: contentDom,
                            button:{
                                text: "关闭",
                                value: true,
                                visible: true,
                                className: "",
                                closeModal: false,
                            },
                        }).then(_=>{
                            swal.stopLoading();
                            if(isComplete){
                                swal.close();
                            }
                        })
                        AnswerQuestions();
                    }else{
                        swal.stopLoading();
                    }
                })


                //初始化
               async function AnswerQuestions(){
                    const subjectArr = document.querySelectorAll('.subjects-jit-display>.subject');
                    var num = 0;
                    for (let index = 0; index < subjectArr.length; index++) {
                        const element = subjectArr[index];
                        //单选 多选 判断 填空
                        if(element.classList.contains('single_selection')||element.classList.contains('multiple_selection')||element.classList.contains('true_or_false')||element.classList.contains('short_answer')){
                            try {
                                const summaryTitle = trimAll(element.querySelector('.subject-description')?.innerText);
                                const resGet = await xmlhttpRequest({
                                    method: 'POST',
                                    url: `${ROOT}/detail/name`,
                                    anonymous: true,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    data: new URLSearchParams({name:summaryTitle}).toString()
                                });
                                // console.log(resGet);
                                if(resGet.code===200){
                                    const res = resGet.data;
                                    if(res.status===200){
                                        //判断题 单选题 //多选题
                                        if(res.data.ExamType == "true_or_false" || res.data.ExamType =="single_selection" || res.data.ExamType == "multiple_selection"){
                                            // var RefAnswer = JSON.parse(res.data.RefAnswer||"[]");
                                            var Answer = JSON.parse(res.data.Answer||"[]");
                                            const optionsArr =  element.querySelectorAll('.subject-options>.option');
                                            var isExist = [];
                                            optionsArr.forEach(el => {
                                                const optionContent = trimAll(el.querySelector('.option-content>span')?.innerText);
                                                el.querySelector('input').checked = false;
                                                if(Answer.includes(optionContent)){
                                                    el.querySelector('label').click();
                                                    isExist.push(el.querySelector('input').value)
                                                }
                                            });
                                            if(isExist.length>0){
                                                answerContent.insertAdjacentHTML('afterbegin', `<li style="color:#1989fa">[答题成功]-${summaryTitle.slice(0, 20)}<br /><hr /></li>`);
                                                num++;
                                            }
                                        }

                                         //简答题
                                        if (res.data.ExamType == "short_answer" && res.data.Answer) {
                                            element.querySelector('.simditor-body[contenteditable="true"]').innerHTML = res.data.Answer;
                                            element.querySelector('textarea[ng-model="subject.answered_content"]').value = res.data.Answer;
                                            element.querySelector('.simditor-body[contenteditable="true"]').dispatchEvent(new Event('input'));
                                            element.querySelector('textarea[ng-model="subject.answered_content"]').dispatchEvent(new Event('input'));
                                            num++;
                                        }
                                    }else{
                                        answerContent.insertAdjacentHTML('afterbegin', `<li style="color:red">[答题失败1]-${summaryTitle.slice(0, 20)}-${res.errMsg}<br /><hr /</li>`);
                                    }
                                }else{
                                    answerContent.insertAdjacentHTML('afterbegin', `<li style="color:red">[答题失败2]-${summaryTitle.slice(0, 20)}-${resGet.errMsg}<br /><hr /</li>`);
                                };
                            } catch (error) {
                                answerContent.insertAdjacentHTML('afterbegin', `<li style="color:red">[答题失败3]-${error}<br /><hr /</li>`);
                            }

                        }
                    };
                    isComplete = true;
                    answerContent.insertAdjacentHTML('afterbegin', `<li style="color:#07c160">[全部答题完成]-(${num}/${subjectArr.length})<br /><hr /</li>`);
                }

            }
        } catch (error) {
            console.log(error);
            alert(error)
        }
    };
    //请求
    function xmlhttpRequest(e) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: e.method || "POST",//GET, HEAD, POST的其中之一
                url: e.url,
                headers: e.headers || {},
                data: e.data || {},
                responseType: e.responseType || 'json', //blob, json中的一个
                anonymous: e.anonymous || false,//不发送带有请求的Cookie（请参阅 fetch 说明）
                onload: (res) => {
                    if (res.status === 200) {
                        resolve({
                            code: 200,
                            data: res.response
                        })
                    } else {
                        resolve({
                            code: -1,
                            errMsg: res.statusText
                        })
                    }
                },
                onerror: (err) => {
                    resolve({
                        code: -1,
                        errMsg: err
                    })
                }
            })
        })
    }
    function htmlToText(html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return trimAll(div.innerText)
    };
    function trimAll(str){
       try {
         return str.replace(/\s/g,"");
       } catch (error) {
         return str||''
       }
    };
})();
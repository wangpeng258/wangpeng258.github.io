// ==UserScript==
// @name         郑大【考试】
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  QQ:760635994
// @author       You
// @match        http://222.22.63.178/*
// @connect      101.34.52.7
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/2.2.4/jquery.min.js
// @require      https://cdn.jsdelivr.net/gh/wangpeng1478/Tools/Ajax-hook.min.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAOVJREFUOE+tkjEOwjAMRR0lJ2DlBnAAZg5BZzYuUCnOxJa6Ug/BjsSMWJiRGJi4BCuwtUVGqtSGpCkCj5Hf849lAT+WGMJnWbbkPmPMxu2PCvI8X9d1vQCAhxDiorVetSW9ggZWSiVpml6J6ORKggIXbqYS0RkAdoho+c0rCMEMENFRCHHTWideQQxmCBHnTaJOgm/hjwREVCulpryw9qY5tjvZm4AFiNhJ1Qd7E7QFMdgrAIADANwBYBSKHTwka+1MSjnmhqqqnsaYfezU3/8timJSliWf6+CSUm552f8RDB7raXwB/gODETTud78AAAAASUVORK5CYII=
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        window.focus
// ==/UserScript==
(function () {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;

    if (location.pathname.includes('/student/courseList')) {
        setTimeout(() => {
            $('.class-list-li').click(function (e) {
                var className = $.trim($(this).find('.class-name').text());
                console.log('className', className);
                GM_setValue('className', className);
            });

        }, 500);
    }
    if (location.pathname.includes('/student/exercise')) {
        $('body').append(`
            <div style="position: fixed;
            top: 1em;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            background: #fff;
            padding: 9px 15px;
            font-size: 12px;
            text-align: center;
            border-radius: 5px;">
                <label style="display: flex;
                align-items: center;
                justify-content: center;
                margin: 10px;">
                    <input id="isStartClosure" style="margin-right: 5px;" type="checkbox" onchange="startClosure(this)">
                    <span id="statusCheckbox">开始</span>
                </label>
                <input style="display: block;" id="course" value="" disabled/>
            </div>
        `);
        setTimeout(() => {
            const className = GM_getValue('className');
            if (className) {
                $('#course').val(className);
            }
            const query = getQuery();
            if (query.type === "auto") {
                $('#isStartClosure').prop('checked', true).trigger('change');
            };
        }, 1000)
        if (ah && !W['ahInit']) {
            W['ahInit'] = true; //防止重复执行
            ah.proxy({
                //请求发起前进入
                onRequest: (config, handler) => {
                    handler.next(config);
                },
                //请求成功后进入
                onResponse: async (res, handler) => {
                    try {
                        if (res.config.url.includes(`/student/getQuestion`)) {
                            const divEl = document.createElement('div');
                            divEl.innerHTML = res.response;
                            const element = $(divEl).find('.q-content');
                            if (element) {
                                var answer = '';
                                var type = $.trim($(element).find("div:contains('题型描述: ')").text()).replace(/题型描述: /ig, '');
                                var name = $.trim($('#course').val());
                                var topicName = $.trim($(element).find(".test-title").text());

                                var typeValue = $(`#questionTypeSelect>option:contains('${type}')`).attr('value');
                                if (type == "单选题" || type == "多选题" || type == "判断题") {
                                    const answerStr = $.trim($(element).find('div.tip-container:eq(0) b').text());
                                    const answerArr = answerStr.split(' ').sort();
                                    if (answerArr.length > 0) {
                                        const arr = [];
                                        const answerDom = $(element).find('p.answer[data-o-right-flag="1"]');
                                        answerDom.each(function (i, el) {
                                            const nextName = $.trim($(el).next().text());
                                            if (!isObjEmpty(nextName)) {
                                                arr.push(nextName);
                                            }
                                        });
                                        answer = arr.join('~');
                                    }
                                };
                                if (!isObjEmpty(name) && !isObjEmpty(typeValue) && !isObjEmpty(topicName)) {
                                    await setAnswer(name, typeValue, topicName, answer);
                                }
                            }
                        }
                        findNext();
                    } catch (error) {
                        findNext();
                        console.error('onResponse[error]', error)
                    }
                    handler.next(res)
                }
            })
        }
    };
    //查找下一个
    function findNext() {
        setTimeout(() => {
            $('p.answer[data-o-right-flag="1"]').trigger('click');
            $('.q-content>*').show();
            if ($('#isStartClosure').prop('checked')) {
                var spareQuestion = questionsJson.filter(grepQuestion);
                if (spareQuestion.length < 1) {
                    alert('结束')
                } else {
                    next && next()
                }
            }
        }, 1500);
    }
    //开始关闭
    function startClosure(e) {
        if ($.trim($('#course').val()) && $.trim($('#questionTypeSelect').val())) {
            $('#course').attr('disabled', true);
            if (e.checked) {
                next && next();
                $('input[auto-next]').prop('checked', true);
                $('#statusCheckbox').text('关闭');
            } else {
                W['timing1'] && clearInterval(W['timing1']);
                $('#statusCheckbox').text('开始');
            }
        } else {
            e.checked = false;
        }
    };


    function operate(type, index) {
        var name = $.trim($(`#titleTextarea${index}`).val());
        if (!name) {
            return;
        }
        if (type == 1) {
            openWindow(`https://www.baidu.com/s?wd=${name}`, name, 800, 800);

        } else if (type == 2) {
            GM_setClipboard(name, {
                type: 'text',
                mimetype: 'text/plain'
            });
            document.title = '复制成功';
        }
    }

    // 解除限制
    setTimeout(() => {
        $('.logo,.foot').css({
            opacity: 0
        });
        document.oncontextmenu = function () {
            event.returnValue = true;
        }
        // 或者直接返回整个事件
        document.oncontextmenu = function () {
            return true;
        }
        document.onselectstart = function () {
            event.returnValue = true;
        }
        // 或者直接返回整个事件
        document.onselectstart = function () {
            return true;
        }
        document.oncopy = function () {
            event.returnValue = true;
        }
        // 或者直接返回整个事件
        document.oncopy = function () {
            return true;
        }
        document.onkeydown = function () {
            if (event.ctrlKey) {
                return true;
            }
            if (event.altKey) {
                return true;
            }
            if (event.shiftKey) {
                return true;
            }
        }
    }, 500);
    /**
     * @ 获取地址栏参数
     */
    function getQuery() {
        var url = location.search;
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1),
                strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(decodeURIComponent(strs[i].split("=")[1]));
            }
        };
        return theRequest
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
            let value = data[k] !== undefined ? data[k] : '';
            url += `&${k}=${encodeURIComponent(value)}`
        }
        return url ? url.substring(1) : ''
    };



    //设置答案
    async function setAnswer(Course, ExamType, Name, Answer) {
        console.table({
            Course, ExamType, Name, Answer
        });

        return new Promise((resolve) => {
            if ($.trim($('#course').val()) && $.trim($('#questionTypeSelect').val())) {
                GM_xmlhttpRequest({
                    method: "POST", //GET, HEAD, POST的其中之一
                    url: `http://101.34.52.7:1988/sqlite/api/add?s=${new Date().getTime()}`,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    responseType: 'json',
                    anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                    data: new URLSearchParams({Course,ExamType,Name,Answer}).toString(),
                    onload: (xhr) => {
                        const res = xhr.response;
                        console.log('[res]',res);
                        if (res && res.status == 200) {
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
            } else {
                console.log('console', '选择类型')
                resolve('选择类型')
            }

        })

    };
    W['startClosure'] = startClosure;
})();
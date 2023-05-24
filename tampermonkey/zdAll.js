// ==UserScript==
// @name         zdAll
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        **://ols.v.zzu.edu.cn/**
// @require      https://cdn.jsdelivr.net/gh/wangpeng1478/Tools/Ajax-hook.min.js
// @connect      127.0.0.1
// @connect      api-5gmc47ob67d0c1ea-1254176432.ap-shanghai.app.tcloudbase.com
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zzu.edu.cn
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        window.focus
// ==/UserScript==

(function () {
    'use strict';
    // localStorage
    // XMLHttpRequest //允许脚本访问本地文件:
    // GM
    // Cloud
    const model = `Cloud`;
    const root = `http://127.0.0.1:8888`;

    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    W.addEventListener("hashchange", Start);
    Start();

    //获取课程信息
    function getCourses() {
        GM_xmlhttpRequest({
            method: "POST", //GET, HEAD, POST的其中之一
            url: `/s/appCourse/queryMyCourseList`,
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            responseType: 'json',
            anonymous: false, //不发送带有请求的Cookie（请参阅 fetch 说明）
            data: {},
            onload: (coursesXhr) => {
                const coursesRes = coursesXhr.response;
                if (coursesRes && coursesRes.code == 0 && !isObjEmpty(coursesRes.data)) {
                    var courses = coursesRes.data[0]?.list || [];
                    // console.log('courses',courses);
                    GM_xmlhttpRequest({
                        method: "POST", //GET, HEAD, POST的其中之一
                        url: `/s/appCourse/queryCourseTestScore`,
                        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                        responseType: 'json',
                        anonymous: false, //不发送带有请求的Cookie（请参阅 fetch 说明）
                        data: {},
                        onload: (scoreXhr) => {
                            const scoreRes = scoreXhr.response;
                            if (scoreRes && scoreRes.code == 0 && !isObjEmpty(scoreRes.data)) {
                                const scoreObj = scoreRes.data[0];
                                // console.log('scoreObj',scoreObj);
                                const newCourses = [];
                                courses.forEach(element => {
                                    const courseCode = element.courseCode;
                                    const scoreInfo = scoreObj[courseCode];
                                    const newInfo = Object.assign(element, scoreInfo);
                                    if (newInfo.totalHour > 0 && (newInfo.status === "未学习" || newInfo.status === "学习中") && (newInfo.hasLearningTotal != newInfo.courseTotal || newInfo.hasTestTotal != newInfo.testTotal)) {
                                        newCourses.push(newInfo);
                                    }
                                });
                                W['newCourses'] = newCourses;
                                var html = ``;
                                const checkedIDs = (W.sessionStorage.getItem('checkedID') || "").split(',');
                                console.log('checkedIDs', checkedIDs);
                                newCourses.forEach(element => {
                                    var checked = '';
                                    if (checkedIDs.includes(element.courseCode)) {
                                        checked = 'checked';
                                    }
                                    html += `<div class="courses-item">
                                               <input type="checkbox" name="checkedGoods" value="${element.courseCode}" ${checked}/>
                                               <div class="courses-item-info">
                                                    <div class="courses-item-title">
                                                        <span style="background-color:${element.status === '学习中' ? '#09bc61' : '#aaa'}" class="status${element.termCode}">${element.status}</span>
                                                        ${element.courseName}
                                                    </div>
                                                    <div class="courses-item-score">
                                                        <span>点播:<span>${element.hasLearningTotal}/${element.courseTotal}</span>分</span>
                                                        <span>测试:<span>${element.hasTestTotal}/${element.testTotal}</span>分</span>
                                                    </div>
                                                    <div class="courses-item-time">
                                                        <span style="border: 1px solid #666;color: #666;">${element.curTerm}</span>
                                                        <span style="border: 1px solid #ff5d19;color: #ff5d19;">${element.totalHour}小时</span>
                                                    </div>
                                                </div>
                                            </div>`
                                });
                                console.log('newCourses', newCourses);
                                if (newCourses.length > 0 && html) {
                                    document.querySelector("#selectingCourses").innerHTML = `
                                        <div class="courses-list">${html}</div>
                                        <button id="startStudy" onclick="StartStudy(this)" class="startStudy" type="button">开始学习</button>`;
                                    W.StartStudy = function (obj) {
                                        const checkedID = [];
                                        document.querySelectorAll(`input[name="checkedGoods"]`).forEach(el => {
                                            if (el.checked) {
                                                checkedID.push(el.value);
                                            }
                                        });
                                        W.sessionStorage.setItem('checkedID', checkedID.join(','));
                                        if (isObjEmpty(checkedID)) {
                                            document.title = '请选择课程';
                                            return;
                                        };
                                        var testCompletion = []; //测试完成
                                        var array = W['newCourses'] || [];
                                        for (let index = 0; index < array.length; index++) {
                                            const element = array[index];
                                            if (checkedID.includes(element.courseCode) && element.hasTestTotal > 0 && element.hasTestTotal === element.testTotal) {
                                                testCompletion.push(element.courseCode);
                                            };
                                        };

                                        var testHtml = `<iframe src="/xsd/#/index/dibble"></iframe>`;
                                        var viedoHtml = '';
                                        if (testCompletion.length > 0 && testCompletion.length === checkedID.length) {
                                            testHtml = '';
                                            GM_notification({
                                                title: document.querySelector("#root span[class^='header_name']")?.innerText,
                                                text: `🔊 在线测试已完成`,
                                                image: document.querySelector("#root img[class^='header_logo']")?.src,
                                                highlight: true, //是否突出显示发送通知的选项卡
                                                timeout: 0, //通知将被隐藏的时间（0 =禁用）
                                                onclick: _ => {
                                                    window.focus();
                                                },
                                            })
                                        }
                                        checkedID.forEach(element => {
                                            viedoHtml += `<iframe src="/xsd/#/index/video/${element}"></iframe>`
                                        });
                                        document.querySelector("#myiframeView")?.remove();
                                        document.body.insertAdjacentHTML('beforeEnd', `<div id="myiframeView">${testHtml}${viedoHtml}</div>`);

                                        obj.disabled = true;
                                        obj.innerText = '学习中';
                                        console.log(testCompletion, checkedID);
                                    };
                                } else {
                                    document.querySelector("#selectingCourses").innerHTML = `<h1>已完成全部课程</h1>`;
                                }


                            } else {
                                Notify(`<span style="color:red">获取分数失败${scoreRes}</span>`);
                            }
                        },
                        onerror: (err) => {
                            console.error(err);
                            Notify(`<span style="color:red">获取分数失败${err}</span>`);
                        }
                    })

                } else {
                    Notify(`<span style="color:red">获取课程失败${coursesRes}</span>`);
                }
            },
            onerror: (err) => {
                console.error(err);
                Notify(`<span style="color:red">获取课程失败${err}</span>`);
            }
        })
    };
    function Start() {
        if (W.location.hash === '#/index/online') {
            if (self != top) {
                top.location = '/xsd/#/index/online';
            };
            const timedTaskBeforeEndHtml = setInterval(() => {
                if (document.querySelector("#selectingCourses")) {
                    clearInterval(timedTaskBeforeEndHtml);
                } else {
                    document.querySelector("#root [class^='online_con_head']")?.insertAdjacentHTML('beforeEnd', `
                        <div id="selectingCourses" style="min-height: 285px;">
                            <span style="display: block;margin: 1em auto;" class="ant-spin-dot ant-spin-dot-spin"><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i></span>
                        </div>
                        <style>
                            [class^='home_contentRight__'],
                            #root{
                                height: auto !important;
                                min-height: auto !important;
                            }
                            #root .ant-row,
                            [class^='online_con_main__'],
                            [class^='home_bottom']{
                                display: none !important;
                            }
                            [class^='header_headBox'],
                            [class^='home_contentLeft']{
                                position: revert !important;
                            }
                            [class^='home_contentLeft']{
                                position: revert !important;
                                margin-right: 10px !important;
                                height: 500px !important;
                            }
                            [class^='home_content_']{
                                padding-top: 15px !important;
                            }
                            .courses-item{
                                display: flex;
                                align-items: center;
                                padding: 10px;
                                border-bottom: 1px dashed #c4c4c4;
                            }
                            .courses-item>input[type="checkbox"]{
                                width:15px;
                                height:15px;
                                margin-right:20px;
                            }
                            .courses-item-info{
                                flex:1;
                                font-size: 12px;
                            }
                            .courses-item-title{
                                font-size: 13px;
                                font-weight: 600;
                                margin-bottom: 5px;
                            }
                            .courses-item-title>span{
                                font-size: 12px;
                                color: #fff;
                                border-radius: 2px;
                                background-color: #09bc61;
                                font-weight: 400;
                                padding: 0px 4px;
                            }
                            .courses-item-time>span{
                                border-radius: 2px;
                                padding: 3px 5px;
                                margin: 10px 5px 5px 0px;
                                display: inline-block;
                            }
                            .courses-item-score>span{
                                margin-right: 5px;
                            }
                            .courses-item-score>span>span{
                                color: #f53;
                                font-weight: 700;
                            }
                            .startStudy{
                                display: block;
                                min-width: 120px;
                                margin: 30px auto;
                                padding: 5px 5px;
                                border: none;
                                background: #3f6be8;
                                color: #fff;
                                border-radius: 5px;
                                cursor: pointer;
                            }
                            .startStudy[disabled]{
                                background: #8dabff;
                                cursor: no-drop;
                            }
                            #myiframeView{
                                margin-top: 100px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                flex-wrap: wrap;
                            }
                            #myiframeView>iframe{
                                display: block;
                                width: 50%;
                                height: 50vh;
                                margin-bottom: 1em;
                            }
                        </style>
                    `);
                    getCourses();
                }
            }, 500);

            // if (!document.querySelector("#myiframe")) {
            //     document.body.insertAdjacentHTML('beforeEnd',`
            //         <div style="display: flex;align-items: center;" id="myiframe">
            //            <iframe src="/xsd/#/index/dibble" style="display: block;width: 50vw;height: 100vh;border: none;"></iframe>
            //            <iframe src="/xsd/#/index/testdire" style="display: block;width: 50vw;height: 100vh;border: none;"></iframe>
            //         </div>
            //         <style>
            //           [class^='home_bottom']{
            //              display: none !important;
            //           }
            //         </style>
            //     `);
            // }
        };

        if (W.location.hash === '#/login') {
            if (self != top) {
                top.location = '/xsd/#/login';
            }
        };

        if (self != top) {
            if (!document.querySelector("#mystyle")) {
                document.body.insertAdjacentHTML('beforeEnd', `
                    <style id="mystyle">
                        [class^='home_bottom'],
                        [class^='home_contentLeft'],
                        [class^='header_headBox']{
                            display: none !important;
                        }
                        [class^='home_content']{
                            width: 100% !important;
                            padding: 10px !important;
                            margin: 0 !important;
                        }
                        [class^='home_contentRight']{
                            width: 100% !important;
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                    </style>
                `);
            }
            examStart();
        };

        if ((W.location.hash.includes('#/index/dibble') || W.location.hash.includes('#/index/video/')) && self != top) {
            //自动播放任务
            const timedTaskViedo = setInterval(() => {
                try {
                    if (!document.querySelector("#mystyle")) {
                        document.body.insertAdjacentHTML('beforeEnd', `
                            <style id="mystyle">
                                [class^='home_bottom'],
                                [class^='home_contentLeft'],
                                [class^='header_headBox']{
                                    display: none !important;
                                }
                                [class^='home_content']{
                                    width: 100% !important;
                                    padding: 10px !important;
                                    margin: 0 !important;
                                }
                                [class^='home_contentRight']{
                                    width: 100% !important;
                                    padding: 0 !important;
                                    margin: 0 !important;
                                }
                            </style>
                        `);
                    }
                    console.count('timedTaskViedo');
                    //进入课程点播
                    // if (W.location.hash.includes('#/index/online')) {
                    //     W.location.href = `/xsd/#/index/dibble`;
                    // };

                    //进入
                    const $dibbleUl = document.querySelectorAll(`ul[class^='dibble_head_ul']>li`);
                    if (!isObjEmpty($dibbleUl)) {
                        let isEnter = false;
                        for (let index = 0; index < $dibbleUl.length; index++) {
                            const el = $dibbleUl[index];
                            const statusText = el.querySelector(`[class^='curriculumCard_headP1']>span[class*='curriculumCard_study']`);
                            const fraction = el.querySelector(`p[class^='curriculumCard_headP2']>span:nth-child(1) > span`);
                            if (!isObjEmpty(fraction) && !isObjEmpty(statusText) && !isObjEmpty(statusText?.innerText)) {
                                const fractionArr = (fraction?.innerText.trim()).split("/");
                                // 判断是否进入
                                if (fractionArr[0] != fractionArr[1] && (statusText?.innerText == '学习中' || statusText?.innerText == '未学习')) {
                                    el.querySelector(`div[class^='curriculumCard_CurriculumCard']`).click();
                                    isEnter = true;
                                    break;
                                }
                            }
                        };
                        if (!isEnter) {
                            document.title = `🔊 暂无课程点播`;
                            Notify(`🔊 暂无课程点播`);
                            GM_notification({
                                title: document.querySelector("#root span[class^='header_name']")?.innerText,
                                text: document.title,
                                image: document.querySelector("#root img[class^='header_logo']")?.src,
                                highlight: true, //是否突出显示发送通知的选项卡
                                timeout: 0,//通知将被隐藏的时间（0 =禁用）
                                onclick: _ => {
                                    window.focus();
                                },
                            });
                            clearInterval(timedTaskViedo);
                        };
                    };

                    //关闭模态框
                    const $closeModal = document.querySelector(`.ant-modal .ant-modal-close`);
                    if (!isObjEmpty($closeModal)) {
                        $closeModal.click();
                    }

                    //目录展开
                    const $courseCatalog = document.querySelectorAll(`li[class^='video_indexOne__']`);
                    if (!isObjEmpty($courseCatalog)) {
                        $courseCatalog.forEach(el => {
                            el.querySelector('.ant-tree-switcher').classList.contains('ant-tree-switcher_close') && el.querySelector('.ant-tree-switcher')?.click()
                        });
                    };

                    //切换线路
                    const $toggleLine = document.querySelector('.videoErrorUrlListBox > .videoErrorUrlListTit');
                    if ($toggleLine?.innerText == '请尝试切换线路') {
                        document.title = `🔊 请尝试切换线路`;
                        Notify(`🔊 请尝试切换线路`);
                        let nextDom = document.querySelector('.currentVideoErrorUrl')?.nextAll();
                        if (nextDom.length > 0) {
                            nextDom[0]?.click();
                        } else {
                            location.reload();
                            // location.href = "/xsd/#/index/dibble";
                        }
                    }

                    //选择播放视频
                    const playlist = [];
                    const $player = document.querySelector('#player-con');
                    if (isObjEmpty($player)) {
                        const $videoList = document.querySelectorAll(`.ant-tree-child-tree li[class^='video_indexN__1']`);
                        for (let index = 0; index < $videoList?.length; index++) {
                            const el = $videoList[index];
                            const typeText = el.querySelector(`.ant-tree-title>p>span:nth-child(1)`) || {};
                            const statusText = el.querySelector(`.ant-tree-title>p>span:nth-child(2)`) || {};
                            if (!isObjEmpty(typeText) && typeText?.innerText == "视频" && statusText?.innerText != "已完成") {
                                playlist.push(el)
                            }

                        };
                        W['playlist'] = playlist;
                        viedoPlay();
                    } else {
                        //点击播放
                        const $playBtn = $player.querySelector(`.prism-big-play-btn`);
                        if (!isObjEmpty($playBtn) && $playBtn.style.display == "block") {
                            $playBtn.click();
                        }

                        //监听播放
                        let current = document.querySelector(".current-time");
                        let duration = document.querySelector(".duration");
                        let $video = document.querySelector("#player-con > video");
                        if ($video && current && duration && current?.innerText != "00:00" && duration?.innerText != "00:00") {
                            $video.muted = true;
                            let num = $video.currentTime;
                            let total = $video.duration;
                            let percentage = Math.round(num / total * 1000) / 10;
                            document.title = `${percentage}/100 - [${(W.sessionStorage.getItem('播放视频次数') || 0)}]`;
                            Notify(`${percentage}/100 - [${(W.sessionStorage.getItem('播放视频次数') || 0)}]`);
                            if (percentage >= 98) {
                                W.sessionStorage.setItem('播放视频次数', (+W.sessionStorage.getItem('播放视频次数') || 0) + 1);
                                viedoPlay();
                            }
                        }
                    }
                    //播放视频&删除
                    function viedoPlay() {
                        if (W.location.hash.includes('#/index/video/')) {
                            if (!isObjEmpty(W['playlist'])) {
                                const $first = W['playlist'].shift();
                                const $videoStart = $first.querySelector(`span[class^='video_start']`);
                                if (!isObjEmpty($videoStart)) {
                                    //window.focus();
                                    $videoStart.click();
                                } else {
                                    Notify(`已完成`);
                                    location.reload();
                                    // W.location.href = `/xsd/#/index/dibble`;
                                }
                            }
                        }
                    }
                    W['viedoPlay'] = viedoPlay;
                } catch (error) {
                    console.log(error);
                }
            }, 2000);
        };

    };



    //在线测试
    function examStart() {
        //console.clear();
        //在线测试页面
        if (W.location.hash === "#/index/testdire") {
            W.sessionStorage.setItem('activeName', '');
            //初始化
            const clickTask = setInterval(() => {
                const collapseItem = document.querySelectorAll('.ant-collapse-item');
                if (collapseItem.length > 0) {
                    collapseItem.forEach(el => {
                        if (!el.classList.contains('ant-collapse-item-active')) {
                            el.querySelector('.ant-collapse-header').click()
                        }
                    });
                    const activeAll = document.querySelectorAll('.ant-collapse-item.ant-collapse-item-active');
                    if (activeAll.length === collapseItem.length) {
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
                    onResponse: async (res, handler) => {
                        try {
                            //在线测试页面
                            if (res.config.url.includes(`/appCourseSubject/queryUserCourseList`)) {
                                const response = JSON.parse(res.response);
                                if (response.code === 0 && !isObjEmpty(response.data)) {
                                    const CourseList = [];
                                    const resCourseList = response.data;
                                    resCourseList.forEach(element => {
                                        const children = element.children || [];
                                        children.forEach(e => {
                                            e.courseCode = element.courseCode;
                                            e.courseName = element.courseName;
                                            e.termCode = element.termCode;
                                            CourseList.push(e);
                                        })

                                    });
                                    console.log('CourseList', CourseList);
                                    var completeNum = 0;
                                    for (let index = 0; index < CourseList.length; index++) {
                                        const checkedIDs = (W.sessionStorage.getItem('checkedID') || "").split(',');
                                        const el = CourseList[index];
                                        if (el.curScore != el.totalScore && checkedIDs.includes(el.courseCode)) {
                                            console.log('el', el);
                                            W.sessionStorage.setItem('activeName', el.courseName);
                                            W.sessionStorage.setItem('activeNameTitle', el.name);
                                            W.location.href = `/xsd/#/index/testsub/${el.chapterCode}/${el.courseCode}?redirect=${W.btoa(location.hash.replace('#', ''))}&title=${W.btoa(encodeURIComponent(el.courseName))}&s=${new Date().getTime()}`;
                                            break;
                                        } else {
                                            completeNum++;
                                        }
                                    };
                                    document.title = `${completeNum}/${CourseList.length}`;
                                    if (completeNum > 0 && completeNum === CourseList.length) {
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
                                                type: repairPerReplace(element.type)
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
                                                        } catch (error) { }
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
                                        await setAnswer(batchArr, 'Cloud');
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
                                        await setAnswer(batchArr, 'Cloud');
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
    HTMLElement.prototype.nextAll = function () {
        var pe = this.parentElement;
        var cs = pe.children;
        var arr = [];
        for (var i = cs.length - 1; i >= 0; i--) {
            var csi = cs[i];
            if (csi == this) {
                break;
            }
            arr.unshift(csi);
        }
        return arr;
    };
    //通知
    function Notify(html) {
        var NotifyHtml = document.querySelector('#Notify');
        if (!NotifyHtml) {
            document.body.insertAdjacentHTML('beforeEnd', `<div style="position: fixed;max-width: 50vw;top: 0;left: 50%;background: #000;color: #fff;transform: translateX(-50%);padding: 10px 15px;border-radius: 0 0 10px 10px;font-size: 12px;z-index: 100;text-align: center;word-wrap: break-word;word-break: break-all;" id="Notify">${html}</div>`);
        } else {
            NotifyHtml.innerHTML = html;
        }
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
    // Your code here...
})();
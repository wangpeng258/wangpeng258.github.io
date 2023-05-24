// ==UserScript==
// @name         苏州市行政执法人员培训云平台
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      http://xzzf-p.webtrn.cn/cms/loginNew.htm?portal=index
// @include      https://xzzf-kfkc.webtrn.cn/learnspace/learn/learn/templateeight/courseware_index.action?params.courseId=**
// @include      http://xzzf-p.webtrn.cn/cms/classDetailNew.htm?classId=**
// @include      https://xzzf-kfkc.webtrn.cn/learnspace/learn/learn/templateeight/index.action?**
// @connect      xzzf-p.webtrn.cn
// @icon         http://xzzf-p.webtrn.cn/favicon.ico
// @grant        unsafeWindow
// @grant        GM_openInTab
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        window.focus
// @grant        window.close
// ==/UserScript==

(function() {
    'use strict';
    // http://xzzf-p.webtrn.cn/cms/
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const courseUrl = `http://xzzf-p.webtrn.cn/cms/classDetailNew.htm?classId=8a80812980d28a730180d4e434e70c0e`;
    const timedTaskAppendHtml = setInterval(async() => {
        W.onbeforeunload = function(){return};
        if ($('.layui-layer-btn0').is(":visible")) {
            $('.layui-layer-btn0').click();
            layer.closeAll();
        };
        await Start();
        // clearInterval(timedTaskAppendHtml);
    }, 500);
    async function Start() {
        const { pathname } = W.location;
        //首页
        if (pathname === "/cms/loginNew.htm") {
            if ($('#Mytrans').length === 0) {
                $('.banV2-center').append(`<a id="Mytrans" target="_top" href="${courseUrl}" class="btn-theme bd3 trans">进入课程</a>`);
                $('.banV2-center .btn-theme').css({
                    'margin-top': '10px'
                })
            }
        };

        //课程页面
        if (pathname === `/cms/classDetailNew.htm`) {
            const classId = getQuery().classId;
            const totalcount = $('#totalcount').val();
            if (!isObjEmpty(classId) && !isObjEmpty(totalcount)) {
                clearInterval(timedTaskAppendHtml);
                const Course = await getCourse(classId, totalcount);
                if (Course) {
                    const Compulsory = Course.filter(item => item.courseType === "必修课");
                    const Electives = Course.filter(item => item.courseType === "选修课");

                    const coursePassTime = $('#coursePassTime').text()||0;
                    const courseAppraiseTime = $('#courseAppraiseTime').text()||0;

                    const coursePassTimeOptional = $('#coursePassTimeOptional').text()||0;
                    const courseAppraiseTimeOptional = $('#courseAppraiseTimeOptional').text()||0;

                    if(coursePassTime===0&&courseAppraiseTime===0&&coursePassTimeOptional===0&&courseAppraiseTimeOptional===0){
                        notification('提示', '加载失败，刷新页面重试');
                        W.location.reload();
                    };
                    GM_setValue('JD',`必修课[${coursePassTime}/${courseAppraiseTime}] - 选修课[${coursePassTimeOptional}/${courseAppraiseTimeOptional}]`);
                    if (coursePassTime != courseAppraiseTime) {
                        console.log(`必修课[${coursePassTime}/${courseAppraiseTime}]`, Compulsory);
                        for (let index = 0; index < Compulsory.length; index++) {
                            const element = Compulsory[index];
                            if (element.totalScore != '100') {
                                toLearn(element);
                                break;
                            }
                        }
                    } else if (coursePassTimeOptional != courseAppraiseTimeOptional) {
                        console.log(`选修课[${coursePassTimeOptional}/${courseAppraiseTimeOptional}]`, Electives);
                        for (let index = 0; index < Electives.length; index++) {
                            const element = Electives[index];
                            if (element.totalScore != '100') {
                                toLearn(element);
                                break;
                            }
                        }
                    };
                    if(coursePassTime>0 && coursePassTimeOptional>0 && coursePassTime===courseAppraiseTime && coursePassTimeOptional===courseAppraiseTimeOptional) {
                        notification('提示', '完成全部课程');
                    };
                } else {
                    notification('提示', '课程获取失败，请重试');
                }
            }
        };
        //学习载体
        if(pathname == "/learnspace/learn/learn/templateeight/index.action"){
            $('#courseware_main_menu>a').css('color','red');
            if (!$('#courseware_main_menu').hasClass('learn-menu-cur')) {
                $('#courseware_main_menu').trigger('click');
                $('#mainContent').attr('src', $('#courseware_main_menu>a').attr('href'));
                $('#courseware_main_menu>a').css('color','red');
                // clearInterval(timedTaskAppendHtml);
            };
        };
        //学习页面
        if (pathname == "/learnspace/learn/learn/templateeight/courseware_index.action") {
            $('.s_sectionlist,.s_sectionwrap').show();
            const completed_num = $(`div[itemtype="video"] .done_icon_show`).length; //完成数量
            const undone_num = $(`div[itemtype="video"]`).length; //全部数量

            if (completed_num > 0 && completed_num === undone_num) {
                goCourse(1);
                clearInterval(timedTaskAppendHtml);
            };
            const videoList = [];
            if (videoList.length === 0) {
                $(`div[itemtype="video"]`).each(function(index, element) {
                    // element == this
                    const is = $(element).find('.item_done_pos').hasClass('done_icon_show');
                    if (!is) {
                        videoList.push(element);
                    }
                });
            };
            if (videoList.length > 0) {
                if (!W['FirstVideo']) {
                    W['FirstVideo'] = videoList[0];
                    W['FirstVideo'].click();
                    $(videoList[0]).css('color','red');
                    console.log('click', videoList[0]);
                };
                var mainFrame = document.getElementById('mainFrame');
                if (mainFrame && mainFrame.contentWindow && mainFrame.contentWindow.document) {
                    const iFrameDocument = mainFrame.contentWindow.document;
                    let $video = iFrameDocument.querySelector("#container video");
                    if ($video) {
                        if ($(iFrameDocument).find("#player_pause").is(":visible")) {
                            $video.play();
                        };
                        $video.playbackRate = 2;
                        let num = $video.currentTime;
                        let total = $video.duration;
                        let percentage = Math.round(num / total * 1000) / 10;
                        Notify(`${percentage}/100 - [${completed_num}/${undone_num}]-${GM_getValue('JD')}`);
                        if (percentage >= 98) {
                            goCourse(2);
                            clearInterval(timedTaskAppendHtml);
                        };
                    }
                };
            }

        };

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
    //去学习
    function toLearn(course) {
        // 去学习链接地址

        var id = course.id;
        var name = course.name;
        var photo = course.photo;
        var openId = course.openId;
        var teacherName = course.teacherNames;
        var teacherNameTitle = course.teacherNames;
        var isOnline = course.isOnline;
        var courseTime = course.courseTime;
        var introduce = course.description;
        var courseType = course.courseType;
        var stuId = course.stuId;
        var coursewareId = course.coursewareId;
        var totalScore = course.totalScore;
        var learnspaceUrl = course.learnspaceUrl;
        var host = window.location.host;
        var coursewareCode = course.coursewareCode;
        var courseLinkAddr;
        if (coursewareId && coursewareId !== 'null') {
            courseLinkAddr = "/training/student/course/courseware/scorm12/LMSMain.jsp" +
                "?stuId=" + stuId + "&code=" + coursewareCode + "&opencourseId=" + openId + "&courseware_id=" + coursewareId + "&roleType=student&start=begin&template=";
        } else {
            var fakeId = $.cookies.get("fakeId");
            if (fakeId && fakeId != "") {
                if (fakeId.indexOf("@@") > -1) {
                    fakeId = fakeId.substring(2);
                }
                courseLinkAddr = learnspaceUrl + "/learnspace/sign/signLearn.action" +
                    "?template=blue&courseId=" + id + "&loginType=true&loginId=" + fakeId + "&sign=0&siteCode=xzzf&domain=" + host;
            } else {
                courseLinkAddr = learnspaceUrl + "/learnspace/sign/signLearn.action" +
                    "?template=blue&courseId=" + id + "&loginType=true&loginId=" + _LOGINID_ + "&sign=0&siteCode=xzzf&domain=" + host;
            }
        };


        saveUserToSpaceRecord(id);
        var param1 = {
            "entity.openCourse": id,
        };
        console.log('_LOGINID_', _LOGINID_);
        $.ajax({
            type: 'post',
            url: '/u/trainingV1/saveStudentElectiveNoProject.json',
            dataType: "json",
            data: param1,
            async: false,
            success: function(data) {
                console.log(data);
            }
        });
        console.log('courseLinkAddr', courseLinkAddr);
        console.log('id', id);
        // GM_openInTab(courseLinkAddr, {
        //     active: true, //决定是否应对新选项卡进行聚焦，
        //     // insert:true, //在当前选项卡之后插入新选项卡
        //     SetParent: true, //使浏览器在关闭时重新聚焦当前选项卡，然后
        //     // incognito:false, //选项卡在隐身模式/专用模式窗口中打开。
        // });
        // window.close();
        W.location.href = courseLinkAddr;
    };

    function goCourse(t) {
        //alert(t);
        W.parent.location.href = courseUrl;
        // GM_openInTab(courseUrl, {
        //     active: true, //决定是否应对新选项卡进行聚焦，
        //     // insert:true, //在当前选项卡之后插入新选项卡
        //     SetParent: true, //使浏览器在关闭时重新聚焦当前选项卡，然后
        //     // incognito:false, //选项卡在隐身模式/专用模式窗口中打开。
        // })
        // window.close();
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
    //发送通知
    function notification(title, text) {
        if (GM_notification) {
            GM_notification(text, title, `http://xzzf-p.webtrn.cn/favicon.ico`, _ => {
                window.focus();
            })
        }
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
    // 获取课程
    async function getCourse(classId, totalcount) {
        return new Promise((resolve) => {
            fetch("http://xzzf-p.webtrn.cn/u/recommendClass/queryClassCourse.json", {
                    "headers": {
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "x-requested-with": "XMLHttpRequest"
                    },
                    "referrer": `http://xzzf-p.webtrn.cn/cms/classDetailNew.htm?classId=${classId}`,
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": `page.searchItem.curPage=1&page.searchItem.pageSize=${totalcount}&page.searchItem.totalCount=${totalcount}&page.searchItem.classId=${classId}&page.searchItem.orderBy=1&page.searchItem.descriptionType=1`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                })
                .then(res => res.json())
                .then(res => {
                    if (res.errorCode == "0") {
                        resolve(res.classList);
                    }
                });
        })
    };
    // Your code here...
})();



/*

var arr = [];
$('.q_content').each(function (index, element) {
    // element == this
    var title = $.trim($(element).find('.divQuestionTitle').text());
    var is = $(element).find('i.icon_examright').length>0;
    $(element).find('.optionIndexName').remove();
    if(is){
        //正确答案
        var answers = $.trim($(element).find('.radio_on').text());
        arr.push(`${title}\n${answers}`);
    }else{
        //错误答案
        var answers = $.trim($(element).find('.radio_on').text());
        arr.push(`${title}\n[错误答案] ${answers}`);
    }
});
copy(arr.join('\n\n'));

 */

window.exam.post("/exam/examflow_checkPaperAnswer.action", {
    "params.lastRecordId": '10'
})
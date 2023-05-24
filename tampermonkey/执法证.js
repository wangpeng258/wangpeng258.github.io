// ==UserScript==
// @name         执法证课程
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  执法证
// @author       You
// @match        **://www.samrela.com/*
// @icon         https://www.samrela.com/favicon.ico
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/2.2.4/jquery.min.js
// @noframes     true
// @grant        unsafeWindow
// @grant        GM_notification
// @grant        window.focus
// ==/UserScript==

(function () {
    'use strict';
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

    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const homeUrl = `https://www.samrela.com/student/class_myClassList.do?type=1&menu=myclass&?t=${new Date().getTime()}`;
    const timedTask = setInterval(() => {
        try {
            if($('.ad_prompt_main').length>0){
                location.href = '/';
            }
            if(location.pathname == "/" || location.pathname == "/index.html"){
                const loginName = $.trim($('#loginName').text());
                if(loginName && loginName !="学员,您好！"){
                    localStorage.setItem('loginName',loginName);
                    location.href = homeUrl;
                }
            }
            // 进入课程详情页
            if (location.pathname == "/student/class_detail_course.do") {
                const coursesQuantity = $('.hoz_accordion .hoz_course_row').length;
                if (coursesQuantity > 0) {
                    let hrefs = [];
                    let completeNum = 0;
                    for (let index = 0; index < coursesQuantity; index++) {
                        const element = $('.hoz_accordion .hoz_course_row').eq(index);
                        if (element) {
                            const percent = $.trim(element.find('.h_pro_percent').text());
                            if (percent === '100.0%') {
                                completeNum++;
                            } else {
                                let coursesID = element.find('.btn_group .hover_btn').attr('onclick').replace(/[^\d]/ig, '');
                                if(coursesID){
                                    hrefs.push(`/portal/play.do?id=${coursesID}&t=${new Date().getTime()}`);
                                }
                            }
                        }
                    };
                    document.title = `${completeNum}/${coursesQuantity}`;
                    W.sessionStorage.setItem('课程进度',`${completeNum}/${coursesQuantity}`);
                    if (completeNum === coursesQuantity) {
                        clearInterval(timedTask);
                        notification('提示', '已完成所有课程');
                    }
                    if(hrefs.length>0){
                        location.href = hrefs[0];
                    }
                }
            };
            //进入学习页面
            if (location.pathname == "/student/class_myClassList.do") {
                if($('#year').val() !="0"){
                   $('#year').val("0").trigger('change');
                   clearInterval(timedTask);
                }else{
                  var num = 0;
                    var special = $('.join_special_list').length;
                    if(special>0){
                        let hrefs = [];
                        for (let index = 0; index < special; index++){
                            const element = $('.join_special_list').eq(index);
                            var status1 = $.trim($(element).find('.join_status:eq(0)').text())
                            var status2 = $.trim($(element).find('.join_status:eq(1)').text())
                            var href = $(element).find("a:contains('进入学习')").attr('href');
                            if(status1=="进行中" && status2=="未结业" && href){
                                hrefs.push(href);
                            }else{
                                num++;
                            }
                        };

                        W.sessionStorage.setItem('总进度',`${num}/${special}`);
                        if(hrefs.length>0){
                            //console.log(hrefs)
                            location.href = hrefs[0];
                        }else{
                            if($(".studentPage>a:contains('>')").attr('onclick')){
                               $(".studentPage>a:contains('>')").trigger('click');
                            }
                        }
                    }else{
                      location.href = '/';
                    }
                }

            };
            //学习页面
            if (location.pathname == "/portal/play.do") {
                var zjd = W.sessionStorage.getItem('总进度');
                var kcjd = W.sessionStorage.getItem('课程进度');
                //点击 继续学习
                if ($('.continue .user_choise').is(":visible") && ($('.continue .user_choise').text() == "继续学习"||$('.continue .user_choise').text() == "开始学习")) {
                    $('.continue .user_choise').trigger('click');
                    //$('#mask,.continue').remove();
                };
                var li_num = $('.first_list>li').length;
                var current = $('.first_list .current').length;
                if(li_num==0){
                    location.href = homeUrl;
                    return;
                }
                if(current===0){
                    //$('.first_list>li').eq(0).find('.first_title').trigger('click');
                };

                var video = document.querySelector("#course_player");
                if(video.nodeName==="VIDEO"){
                    //video.playbackRate = 4.0; //    设置播放速度
                    let num = video.currentTime;
                    let total = video.duration;
                    let percentage = Math.round(num / total * 1000) / 10;
                    document.title = `${percentage}/100 [${zjd}] [${kcjd}]`;
                    var nextDom = $('.first_list .current').next();
                    if(percentage==100 && nextDom.length===0){
                        location.href = homeUrl;
                    }
                };

            };

        } catch (error) {
            console.log(error);
        }
    }, 1500);

    if (location.pathname == "/portal/play.do") {
        notification('提示', `播放视频【${$('#course_name').val()}】`);
        //$('body').append(`<audio src="https://up-1254176432.cos.ap-shanghai.myqcloud.com/test.mp3" loop controls autoplay></audio>`)
        const clickDom = setInterval(()=>{
            var video = document.querySelector("#course_player");
            if(video){
                if(video.nodeName==="VIDEO"){
                    video.play();
                }
            }else{
                location.href = homeUrl;
            }
        },1000);
    }
    function notification(title, text) {
        if(GM_notification){
            GM_notification(localStorage.getItem('loginName'), title, `https://www.samrela.com/favicon.ico`, _ => {
                window.focus();
            })
        }
    }
})();

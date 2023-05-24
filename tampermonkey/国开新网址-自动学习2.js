// ==UserScript==
// @name         国开新网址-自动学习
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @icon         https://lms.ouchn.cn/static/assets/images/favicon-ouchn-d8ff1235.ico
// @include      https://*.ouchn.cn/course/*
// @include      https://*.ouchn.cn/user/courses*
// @include      https://menhu.pt.ouchn.cn/site/ouchnPc/index
// @connect      wjjw.cmjnu.com.cn
// @grant        unsafeWindow
// @grant        GM_log
// ==/UserScript==

(function () {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
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
    const timedTask = setInterval(() => {
        const { pathname,hash } = W.location;
        if(pathname==="/user/courses"&&hash==="#/"){
            $('.courses .course').each(function (index, element) {
                // element == this
                var course = $(element).attr('data-course-id');
                if(course && $(element).find(`#schedule-${course}`).length===0){
                    $(element).find('.detail-row').after(`
                        <div id="schedule-${course}" style="color: red;">查询进度中</div>
                    `);
                    getSchedule(course)
                }
            });
        }
        $('video').each(function (index, element) {
            $(element).css({
                width:"50%",
                height:"50%",
            })
            $(element).attr({
                'controls':true,
                'autoplay':true,
                'muted':true,
            })
            $(element)[0].play();
            $(element)[0].playbackRate = 16;
            $('div.mvp-controls-left-area > button>.mvp-fonts-play').click();
        });

        if($('#course-section .font-toggle-all-collapsed').length>0){
            $('#course-section').click();
        }
    },1000);
    function getSchedule(id){
        $.get(`/api/course/${id}/my-completeness`,function (res) {
            if(res){
                $(`#schedule-${id}`).html(`完成${res.study_completeness}%  ${res.completed_result.total_completed}/${res.completed_result.total_activities}`).css('color','blue');
            }
        });
    };
    W.addEventListener("hashchange", start);
    function start() {
        const { pathname,hash } = W.location;

        //课程页面
        if (/\/course\/\d+\/ng/.test(pathname) && hash==="#/"){
            $('#AutoLearn').show();
        }else{
            $('#AutoLearn').hide();
        };
        if (/\/course\/\d+\/ng/.test(pathname) && hash==="#/" && $('#AutoLearn').length==0) {
            console.clear();
            document.body.insertAdjacentHTML('beforeEnd', `
            <div id="AutoLearn" >
              <button onclick="Surplus(this)" type="button" class="button button-green small gtm-label" style="position: fixed;bottom: 50px;left: 50%;transform: translateX(-50%);z-index:999;">视频课程</button>
              <button onclick="location.href='/user/courses#/'" type="button" class="button button-green small gtm-label" style="position: fixed;bottom: 100px;left: 50%;transform: translateX(-50%);z-index:999;">我的课程</button>
              <button onclick="AutoLearn(this)" type="button" class="button button-green small gtm-label" style="position: fixed;bottom: 150px;left: 50%;transform: translateX(-50%);z-index:999;">开始</button>
            </div>
            `);
            function toS(str){
                var arr = str.split(':').map(e=>+e);
                return (arr[0]*60*60)+(arr[1]*60)+(arr[2])
            }
            W.Surplus = async function (obj) {
                var array = [];
                $('[id^="learning-activity-"]').each(function (index, element) {
                    var id = $(element).attr('id').replace('learning-activity-','')
                    var videoDome = $(element).find('.activity-summary[ng-switch-when="online_video"]');
                    videoDome.each(function (vindex, velement) {
                       var time = $(velement).find('.activity-attribute .attribute-value').text();
                       var part = $(velement).find('.activity-operations-container .completeness.part');
                       var none = $(velement).find('.activity-operations-container .completeness.none');
                       if((part.length>0||none.length>0) && id){
                        array.push({
                            id,
                            time:toS(time)
                        })
                       }
                    });
                });
                console.log(array);
                if(array.length>0){
                    const $dom = obj;
                    $dom.disabled = true;
                    $dom.innerHTML = `Loading`;

                    for (let index = 0; index < array.length; index++) {
                        setTimeout(() => {
                            const id = array[index].id;
                            const time = array[index].time;
                            endOfVideo(id,time);
                            if((index+1)>= array.length){
                                setTimeout(() => {
                                   if(window.confirm("已完成！\n确定去《我们课程》？")){
                                    location.href="/user/courses#/";
                                   }else{
                                    location.reload();
                                   }
                                }, 1000);
                            }
                        },index*100)
                    }

                }else{
                    alert('视频课程已完成')
                }
            }
            W.AutoLearn = async function (obj) {
                GM_log(obj);
                const $dom = obj;
                const courseId = $('#courseId').val();
                const module_ids = [];
                $('.modules>.module').each(function (index, el) {
                    module_ids.push($(el).attr('id').replace('module-', ''));
                })
                console.log(module_ids);
                const types = `learning_activities,exams,classrooms,live_records,rollcalls`;
                // const types = `learning_activities,classrooms,live_records`;
                if (isObjEmpty(module_ids) || isObjEmpty(courseId)) {
                    alert('请稍后再试');
                    return;
                }
                $dom.disabled = true;
                $dom.innerHTML = `Loading`;
                const lockArr = [];
                $.ajax({
                    type: "get",
                    async: true,
                    url: `/api/course/${courseId}/all-activities?module_ids=[${module_ids.join(',')}]&activity_types=${types}&no-loading-animation=true`,
                    dataType: "json",
                    success: function (res) {
                        const activities = res.learning_activities || [];
                        if (activities.length > 0) {
                            for (let index = 0; index < activities.length; index++) {
                                setTimeout(() => {
                                    const element = activities[index];
                                    //查看页面
                                    autoRead(element.id);

                                    //文件
                                    const uploads = element.uploads || [];
                                    var duration = 999999;
                                    uploads.forEach(el => {
                                        autoUpload(element.id, el.id);
                                        var videos = el.videos || [];
                                        if(videos.length>0){
                                            duration = videos[0].duration;
                                        }
                                    });
                                    //发帖
                                    if(element.completion_criterion_key==="submitted" && element.type==="forum"){
                                        autoTopics(element.id);
                                    };
                                    //锁
                                    const prerequisites = element.prerequisites || [];
                                    prerequisites.forEach(el => {
                                        el.duration = duration;
                                        lockArr.push(el);
                                        //观看视频
                                        endOfVideo(el.activity_id,duration);
                                    });
                                    if(prerequisites.length===0){
                                        //观看视频
                                        endOfVideo(element.id,duration);
                                    };
                                    if((index+1)>=activities.length){
                                        setTimeout(() => {
                                            if(window.confirm("已完成！\n确定去《我们课程》？")){
                                                location.href="/user/courses#/";
                                               }else{
                                                location.reload();
                                               }
                                        }, 2000);
                                    }
                                },index*100)
                            };

                        } else {
                            $dom.disabled = false;
                            $dom.innerHTML = `已完成`;
                        }
                    },
                    error: function (err) {
                        $dom.disabled = false;
                        $dom.innerHTML = `请求失败`;
                    }
                });
            }

        }
    };
    start();
    //阅读
    W.autoRead = id => {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: `/api/course/activities-read/${id}`,
            async: true,
            data: JSON.stringify({
                upload_id: 0
            }),
        });
    }
    //观看视频
    W.endOfVideo = (id,end=999999) => {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: `/api/course/activities-read/${id}`,
            async: true,
            data: JSON.stringify({
                start: 0,
                end:end
            }),
            // success: function(response){
            //     if(response.data){
            //         console.log(response.data);
            //     }
            // }
        });
    }
    //下载文件
    W.autoUpload = (id, upload_id = new Date().getTime()) => {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: `/api/course/activities-read/${id}`,
            async: true,
            data: JSON.stringify({
                upload_id
            }),
        });
    }
    //发表讨论 10000212990
    W.autoTopics = (id) => {
        $.ajax({
            type: "GET",
            url: `/api/activities/${id}`,
            async: true,
            success: function (res){
                var category_id = res.topic_category_id;
                if(category_id){
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: `/api/topics`,
                        async: true,
                        data: JSON.stringify({
                            category_id,
                            content:'好好学习'+document.title.split(' - ')[0],
                            title:'好好学习'+document.title.split(' - ')[0],
                            uploads:[]
                        }),
                    });
                }

            }
        });
    }
})();
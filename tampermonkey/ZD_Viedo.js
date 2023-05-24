// ==UserScript==
// @name         ZD_Viedo
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  QQ:760635994
// @author       You
// @match        **://ols.v.zzu.edu.cn/**
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAJZJREFUOE+90zEOQUEQxvHfu4qSG7iHTsRR9I5AIRHN0ykplBpnEL04w5MVkg0vL1mTmHJ35//NfjNTCUYVzJcAfYww6IDdMMf1800CnHHBtgOQRGY8BfPopYOm5aKNVb9EdphigmEp4I4xjlijLgXssczKa0oByafcq/8DDlhEvvA28YQVNr948NXG8CCFRzm0T+FtfAAryS5NxJZN/AAAAABJRU5ErkJggg==
// @noframes     true
// @grant        unsafeWindow
// @grant        GM_notification
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
                        <button onclick="Start()" id="StartButton" type="button" style="-webkit-appearance: none;position: fixed;bottom: 100px;left: 50%;transform: translateX(-50%);z-index:9999999;padding: 5px 20px;border: 1px solid #AAA;background-image: linear-gradient(to bottom,#fff 0,#F8F8F8 100%);background-repeat: repeat-x;border-radius: 2px;">开始</button>
                        <video style="position: fixed;top: 0;left: 0;width: 220px;z-index: 9999999;" src="http://123.15.57.19/codplay/003402/h/0034021001.mp4" loop muted autoplay controls></video>
                      <div>`);
            clearInterval(timedTaskAppendHtml);
        }
    }, 500);

    W.Start = Start;
    async function Start() {
        // console.clear();
        const $button = document.querySelector('#StartButton');
        if ($button) {
            $button.disabled = true;
            $button.innerText = '进行中...';
        };
        const CourseList = [];
        const GetCourseList = await Ajax('GET', `/s/appCourse/queryMyCourseList?s=${new Date().getTime()}`);
        if (GetCourseList.code === 0 && !isObjEmpty(GetCourseList.data)) {
            var list = GetCourseList.data[0].list;
            const GetStates = await Ajax('GET', `/s/appCourse/queryCourseTestScore?s=${new Date().getTime()}`);
            if (GetStates.code == 0 && !isObjEmpty(GetStates.data)) {
                const StatesObj = GetStates.data[0];
                list.forEach(element => {
                    const Obj = StatesObj[element.courseCode];
                    if (!isObjEmpty(Obj) && (element.status === "学习中" || element.status === "未学习") && element.totalHour > 0 && Obj.hasLearningTotal < Obj.courseTotal) {
                        Obj.status = element.status;
                        Obj.totalHour = element.totalHour;
                        Obj.courseName = element.courseName;
                        CourseList.push(Obj);
                    }
                });
            } else {
                Notify(`<span style="color:red">ajax1</span>`);
            }
        } else {
            Notify(`<span style="color:red">ajax2</span>`);
        };
        if (!isObjEmpty(CourseList)) {
            const FirstInfo = CourseList[0];
            console.log(`一共${CourseList.length}门未完成`);
            const courseCode = FirstInfo.courseCode; //课程id
            const Course = await Ajax('GET', `/s/appCourseContent/getContentByCourseCode?courseCode=${courseCode}`);
            if (Course.code === 0 && !isObjEmpty(Course.data)) {
                const list = [];
                const array = Course.data || [];
                array.forEach(el1 => {
                    const children = el1.children || [];
                    children.forEach(el2 => {
                        if (el2.contentType === "视频" && el2.status != "已完成") {
                            list.push(el2);
                        }
                    });
                });
                console.log(`[${courseCode}]-[${FirstInfo.courseName}]-[点播:${FirstInfo.hasLearningTotal}/${FirstInfo.courseTotal}]-[测试:${FirstInfo.hasTestTotal}/${FirstInfo.testTotal}]-[${list.length}个视频未完成]`);
                if (!isObjEmpty(list)) {
                    const FirstVideo = list[0];
                    console.log(`[正在学习]-[${FirstVideo.title}]-[${FirstVideo.status}]`);
                    const contentCode = FirstVideo.contentCode; //视频章节id
                    if (!isObjEmpty(courseCode) && !isObjEmpty(contentCode)) {
                        setSchedule(courseCode, contentCode, FirstVideo.lastPosition, FirstVideo.status);
                    } else {
                        Notify(`<span style="color:red">获取课程详细失败1</span>`);
                        setTimeout(() => {
                            Start();
                        }, 10 * 1000);
                    }
                } else {
                    Notify(`<span style="color:red">获取课程详细失败2</span>`);
                    setTimeout(() => {
                        Start();
                    }, 10 * 1000);
                }
            } else {
                Notify(`<span style="color:red">ajax3</span>`);
            };
        } else {
            const $button = document.querySelector('#StartButton');
            if ($button) {
                $button.disabled = false;
                $button.innerText = '重新开始';
            };
            GM_notification({
                title: document.querySelector("#root span[class^='header_name']").innerText,
                text: `🔊课程点播已完成`,
                image: document.querySelector("#root img[class^='header_logo']").src,
                highlight: true, //是否突出显示发送通知的选项卡
                timeout: 0, //通知将被隐藏的时间（0 =禁用）
                onclick: _ => {
                    window.focus();
                },
            });
        }
    };

    //发送进度
    async function setSchedule(courseCode, contentCode, lastPosition, status) {
        //[0802]-[0802031010]
        const position = isNaN(parseFloat(lastPosition || 0)) ? 0 : parseFloat(lastPosition || 0); //进度
        const percentage = parseFloat(status || 0) / 100; //进度

        console.log(`[${courseCode}]-[${contentCode}]-[${position}]-[${percentage}]`);
        var msg = [];
        for (let index = 0; index < 15; index++) {
            msg.push({
                bfbl: (position + index * 10) + "",
                dqwz: (percentage + index * 0.01) + "",
                kch: courseCode,
                zyh: contentCode,
                type: index === 0 ? "04" : "01",
            });
        };
        const message = await Ajax('POST', `/s/message/send`, JSON.stringify({ msg }), {
            "content-type": "application/json;charset=UTF-8",
            "accept-language": "zh-CN,zh;q=0.9",
            "accept": "application/json, text/plain, */*"
        });
        console.log('message', message);
        if (W['TimingTask']) {
            clearInterval(W['TimingTask']);
            W['TimingTask'] = null;
        };
        W['Second'] = 0;
        W['TimingTask'] = setInterval(() => {
            W['Second']++;
            document.title = second(W['Second']);
            if (W['Second'] >= 2 * 60) {
                clearInterval(W['TimingTask']);
                W['TimingTask'] = null;
                Start();
            };
        }, 1000);
    };
    //通知
    function Notify(html) {
        var NotifyHtml = document.querySelector('#Notify');
        if (!NotifyHtml) {
            document.body.insertAdjacentHTML('beforeEnd', `<div style="position: fixed;max-width: 50vw;top: 0;left: 50%;background: #000;color: #fff;transform: translateX(-50%);padding: 10px 15px;border-radius: 0 0 10px 10px;font-size: 12px;z-index: 9999999;text-align: center;word-wrap: break-word;word-break: break-all;" id="Notify">${html}</div>`);
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
                        Start();
                        reject(xhr.status);
                    }
                }
            }
            xhr.send(body);
        })
    };

})();
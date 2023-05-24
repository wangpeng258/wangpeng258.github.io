// ==UserScript==
// @name         郑大【在线视频】
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  QQ:760635994
// @author       You
// @match        **://ols.v.zzu.edu.cn/**
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAJZJREFUOE+90zEOQUEQxvHfu4qSG7iHTsRR9I5AIRHN0ykplBpnEL04w5MVkg0vL1mTmHJ35//NfjNTCUYVzJcAfYww6IDdMMf1800CnHHBtgOQRGY8BfPopYOm5aKNVb9EdphigmEp4I4xjlijLgXssczKa0oByafcq/8DDlhEvvA28YQVNr948NXG8CCFRzm0T+FtfAAryS5NxJZN/AAAAABJRU5ErkJggg==
// @updateURL    https://cdn.jsdelivr.net/gh/wangpeng1478/wangpeng1478.github.io/tampermonkey/%E9%83%91%E5%A4%A7-%E5%9C%A8%E7%BA%BF%E8%A7%86%E9%A2%91.js
// @downloadURL  https://cdn.jsdelivr.net/gh/wangpeng1478/wangpeng1478.github.io/tampermonkey/%E9%83%91%E5%A4%A7-%E5%9C%A8%E7%BA%BF%E8%A7%86%E9%A2%91.js
// @noframes     true
// @grant        unsafeWindow
// @grant        GM_notification
// @grant        window.focus
// ==/UserScript==

(function () {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
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

    const timedTaskViedo = setInterval(() => {
        try {
            //进入课程点播
            if (W.location.hash.includes('#/index/online')) {
                W.location.href = `/xsd/#/index/dibble`;
            };

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
                    location.href = "http://ols.v.zzu.edu.cn/xsd/#/index/dibble";
                }
            }

            //选择播放视频
            const playlist = [];
            const $player = document.querySelector('#player-con');
            if (isObjEmpty($player)) {
                const $videoList = document.querySelectorAll(`.ant-tree-child-tree li[class^='video_']`);
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
                    if (percentage >= 85) {
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
                            W.location.href = `/xsd/#/index/dibble`;
                        }
                    }
                }

            }
            W['viedoPlay'] = viedoPlay;
        } catch (error) {
            console.log(error);
        }
    }, 2000);
})();
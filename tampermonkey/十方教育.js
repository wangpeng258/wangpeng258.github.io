// ==UserScript==
// @name         十方教育
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @icon         https://lms.ouchn.cn/static/assets/images/favicon-ouchn-d8ff1235.ico
// @include      https://study.tenclass.com/shop/**
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    setTimeout(() => {
        var downloadBut = document.querySelector('#downloadBut');
        if(!downloadBut){
           document.body.insertAdjacentHTML('beforeEnd', `<button onclick="downloadVideo()" style="z-index: 9999;position: fixed;top: 6vh;left: 50%;transform: translateX(-50%);font-size: 15px;padding: 3px 10px;" type="button">下载视频</button>`);
        };

    }, 500);

    window['downloadVideo'] = function(){
       const video = document.querySelector("video");
       if(video && video.src){
            console.log('video',video.src);
            if(video.src.includes('.mp4')){
                window.open(video.src);
            }else{
                alert('当前视频类型无法下载！')
            }
       }else{
         alert('没有找到视频地址,请稍后再试！')
       }
    }
})();
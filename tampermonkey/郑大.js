// ==UserScript==
// @name         郑大
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        **://ols.v.zzu.edu.cn/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zzu.edu.cn
// @updateURL    https://cdn.jsdelivr.net/gh/wangpeng1478/wangpeng1478.github.io/tampermonkey/%E9%83%91%E5%A4%A7.js
// @downloadURL  https://cdn.jsdelivr.net/gh/wangpeng1478/wangpeng1478.github.io/tampermonkey/%E9%83%91%E5%A4%A7.js
// @noframes     true
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    W.addEventListener("hashchange", Start);
    Start();
    function Start() {
        if (W.location.hash === '#/index/online') {
            if (!document.querySelector("#myiframe")) {
                document.body.insertAdjacentHTML('beforeEnd', `
                    <div style="display: flex;align-items: center;" id="myiframe">
                       <iframe src="/xsd/#/index/dibble" style="display: block;width: 50vw;height: 100vh;border: none;"></iframe>
                       <iframe src="/xsd/#/index/testdire" style="display: block;width: 50vw;height: 100vh;border: none;"></iframe>
                    </div>
                    <style>
                      #root{
                         display: none !important;
                      }
                    </style>
                `);
            }
        };
        if (W.location.hash === '#/index/online') {
            if (self != top) {
                top.location = '/xsd/#/login';
            }
        }
    };
    // Your code here...
})();
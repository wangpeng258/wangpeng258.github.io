// ==UserScript==
// @name         微信智能对话
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://openai.weixin.qq.com/webapp/**?robotName=**&token=**
// @icon         https://res.wx.qq.com/mmspraiweb_node/dist/static/logo/logo180.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.body.insertAdjacentHTML('beforeEnd', `
        <style>
            .input-area,
            .tip-brand{
                display: none !important;
            }
            .debug-box-card .userb{
                white-space: pre-line !important;
            }
        </style>
    `);
    // Your code here...
})();
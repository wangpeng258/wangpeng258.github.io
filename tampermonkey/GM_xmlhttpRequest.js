// ==UserScript==
// @name         GM_xmlhttpRequest
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://yplm.cn/login.htm*
// @icon         http://jxsc.mwljy.com/education/static/img/mo.png
// @require      https://cdn.jsdelivr.net/npm/sweetalert
// @connect      api-5gmc47ob67d0c1ea-1254176432.ap-shanghai.app.tcloudbase.com
// @noframes     true
// @grant        GM_log
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    document.body.insertAdjacentHTML('beforeEnd', '<button onclick="startAsk(this)" type="button" style="-webkit-appearance: none;position: fixed;bottom: 100px;left: 50%;transform: translateX(-50%);z-index:999;padding: 5px 20px;border: 1px solid #AAA;background-image: linear-gradient(to bottom,#fff 0,#F8F8F8 100%);background-repeat: repeat-x;border-radius: 2px;">GM_xmlhttpRequest</button>');
    W.startAsk = async function (obj) {
        const res = await setAnswer();
        GM_log('res', res);
    };

    //设置答案
    async function setAnswer() {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: "POST",//GET, HEAD, POST的其中之一
                url: `https://api-5gmc47ob67d0c1ea-1254176432.ap-shanghai.app.tcloudbase.com/mydb/set?suject=大学英语&notKey=name`,
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                responseType: 'json',
                anonymous: true,//不发送带有请求的Cookie（请参阅 fetch 说明）
                data:JSON.stringify([
                    {
                        a: "1",
                    }
                ]),
                onload: (xhr) => {
                    const res = xhr.response;
                    resolve(res)
                },
                onerror: (err) => {
                    console.error(err);
                    resolve()
                }
            })
        })

    };

})();
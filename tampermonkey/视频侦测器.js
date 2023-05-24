// ==UserScript==
// @name         视频侦测器
// @version      0.0.1
// @license      MIT
// @description  视频侦测器，查找网页中的视频链接
// @author       wpp
// @match        *://*/*
// @grant        none
// @license      GPL-3.0
// ==/UserScript==

(function () {
    'use strict';
    window.addEventListener("load", _ => {
        const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
        const videoList = []; //视频列表
        const currentSrcArr = [];
        const timeout = 1000; // 1s
        setInterval(() => {
            try {
                document.querySelectorAll("video").forEach(element => {
                    const url = element.currentSrc || element.src;
                    if (element && url && !videoList.includes(url) && !url.includes('blob:')) {
                        videoList.push(url);
                        currentSrcArr.push({
                            url,
                            name: element.nodeName,
                        });
                        console.log('videoList', videoList);
                        AppendButton();
                    }
                });
            } catch (error) {

            }
        }, timeout);

        function AppendButton() {
            const $button = document.querySelector('#videoDownloadButton');
            $button && $button.remove();
            document.body.insertAdjacentHTML('beforeEnd', `<button onclick="OpenDownloadBox()" id="videoDownloadButton" type="button" style="-webkit-appearance: none;position: fixed;top:0;left: 50%;transform: translateX(-50%);z-index:999999;padding: 5px 10px;border: none;background-color: red;color: #fff;font-size: 14px;">链接${videoList.length}</button>`);
        };
        function OpenDownloadBox() {
            const $DownloadBox = document.querySelector('#DownloadBox');
            $DownloadBox && $DownloadBox.remove();
            let html = '';
            currentSrcArr.forEach(item => {
                const { url, name } = item;
                html += `
                <div style="display: flex;justify-content: center;align-items: center;margin: 10px 0;">
                    <input type="text" onclick="this.select()" value="${url}" style="outline: none;-webkit-appearance: none;margin: 0 10px 0 0;background: #eee;padding: 2px 5px;border: none;font-size: 13px;flex: 1;width: 166px;" readonly>
                    <button onclick="CopyTextToClipboard('${url}')" type="button" style="-webkit-appearance: none;padding: 2px 5px;border: none;background-color: blue;color: #fff;border-radius: 2px;font-size: 12px;">复制</button>
                    <a href="${url}" target="_blank" rel="noopener noreferrer" style="font-size: 12px;padding: 3px 8px;">${name}</a>
                </div>
            `
            });
            document.body.insertAdjacentHTML('beforeEnd', `<div id="DownloadBox">
                <div style="position: fixed;top: 50%;left: 50%;transform: translate(-50%,-50%);z-index: 99999999;background: #fff;padding: 15px;min-width: 280px;border-radius: 10px;max-height: 80vh;overflow: auto;">
                    ${html}
                    <button onclick="DownloadBox.remove()" type="button" style="-webkit-appearance: none;padding: 2px 5px;border: none;background-color: red;color: #fff;border-radius: 2px;font-size: 12px;margin: 10px auto 0 auto;display: block;">关闭</button>
                </div>
                <div style="z-index: 9999999;position: fixed;left: 0;top: 0;width:100vw;height:100vh;opacity: .8;background: #000;"><div/>
            <div>`);
        };

        function CopyTextToClipboard(text) {
            var copyFrom = document.createElement("textarea");
            copyFrom.textContent = text;
            document.body.appendChild(copyFrom);
            copyFrom.select();
            document.execCommand('copy');
            copyFrom.blur();
            document.body.removeChild(copyFrom);
            alert('复制成功')
        }
        window['OpenDownloadBox'] = OpenDownloadBox;
        window['CopyTextToClipboard'] = CopyTextToClipboard;
    });
})();
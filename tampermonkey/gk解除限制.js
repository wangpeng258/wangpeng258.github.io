// ==UserScript==
// @name         解除限制
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  解除限制
// @author       You
// @include      https://**
// @include      http://**
// @license      AGPL License
// @antifeature  none
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    setInterval(() => {
        // 解除切屏限制
        window.onblur = null;
        window.onblur = function() {console.debug(1);}

        // 解除快捷键操作屏蔽
        window.onkeyup = null;
        window.onkeydown = null;
        window.onkeyPress = null;
        document.onkeyup = null;
        document.onkeydown = null;
        document.onkeyPress = null;
        document.body.onkeyup = null;
        document.body.onkeydown = null;
        document.body.onkeyPress = null;
        // onkeyup = null;
        // onkeydown = null;
        // onkeyPress = null;

        // 解除复制粘贴限制
        window.oncopy = null;
        window.onpaste = null;
        document.oncopy  = null;
        document.onpaste  = null;
        document.body.oncopy  = null;
        document.body.onpaste  = null;
        // oncopy  =
        // onpaste = null;
    }, 500);
})();

// ==UserScript==
// @name         文档
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://jxsc.mwljy.com/*
// @icon         http://jxsc.mwljy.com/education/static/img/mo.png
// @require      https://cdn.bootcdn.net/ajax/libs/sweetalert/2.1.2/sweetalert.min.js
// @noframes     true
// @grant        GM_log
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_setClipboard
// @grant        GM_info
// @grant        unsafeWindow
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_notification
// @grant        window.close
// @grant        window.focus
// @compatible   firefox
// @compatible   chrome
// @compatible   opera safari edge
// @compatible   safari
// @compatible   edge
// @antifeature  referral-link 此提示为GreasyFork代码规范要求含有查券功能的脚本必须添加，实际使用无任何强制跳转，代码可查，请知悉。

// ==/UserScript==

(function () {
    'use strict';

    // https://www.cnblogs.com/grubber/p/12560522.html  tampermonkey文档地址
    // https://www.sweetalert.cn/   sweetalert文档

    // @name                        脚本的名称
    // @namespace                   脚本的命名空间。
    // @version                     脚本版本。这用于更新检查，以防脚本未从userscript.org安装，或者 TM 检索脚本元数据时出现问题
    // @author                      脚本作者。
    // @description                 一个简短的重要描述
    // @icon                        图标
    // @match        http://*       匹配单个
    // @include      http://*       匹配多个 该脚本应运行的页面。允许多个标记实例 @include不支持 URL 哈希参数
    // @noframes                    此标记使脚本在主页上运行，但不是在 iframe 上运行。
    // @exclude                     排除 URL
    // @require                     远程加载 指向在脚本本身开始运行之前加载并执行的JavaScript文件
    // @updateURL                   用户脚本的更新 URL。注意：需要@version标记才能使更新检查正常工作。
    // @downloadURL                 定义当检测到更新时将从其中下载脚本的URL。如果使用none值，则不会执行更新检查。
    // @supportURL                  定义用户可以报告问题和获得个人支持的 URL。

    GM_log('unsafeWindow',unsafeWindow);
    const appId = `Tampermonkey_${Math.random().toString(16).substring(2)}`;
    //最大的z-index
    const getzIndexMax = _=>{
        const zIndexArr = [];
        (document.all || document.querySelectorAll("*")).forEach(el=>{
            const zIndex = window.getComputedStyle(el, null).zIndex;
            zIndexArr.push(zIndex==='auto'?0:Number(zIndex))
        })
        return Math.max.apply(null,zIndexArr)
    }
    const styleCss = `
          #${appId}{
            position: fixed;
            top: 50%;
            left: 1em;
            transform: translatey(-50%);
            z-index:${getzIndexMax()+1};
            width: 200px;
            background-color: #fff;
            border: 1px solid #f00;
            padding: 15px;
          }
    `;
    GM_addStyle(styleCss);//将给定的样式添加到文档并返回注入的样式元素。
    document.body.insertAdjacentHTML('beforeEnd', `
        <div id="${appId}">
            <button data-event="setValue" type="button">setValue</button>
            <button data-event="openInTab" type="button">openInTab</button>
            <button data-event="xmlhttpRequest" type="button">xmlhttpRequest</button>
            <button data-event="download" type="button">download</button>
            <button data-event="notification" type="button">notification</button>
            <button data-event="setClipboard" type="button">setClipboard</button>
        </div>
    `);
    document.querySelector(`#${appId}>button[data-event="setValue"]`).addEventListener('click',_=>{
        GM_setValue(`test`, new Date().getTime());
        GM_log(`test`,GM_getValue(`test`))
        GM_deleteValue('time');
    })
    document.querySelector(`#${appId}>button[data-event="openInTab"]`).addEventListener('click',_=>{
        GM_openInTab('http://jxsc.mwljy.com/education/a/sys/user/info', {
            active:true, //决定是否应对新选项卡进行聚焦，
            insert:true, //在当前选项卡之后插入新选项卡
            SetParent:true, //使浏览器在关闭时重新聚焦当前选项卡，然后
            incognito:false, //选项卡在隐身模式/专用模式窗口中打开。
        })
    })
    document.querySelector(`#${appId}>button[data-event="xmlhttpRequest"]`).addEventListener('click',_=>{
        GM_xmlhttpRequest({
            method:"POST",//GET, HEAD, POST的其中之一
            url:"/education/a/sys/office/treeData",
            headers:{},
            data:{
                t:new Date().getTime()
            },
            responseType:'json', //blob, json中的一个
            anonymous:false,//不发送带有请求的Cookie（请参阅 fetch 说明）
            onload:(res)=>{
                GM_log(res)
            },
            onerror:(err)=>{
                GM_log(err)
            }
        })
    })
    document.querySelector(`#${appId}>button[data-event="download"]`).addEventListener('click',_=>{
        // GM_download(`http://jxsc.mwljy.com/education/static/img/logo.png`, `logo_${new Date().getTime()}.png`)
        GM_download({
            url:`http://jxsc.mwljy.com/education/static/img/logo.png`,
            name:`logo_${new Date().getTime()}.png`,
            headers:{},
            saveAs:true,//布尔值，显示一个另存为对话框
            onerror:err=>{
                GM_log(err)
            },
            onload:res=>{
                GM_log(res)
            },
            onprogress:res=>{
                GM_log('progress',res)
            },
        })
    })

    document.querySelector(`#${appId}>button[data-event="notification"]`).addEventListener('click',_=>{
        GM_notification({
            title:`测试标题`,
            text:`现在时间-${new Date().toLocaleString()}`,
            image:`http://jxsc.mwljy.com/education/static/img/mo.png`,
            highlight:true, //是否突出显示发送通知的选项卡
            timeout:0,//通知将被隐藏的时间（0 =禁用）
            ondone:_=>{
                GM_log('关闭时',_)
            },
            onclick:_=>{
                window.focus();
                GM_log('单击',_)
            },
        })
    })

    document.querySelector(`#${appId}>button[data-event="setClipboard"]`).addEventListener('click',_=>{
        var data = prompt('请输入复制文本',new Date().toLocaleString())
        GM_log(data)
        GM_setClipboard(data, {
            type:'text',
            mimetype:'text/plain'
        })
    })


    function xmlhttpRequest(e){
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method:e.method||"POST",//GET, HEAD, POST的其中之一
                url:e.url,
                headers:e.headers||{},
                data:e.data||{},
                responseType:e.responseType||'json', //blob, json中的一个
                anonymous:e.anonymous||false,//不发送带有请求的Cookie（请参阅 fetch 说明）
                onload:(res)=>{
                    if(res.status===200){
                        resolve(res.response)
                    }else{
                        reject(res.statusText)
                    }
                },
                onerror:(err)=>{
                    reject(err)
                }
            })
        })
    }

    // Your code here...
})();
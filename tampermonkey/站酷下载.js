// ==UserScript==
// @name         站酷下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @connect      www.zcool.com.cn
// @connect      img.zcool.cn
// @icon         https://static.zcool.cn/git_z/z/site/favicon.ico
// @match        https://www.zcool.com.cn/work/**
// @require      https://cdn.bootcdn.net/ajax/libs/sweetalert/2.1.2/sweetalert.min.js
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_download
// ==/UserScript==

(function() {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    try {
        setTimeout(() => {
            const NEXT_DATA = document.querySelector("#__NEXT_DATA__");
            if(NEXT_DATA){
                const json = JSON.parse(NEXT_DATA.innerHTML);
                const productImages = json.props.pageProps.data.productImages;
                console.log(json);
                console.log(productImages);
                let html = '';
                productImages.forEach((element,index) => {
                    const url = element.urlBig;
                    const name = `${new Date().getTime()}_${index}.${element.imageType}`
                    html+= `<img onclick="downloadImg('${url}','${name}')" src="${element.urlSmall}" />`
                });

                document.body.insertAdjacentHTML('afterbegin', `<button onclick="openImg()" class="openImgBut" type="button">打开图片</button>`);
                W['openImg']=()=>{
                    console.log(json);
                    var contentDom = document.createElement('div');
                        contentDom.innerHTML = `<div class="swal-img">${html}</div>`;
                    swal({
                        title:"点击图片下载",
                        content:contentDom,
                        confirmButtonText:"关闭"
                    }).then(() => {
                        swal.close();
                    })
                }
                W['downloadImg'] = (url,name)=>{
                    GM_download(url, name)
                }
            }


        }, 1000);


        GM_addStyle(`
          .openImgBut{
            position: fixed;
            bottom: 2em;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            -webkit-appearance: button;
            text-transform: none;
            -webkit-box-align: center;
            align-items: center;
            -webkit-box-pack: center;
            justify-content: center;
            border: none;
            border-radius: 8px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease 0s;
            box-sizing: border-box;
            color: rgb(34, 34, 34);
            background-color: rgb(255, 242, 0);
            padding: 10px 15px;
            line-height: 1;
         }
         .downloadImgBut{
             -webkit-appearance: button;
            text-transform: none;
            -webkit-box-align: center;
            align-items: center;
            -webkit-box-pack: center;
            justify-content: center;
            border: none;
            border-radius: 8px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease 0s;
            box-sizing: border-box;
            color: rgb(34, 34, 34);
            background-color: rgb(255, 242, 0);
            padding: 5px 10px;
            line-height: 1;
         }
         .swal-footer{
            text-align: center !important;
         }
         .swal-img{
            max-height: 70vh !important;
            overflow: auto !important;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
         }
         .swal-img>img{
           display: block;
           width: 120px;
           height: auto;
           margin: 9px;
           cursor: pointer;
         }
        `)
    } catch (error) {

    }
    // Your code here...
})();
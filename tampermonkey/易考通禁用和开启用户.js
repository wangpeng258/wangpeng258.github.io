// ==UserScript==
// @name         易考通禁用和开启用户
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://*/*/a/edu/video/eduUser/*
// @icon         http://undefined.localhost/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if($('.nav-tabs .active').text()==="学员列表列表"){
        if(location.search=="?repage"){
            location.href = `${location.origin}${location.pathname}?pageNo=1&pageSize=500`
        }else{
            var array = document.querySelectorAll('#contentTable tbody>tr')
            for (let index = 0; index < array.length; index++) {
                var element = array[index];
                var isAvalible = $.trim($(element).find('td:eq(9)').text());
                if(isAvalible=="冻结"){
                    var href =  $(element).find('td:eq(10)').find('a:eq(0)').attr('href');
                    href && (location.href = href)
                    console.log(href);
                    break;
                }
            }
        }
    }
    if($('.nav-tabs .active').text()==="学员列表修改"){
        //$('#isAvalible').val('2').trigger('change'); //冻结
        $('#isAvalible').val('1').trigger('change'); //正常
        setTimeout(() => {
            $('#btnSubmit').click()
        }, 500);
    }
    // Your code here...
})();
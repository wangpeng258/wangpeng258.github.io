// ==UserScript==
// @name         中智自动提醒发货
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://merchant.guanaitong.com/selleradmin/order/listPage
// @icon         https://merchant.guanaitong.com/selleradmin/static/favicon.ico
// @grant        unsafeWindow
// @grant        GM_notification
// @grant        window.focus
// ==/UserScript==

(function () {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const interval = 1000 * 5; //执行间隔

    $('body').append(`<label style="position: fixed;top: 1vh;left: 50%;transform: translateX(-50%);display: flex;align-items: center;line-height: 1;background-color: #f60;color: #fff;padding: 7px 10px;"><input onchange="changeTask()" id="taskCheckbox" type="checkbox" /><span style="margin-left: 5px;">开始任务</span></label>`);
    W['changeTask'] = ()=>{
        const is = $("#taskCheckbox").is(":checked");
        if(is){
            task();
        }
    }
    setInterval(() => {
        const is = $("#taskCheckbox").is(":checked");
        is && task();
    }, interval);

    let count = 0;
    async function task() {
        count++;
        //判断奇数
        if(count % 2 == 0){
            getPager($('#pageNum').val());
        }
        document.title = `运行中(${count})`;
        $.ajax({
            url: "/selleradmin/loadOrderStatistics",
            type: "POST",
            dataType: 'json',
            async: false,
            searchParam: {},
            success: function (result) {
                if (result.code === 0 && result.data) {
                    const { waitPayCount, waitStockCount, waitDeliveryCount, deliveryCount} = result.data||{};
                    // waitPayCount      //待付款
                    // waitStockCount    //待备货
                    // waitDeliveryCount //待发货
                    // deliveryCount     //已发货
                    console.clear();
                    console.log(`第${count}次运行\n\n待付款:${waitPayCount}\n待备货:${waitStockCount}\n待发货:${waitDeliveryCount}\n已发货:${deliveryCount}`);
                    if(waitStockCount>0){
                        const text = `你有${totalCount.length}条待备货，请及时处理！`;
                        try {
                            GM_notification({
                                title: `中智自动提醒发货提醒`,
                                text,
                                image: 'https://img1.guanaitong.com/grus-gfs/product/gmall-seller-mgr/by-days/2023-09-28/1488e4c3a4776780a09be9822a2a6fb0.jpg',
                                highlight: true, //是否突出显示发送通知的选项卡
                                timeout: 0, //通知将被隐藏的时间（0 =禁用）
                                onclick: _ => {
                                    // $("#taskCheckbox").prop("checked", false);
                                    window.focus();
                                },
                            })
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            }
        });
    };
})();
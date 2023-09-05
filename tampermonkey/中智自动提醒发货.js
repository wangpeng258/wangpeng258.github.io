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
    const interval = 1000 * 5;

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
            url: "/selleradmin/order/getSellerOrderListByCondition",
            type: "POST",
            dataType: 'json',
            async: false,
            searchParam: {
                "dimension": "17",
                "sortType": "2",
                "threeMonthOrder": 0,
                // "includeCloseOrder": null, //待备货
                // "orderStatus": "2", //待备货
                "includeCloseOrder": 1, //全部
                "orderStatus": '', //全部
                "pageIndex": 1,
                "pageSize": "500"
            },
            success: function (result) {
                console.log(result);
                if (result.code === 0 && result.data && result.data.totalCount > 0) {
                    const dataList = result.data.dataList||[];
                    const totalCount = dataList.filter(e=>e.tradeStatus=='2');
                    // const totalCount = dataList;
                    if(totalCount&&totalCount.length>0){
                        getPager($('#pageNum').val());
                        const text = `你有${totalCount.length}条待备货，请及时处理！`;
                        document.title = text;
                        try {
                            GM_notification({
                                title: `中智自动提醒发货提醒`,
                                text,
                                image: 'https://img1.guanaitong.com/grus-gfs/product/gmall-seller-mgr/by-days/2023-09-28/1488e4c3a4776780a09be9822a2a6fb0.jpg',
                                highlight: true, //是否突出显示发送通知的选项卡
                                timeout: 0, //通知将被隐藏的时间（0 =禁用）
                                onclick: _ => {
                                    $("#taskCheckbox").prop("checked", false);
                                    window.focus();
                                },
                            })
                        } catch (error) {
                            console.log(error);
                            $("#taskCheckbox").prop("checked", false);
                            alert(`你有${totalCount.length}条待备货，请及时处理！`);
                            window.focus();
                        }
                    }

                }
            }
        });
    };
})();
// ==UserScript==
// @name         腾讯问卷
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @icon         https://wj.qq.com/favicon.ico
// @include      https://**
// @include      http://**
// @connect      wj.qq.com
// @connect      docs.qq.com
// @noframes     true
// @grant        unsafeWindow
// @grant        GM_log
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    /**
     * 判断数据是否为空
     * @param {*} obj
     * @returns
     */
    function isObjEmpty(obj) {
        return (
            obj === undefined ||
            obj === "undefined" ||
            obj == null ||
            obj === "" ||
            obj.length === 0 ||
            (typeof obj === "object" && Object.keys(obj).length === 0)
        );
    };

    /**
     * 腾讯问卷【填写】 【https://wj.qq.com/s2/9915802/5529/】
     * @param {Number|String} surveyId    [9915802]
     * @param {Number|String} hash    [5529]
     * @param {Object} content    //内容
     */

    /*
        await setTXWJ(9915802,5529,{
            "q-1-kYV1":"张三",
            "q-2-MGDZ":"男",
            "q-3-zAxX":"13162855705"
        })
    */

    function setTXWJ(surveyId, hash, content = {}) {
        return new Promise(resolve => {
            try {
                const oldQuestions = [
                    {
                        "id": "q-1-kYV1",
                        "type": "textarea",
                        "text": "{CONTENT}"
                    },
                    {
                        "id": "q-2-MGDZ",
                        "type": "textarea",
                        "text": "{CONTENT}"
                    },
                    {
                        "id": "q-3-zAxX",
                        "type": "textarea",
                        "text": "{CONTENT}"
                    },
                    {
                        "id": "q-4-rII0",
                        "type": "textarea",
                        "text": "{CONTENT}"
                    },
                    {
                        "id": "q-5-swET",
                        "type": "textarea",
                        "text": "{CONTENT}"
                    },
                    {
                        "id": "q-6-suPX",
                        "type": "textarea",
                        "text": "{CONTENT}"
                    },
                    {
                        "id": "q-7-UOZb",
                        "type": "textarea",
                        "text": "{CONTENT}"
                    },
                    {
                        "id": "q-8-bBcv",
                        "type": "textarea",
                        "text": "{CONTENT}"
                    },
                    {
                        "id": "q-9-hgTX",
                        "type": "textarea",
                        "text": "{CONTENT}"
                    }
                ];
                const newQuestions = [];
                for (const key in content) {
                    if (Object.hasOwnProperty.call(content, key)) {
                        const element = content[key];
                        const findArr = oldQuestions.find(e => e.id === key);
                        if (findArr) {
                            newQuestions.push(JSON.parse(JSON.stringify(findArr).replace(/{CONTENT}/g, element)))
                        }
                    }
                };
                const answerSurvey = {
                    id: surveyId,
                    survey_type: 0, //调查类型
                    jsonLoadTime: Math.floor(Math.random() * (30 - 10 + 1) + 10),//json加载时间
                    time: Math.round(new Date().getTime() / 1000),
                    ua: navigator.userAgent,
                    referrer: "", //推荐人
                    uid: `${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}`,
                    uid: `${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}`,
                    openid: "",
                    latitude: "",//纬度
                    longitude: "",//经度
                    is_update: false,//是否
                    pages: [{
                        id: 1,
                        questions: newQuestions,
                    }],
                };
                GM_xmlhttpRequest({
                    method: "POST",//GET, HEAD, POST的其中之一
                    url: "https://wj.qq.com/sur/collect_answer",
                    headers: {
                        "origin": "https://wj.qq.com",
                        "referer": "https://wj.qq.com/s2/9915802/5529/",
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "zh-CN,zh;q=0.9",
                        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "utm": "",
                        "x-requested-with": "XMLHttpRequest",
                        'date': new Date().toGMTString(),
                        'x-Time': new Date().getTime(),
                    },
                    data: `survey_id=${surveyId}&hash=${hash}&answer_survey=${encodeURI(JSON.stringify(answerSurvey))}`,
                    responseType: 'json', //blob, json中的一个
                    anonymous: true,//不发送带有请求的Cookie（请参阅 fetch 说明）
                    onload: (res) => {
                        resolve(res.response)
                    },
                    onerror: (err) => {
                        resolve({
                            status: -1,
                            error: err
                        })
                    }
                })
            } catch (error) {
                console.error(error);
                resolve({
                    status: -2,
                    error: error
                })
            }

        })
    };

    /**
     * 腾讯文档【获取】 【https://docs.qq.com/sheet/DYmJvZ3pldW1PRHl3?tab=38wkex】
     */
    function getTXWJ() {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET",//GET, HEAD, POST的其中之一
                url: `https://docs.qq.com/sheet/DYmJvZ3pldW1PRHl3?tab=38wkex&s=${new Date().getTime()}`,
                headers: {
                    'content-type': 'text/html; charset=utf-8',
                    'date': new Date().toGMTString(),
                    'x-Time': new Date().getTime(),
                },
                anonymous: true,//不发送带有请求的Cookie（请参阅 fetch 说明）
                onload: (res) => {
                    if (res.status == 200) {
                        const $html = res.response;
                        const el = document.createElement('div');
                        el.innerHTML = $html;
                        const $tr = [...el.querySelectorAll('.DTable tbody>tr')];
                        const tableData = [];
                        const tableDataKey = [];
                        $tr.forEach((trEl, trIndex) => {
                            const $td = [...trEl.querySelectorAll('td')];
                            const itemObj = {};
                            $td.forEach((tdEl, tdIndex) => {
                                const $text = tdEl?.innerText;
                                if (trIndex === 0) {
                                    tableDataKey.push($text)
                                } else {
                                    const itemKry = tableDataKey[tdIndex];
                                    !isObjEmpty($text) && (itemObj[itemKry] = $text);
                                }
                            });
                            if (!isObjEmpty(itemObj) && Object.values(itemObj).some(e => !isObjEmpty(e))) {
                                tableData.push(itemObj)
                            }
                        });
                        // console.log(tableData)
                        resolve({
                            status: 1,
                            info: "success",
                            data: tableData
                        })
                    } else {
                        resolve({
                            status: -1,
                            error: `[${res.status}]-${res.statusText}`
                        })
                    }

                },
                onerror: (err) => {
                    resolve({
                        status: -1,
                        error: err
                    })
                }
            })
        })
    };
    W['setTXWJ'] = setTXWJ;
    W['getTXWJ'] = getTXWJ;
    // for (let index = 0; index < 10; index++) {
    //     await setTXWJ(9915802,5529,{
    //         "q-1-kYV1":"张三"+index,
    //         "q-2-MGDZ":"男"+index,    
    //         "q-3-zAxX":"13162855705"
    //     })
    //     console.log(await getTXWJ());
    // }
})();
// ==UserScript==
// @name         【test2022a】考试
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @connect      101.34.52.7
// @match        **://*.souchn.cn/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';
    // http://101.34.52.7:1988/sqlite/zd.html

    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    const root = `http://101.34.52.7:1988/sqlite/api/`;
    const loadingImg = 'data:image/gif;base64,R0lGODlhFAAUAPf/AGSs0H+028Xu5XWX5dDs7HKW5eD18NTy67zN8pDfzc/m7/z+/Yzdy8rg79nm9WSL4svm7crX9WzMw6fl137Syuv59VmD4K3B77fp3mnJw23QwcbU9Njg9+/693u22M3v54TbyPn9/P39/2Sm1Pv9/Mju5sLt4/L8+ZvP3KDj1L7f6fn7/fH7+JvK3/f8/MHp5H+712Oh1vb8++n39ZXgz3DTwcPc7tbz7Lrq4JWv62S5ymnFxrnK8ef49KTk1nay2HPWwX3MzZGr6r7T73ml4Jjg0IDaxs/b9ej09+jv+tnu8ai976Df12mP42SU3mbAxp676YfcyYDKz3qb5t/18H/D0/j6/dDx6Zu07GOyzPT8+q/n2rzM8tv078rX9eX387Po3XnEz3fXw+fs+sHP832d58va87zr4L/X7t3172yR5MPf7NDf9F2G4c/w6c7Z9WOY22CI4b7O8rDf4Gif2qLh1uL28a/a4qu/763n2Zq95+ju+5ix61uF4MLl57DH7WiY3uTr+njJy6rm2Nbf94Gf532f5sfV9GSR4KnZ33DPw7Dn22m+ya/X5WW7yGeb29Dj8drx76/M6orazIHYyHzZxYLQzWi5zIKl5Xi61IjXzWW+xq7n2pOu6mSd2GS3yozczOfv+c/u6sPS87Lj373c6q7j3GSb2mSO4Gej2Pz8/v3+/lSA4FWB4Pz+/v7+/2KK4laC4Njz7dn07u769/z9/l6H4VqE4Of39GCJ4cbu5dj07u369uft+tr0783Y9ViC4On49f3+/8vv53eZ5ur59WGJ4b/s4tLx6p7i07vr4Ob382bExbjJ8bvr4HrYxM7w6G+T5GeO46Lk1Zbgz5vh0WSwzvv8/miU4KO67nW21cDh6KnF6uj19pnB44PYyWe2zX+l43TVw7Pm3nLRxJq36nmp3qjH6W3Gx4rcymrAyGmy0MTs5czt6aG47cTo577s4cTl6MPp5nbDzujx+MLU8myq13Wu2Hyt3mum2Hec49Hv68fu52yV4WS2y////yH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo3MTI3YTI1Ni0xM2VjLTRjMTItYmJlYS05MTI5Mzg5NzIyYWMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REJBMjVGRTc2M0QzMTFFNEI5MjhFMjM1QjVEMUFFRjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REJBMjVGRTY2M0QzMTFFNEI5MjhFMjM1QjVEMUFFRjMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1OTQ0NjYwMi0yMDJjLTQwZDMtOTE4Mi0yNmE0MzliYjcxYTIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzEyN2EyNTYtMTNlYy00YzEyLWJiZWEtOTEyOTM4OTcyMmFjIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJ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';

    const ExamTypeObj  = {
        '单选题':'danxuan-1',
        '多选题':'duoxuan-1',
        '判断题':'panduan-1',
        '填空题':'jianda-2',
    };



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
    setTimeout(_ => {
        //辅助登录
        const isLoginBut = $('.topbar .col-xs-8 .list-unstyled>li:eq(0)>a');
        if (isLoginBut && isLoginBut.length > 0) {
            isLoginBut.attr('onclick', '$.loginbox.show(),setEvent()')
            console.log('isLoginBut', isLoginBut)
        };

        function setEvent() {
            setTimeout(_ => {
                $('#peloginform [name="args[userpassword]"]').val(123456);
                $('#peloginform [name="args[username]"]').attr({
                    'onInput': 'autoLogin()'
                })
            }, 800)
        };

        function autoLogin() {
            var username = $.trim($('#peloginform [name="args[username]"]').val());
            if (username && username.length === 13) {
                $('#peloginform').submit()
            }
        }
        W['autoLogin'] = autoLogin;
        W['setEvent'] = setEvent;
    }, 800)

    if (location.search.includes('?exam-app-exam')) {
        var url = $("h2.title a:contains('考试记录')").attr('href');
        var $content = $('.content-box');
        if (!isObjEmpty(url) && $content.length > 0) {
            $content.append(`<div id="examHistory" style="margin-top: 2em;"><img style="display: block;margin: 1em auto;" src="${loadingImg}" width="30"></div>`)
            $.get(url, function(html) {
                $('#examHistory').html($(html).find('.list-unstyled .border .desc').html());
            })
        }
    };
    if (location.search.includes('?exam-app-basics-detail&basicid=')) {
        //自动开通并进入
        console.log('[自动开通并进入]', location.href);
        setTimeout(_ => {
            if ($('.toolbar .ajax').text() == "进入考场") {
                $('.toolbar .ajax').click()
            } else if ($('.toolbar .confirm').text() == "免费开通") {
                $('.toolbar .confirm').click()
            }
        }, 500)
        setTimeout(_ => {
            if ($('#zoombox .modal-footer .btn-primary').length > 0) {
                $('#zoombox .modal-footer .btn-primary').click()
            }
        }, 1000)
    };
    if (location.search.includes('?exam-app-exam-paper')) {
        //考试页面
        console.log('[考试页面]', location.href);
        setTimeout(e => {
            $('#questionindex .qindex').each(function() {
                $(this).attr('data-index', $(this).text())
            });
            $(`#questionindex .qindex`).html(`<img src="${loadingImg}" width="10">`);
            $('#paper>.content-box').each(function(index, el) {
                var _this = $(el);
                $(this).find('.title').append(`
                          <button type="button" class="btn btn-danger btn-sm setAnswer">保存答案</button>
                          <div class="msg" style="display:inline-block;margin-left:1em;font-size: 12px;">
                            <span style="display:none"></span>
                          </div>
             `)
                var title = $(this).find('.title').text();
                var desc = $(this).find('.morepadding').eq(0).text();
                var id = $(this).find('.favor').attr('data-questionid');
                if (title.indexOf('单选题') != -1 || title.indexOf('多选题') != -1) {
                    var showMsg = (str) => {
                        $(this).parents('.content-box').find('.msg>span').html(str).fadeIn("slow").fadeOut(2000);
                    };
                    GM_xmlhttpRequest({
                        method: "POST", //GET, HEAD, POST的其中之一
                        url: `${root}/get`,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        responseType: 'json',
                        anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                        data:new URLSearchParams({
                            page:1,
                            pageSize:1,
                            Course:`线下考试`,
                            Name: desc, //试题名称
                            // ExamType:ExamTypeObj['单选题']
                        }).toString(),
                        onload: (xhr) => {
                            const response = xhr.response;
                            console.log('[response]', response);
                            if (response.status === 200 && response.data) {
                                const answer = response.data.answer;
                                const AnswerArr = answer.split(',');
                                AnswerArr.forEach(key => {
                                    if (!_this.find(`[value="${key}"]`).prop('checked')) {
                                        _this.find(`[value="${key}"]`).click();
                                    }
                                    _this.find(`[value="${key}"]`).siblings('.selector').addClass('text-danger');
                                })
                            } else {
                                $(el).addClass('noAnswer')
                            };
                            $(`#sign_${id}`).html($(`#sign_${id}`).attr('data-index'));
                        },
                        onerror: (err) => {

                            $(el).addClass('noAnswer')
                            console.error(err);
                            $(`#sign_${id}`).html($(`#sign_${id}`).attr('data-index'));
                        }
                    })
                }
                if (title.indexOf('判断题') != -1) {
                    $(this).find('[value="A"]').click();
                    $(`#sign_${id}`).html($(`#sign_${id}`).attr('data-index'));
                }

            });

            document.body.insertAdjacentHTML('beforeEnd', `
                                    <button class="btn btn-success" onclick="submitTest(this)" type="button" style="min-width: 100px;position: fixed;bottom: 100px;left: 50%;transform: translateX(-50%);"><span class="glyphicon glyphicon-print"></span> 随机答案交卷</button>
                            `);
            W['submitTest'] = (el) => {
                $(el).button('loading').delay(1000);
                $('#paper>.noAnswer').each(function(index, el) {
                    var _this = $(el);
                    var title = _this.find('.title').text();
                    if(!_this.find('input').prop('checked')){
                        if (title.indexOf('单选题') != -1) {
                            var arr = ['A', 'B', 'C']
                            var k = Math.floor((Math.random() * arr.length));
                            const AnswerArr = [arr[k]];
                            AnswerArr.forEach(key => {
                                if (!_this.find(`[value="${key}"]`).prop('checked')) {
                                    _this.find(`[value="${key}"]`).click();
                                };
                                _this.find(`[value="${key}"]`).siblings('.selector').addClass('text-danger');
                            })
                        }
                        if (title.indexOf('多选题') != -1) {
                            const AnswerArr = ['A', 'B', 'C', 'D', 'E', 'F'];
                            AnswerArr.forEach(key => {
                                if (!_this.find(`[value="${key}"]`).prop('checked')) {
                                    _this.find(`[value="${key}"]`).click();
                                }
                                _this.find(`[value="${key}"]`).siblings('.selector').addClass('text-danger');
                            })
                        }
                        if (title.indexOf('判断题') != -1) {
                            $(this).find('[value="A"]').click();
                        };
                    }
                });
                setTimeout(() => {
                    //$(el).button('reset');
                    //$(el).dequeue();
                    // submitPaper && submitPaper();
                }, 500)
            };
            $('#paper').on('click', '.desc', function() {
                var copyText = '';
                try {
                    var selecter = $.trim(window.getSelection().toString());
                    if (!isObjEmpty(selecter)) {
                        copyText = selecter;
                    }
                } catch (err) {
                    var selecterDom = document.selection.createRange();
                    var str = $.trim(selecterDom.text);
                    if (!isObjEmpty(str)) {
                        copyText = str;
                    }
                };
                if (!isObjEmpty(copyText)) {
                    GM_setClipboard(copyText, {
                        type: 'text',
                        mimetype: 'text/plain'
                    });
                    var pDom = $(this).parents('.content-box');
                    var copyBut = pDom.find('.copy');
                    copyBut.button('loading').delay(500).queue(function(e) {
                        copyBut.button('reset');
                        copyBut.dequeue();
                    });
                }
            });
            $('#paper').on('click', '.setAnswer', function() {
                var _this = $(this);
                var showMsg = (str) => {
                    _this.siblings('.msg').find('span').html(str).fadeIn("slow").fadeOut(2000);
                };
                var pDom = $(this).parents('.content-box');
                var title = pDom.find('.title').text();
                var desc = pDom.find('.morepadding').eq(0).text();
                console.log('[desc]',desc)
                if (title.indexOf('单选题') != -1) {
                    var answer = pDom.find(`[type="radio"]:checked`).val();
                    if (answer) {
                        _this.attr('disabled', true).text('保存中...');

                        GM_xmlhttpRequest({
                            method: "POST", //GET, HEAD, POST的其中之一
                            url: `${root}/add`,
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            responseType: 'json',
                            anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                            data: new URLSearchParams({
                                Name:$.trim(desc),
                                Answer:$.trim(answer),
                                Course:`线下考试`,
                                ExamType: ExamTypeObj['单选题'],
                            }).toString(),
                            onload: (xhr) => {
                                const response = xhr.response;
                                console.log('[response]', response);
                                if (response.status === 200) {
                                    showMsg(`<b class="text-success">保存成功✅</b>`)
                                } else {
                                    showMsg(`<b class="text-danger">保存答案失败</b>`)
                                };
                                _this.attr('disabled', false).text('保存答案');
                            },
                            onerror: (err) => {
                                console.error(err);
                                showMsg(`<b class="text-danger">保存答案失败</b>`)
                                _this.attr('disabled', false).text('保存答案');
                            }
                        })
                    } else {
                        showMsg(`<b class="text-warning">请选择答案</b>`)
                    }
                }
                if (title.indexOf('多选题') != -1) {
                    var arr = [];
                    pDom.find(`[type="checkbox"]`).each(function(i, ev) {
                        if ($(ev).prop('checked')) {
                            arr.push($.trim($(ev).val()))
                        }
                    })
                    console.log(arr)
                    if (arr && arr.length > 0) {
                        _this.attr('disabled', true).text('保存中...');

                        GM_xmlhttpRequest({
                            method: "POST", //GET, HEAD, POST的其中之一
                            url: `${root}/add`,
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            responseType: 'json',
                            anonymous: true, //不发送带有请求的Cookie（请参阅 fetch 说明）
                            data: new URLSearchParams({
                                Name: $.trim(desc),
                                Answer: arr.join(','),
                                Course:`线下考试`,
                                ExamType: ExamTypeObj['多选题']
                            }).toString(),
                            onload: (xhr) => {
                                const response = xhr.response;
                                console.log('[response]', response);
                                if (response.status === 200) {
                                    showMsg(`<b class="text-success">保存成功✅</b>`)
                                } else {
                                    showMsg(`<b class="text-danger">保存答案失败</b>`)
                                };
                                _this.attr('disabled', false).text('保存答案');
                            },
                            onerror: (err) => {
                                console.error(err);
                                showMsg(`<b class="text-danger">保存答案失败</b>`)
                                _this.attr('disabled', false).text('保存答案');
                            }
                        })
                    } else {
                        showMsg(`<b class="text-warning">请选择答案</b>`)
                    }
                }
            })
        }, 1000);
    }
    // Your code here...
})();
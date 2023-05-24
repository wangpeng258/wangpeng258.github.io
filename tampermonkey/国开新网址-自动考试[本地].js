// ==UserScript==
// @name        〔国开实验学院-采集&答题 【localStorage】〕
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      https://*/exam/*/subjects
// @require      https://unpkg.com/ajax-hook@2.0.3/dist/ajaxhook.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const root = 'http://localhost:8888';
    if(window.ah){
        ah.proxy({
            //请求发起前进入
            onRequest:function(config, handler){
                //console.log('config',config)
                //config.headers['X-Time'] = new Date().getTime();
                handler.next(config);
            },
            //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
            onError:function(err,handler){
                console.error(err)
                handler.next(err)
            },
            //请求成功后进入
            onResponse:function(res, handler){
                // 'single_selection': '单选题',
                // 'multiple_selection': '多选题',
                // 'true_or_false': '判断题',
                // 'fill_in_blank': '填空题',
                // 'short_answer': '简答题',
                // 'text': '文本',
                // 'analysis': '综合题',
                // 'matching': '匹配题',
                // 'random': '随机题',
                // 'cloze': '完形填空题'

                //采集
                try {
                    if(/\/api\/exams\/\d+\/submissions\/\d+/.test(res.config.url)){
                        const response = JSON.parse(res.response);
                         console.log('response',response)
                        const submissionData = response.submission_data.subjects || []; //提交答案数据
                        const answerData  = response.correct_answers_data.correct_answers || []; //答案数据
                        console.log('[采集]提交答案数据',submissionData)
                        console.log('[采集]答案数据',answerData)
                        for (let index = 0; index < answerData.length; index++) {
                            const element = answerData[index];
                            //判断题 单选题  多选题
                            if(element.type =="true_or_false" || element.type =="single_selection" || element.type =="multiple_selection"){
                                let answer = element.answer_option_ids.join('|');
                                window.localStorage.setItem('gksys_'+element.subject_id,answer);
                            }
                        };
                        const subjectsData = response.subjects_data.subjects || []; //所有的题目
                        const subjectsScore = response.submission_score_data || {}; //所有的题目分数
                        const correctTopic = [];
                        for (let index = 0; index < subjectsData.length; index++) {
                            const element = subjectsData[index];
                            //判断题 单选题  多选题
                            if(element.type =="true_or_false" || element.type =="single_selection" || element.type =="multiple_selection"){
                                var score = Number(subjectsScore[element.id]||0);
                                if(score>0){
                                    const answerInfo = submissionData.find(e=>e.subject_id==element.id);
                                    if(answerInfo){
                                        correctTopic.push(answerInfo);
                                        window.localStorage.setItem('gksys_'+answerInfo.subject_id,answerInfo.answer_option_ids.join('|'));
                                    }

                                }
                            }
                        };
                        console.log('[正确答案]',correctTopic)
                        document.title = `采集完成`;
                    }
                } catch (error) {
                    console.error(error);
                };

                //答题
                try {
                    if(/\/api\/exams\/\d+\/distribute/.test(res.config.url)){
                        setTimeout(_=>{
                            const total = $('.subjects-jit-display>.subject').length;
                            let num = 0;
                            const response = JSON.parse(res.response);
                            const subjects = response.subjects||[];
                            console.log('[题目]',subjects);
                            subjects.forEach(element => {
                                //处理多选题
                                if(element.type == "multiple_selection"){
                                    var options = element.options||[];
                                    options.forEach(j=>{
                                        var content = $.trim($(j.content).text());
                                        $('[type="checkbox"][ng-change="onChangeSubmission(subject)"]').each(function(s,el){
                                            var subc = $.trim($(el).parent().siblings('.option-content').text());
                                            if(content==subc){
                                                $(el).attr('value',j.id)
                                            }
                                        })
                                    })
                                }
                                //判断题 单选题 //多选题
                                if(element.type == "true_or_false" || element.type =="single_selection" || element.type == "multiple_selection"){
                                    var answer = window.localStorage.getItem('gksys_'+element.id);
                                    if(answer){
                                        num++;
                                        var answerArr = answer.split('|')||[];
                                        answerArr.forEach(answerId => {
                                            $(`input[value="${answerId}"]`).prop('checked',true).trigger('change').attr('data-ok','ok');
                                            $(`input[value="${answerId}"]`).parents('.subject').find('.summary-title .subject-description>p').css('color','#07c160');
                                        });

                                    }
                                }
                            });
                            document.title=`${num}/${total}`;
                        },500)

                    }
                } catch (error) {
                    console.error(error);
                };

                handler.next(res)
            }
        })
    }



    setTimeout(()=>{
        $('body').append(`
                <div style="position: fixed;bottom: 1em;left:0.21em;border: 1px solid #666;padding: 1em;z-index: 9999999999;background: #fff;">
                    <button style="margin: 5px 0;" class="btn btn-primary" onclick="ExportAnswer(this)" type="button">导出答案</button><br />
                    <button style="margin: 5px 0;" class="btn btn-info" onclick="ImportAnswer(this)" id="ImportAnswer" type="button">导入答案</button>
                    <input type="file" id="upfile" style="display: none;" hidden>

                </div>`)
        function localStorageArr(){
            var len = window.localStorage.length;
            var arr = new Array();
            for(var i = 0; i < len; i++) {
                var getKey = window.localStorage.key(i);
                var getVal = window.localStorage.getItem(getKey);
                if(getKey&&getKey.indexOf('gksys_') != -1){
                    arr.push({
                        'key': getKey.replace(/gksys_/ig,''),
                        'val': getVal
                    })
                }
            }
            return arr
        }
        function ExportAnswer(_this){
            try {
                _this.disabled = true;
                var Arr = localStorageArr();
                var fileName = "国家开放大学实验学院答案_"+dateFormat("YYYY-mm-dd HH:MM:SS", new Date())+'.json';
                console.log(fileName);
                funDownload(JSON.stringify(Arr,null, 4),fileName);
                setTimeout(()=>{
                    _this.disabled = false;
                },1500)
            } catch (error) {
                console.log(error);
                alert('导出失败')
            }

        }
        function ImportAnswer(_this){
            try {
                _this.disabled = true;
                document.getElementById('upfile').click();
            } catch (error) {
                console.log(error);
                alert('导入失败')
            }
        };
        try {
            var eleFile = document.getElementById('upfile');
            var reader_gk = new FileReader();
            reader_gk.onload = function (event) {
                try {
                    var array = JSON.parse(event.target.result);
                    var okArr = [];
                    for (var index = 0; index < array.length; index++) {
                        var element = array[index];
                        if(element.key&&element.val){
                            window.localStorage.setItem('gksys_'+element.key,element.val);
                            okArr.push(element.key)
                        }

                    }
                    alert('成功导入'+(okArr.length)+"道题")
                    location.reload()
                } catch (error) {
                    console.log(error);
                    alert('导入失败')
                    location.reload()
                }

            };
            // 选择文件
            eleFile.onchange = function (event) {
                var file = event.target.files[0];
                if (file) {
                    reader_gk.readAsText(file);
                }
            };
        } catch (error) {
            console.log(error);
            alert('导入失败')
        }


        function funDownload(content, filename){
            var eleLink = document.createElement('a');
            eleLink.download = filename;
            eleLink.style.display = 'none';
            // 字符内容转变成blob地址
            var blob = new Blob([content]);
            eleLink.href = URL.createObjectURL(blob);
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
        }

        function dateFormat(fmt, date) {
            let ret;
            const opt = {
                "Y+": date.getFullYear().toString(),        // 年
                "m+": (date.getMonth() + 1).toString(),     // 月
                "d+": date.getDate().toString(),            // 日
                "H+": date.getHours().toString(),           // 时
                "M+": date.getMinutes().toString(),         // 分
                "S+": date.getSeconds().toString()          // 秒
                // 有其他格式化字符需求可以继续添加，必须转化成字符串
            };
            for (let k in opt) {
                ret = new RegExp("(" + k + ")").exec(fmt);
                if (ret) {
                    fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
                };
            };
            return fmt;
        }
        window['ExportAnswer'] = ExportAnswer;
        window['ImportAnswer'] = ImportAnswer;
        window['localStorageArr'] = ImportAnswer;
        window['funDownload'] = funDownload;
        window['dateFormat'] = dateFormat;


    },500)

})();
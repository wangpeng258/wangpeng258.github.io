// ==UserScript==
// @name         匠心丝绸添加商品
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://dz.yplm.cn/**/sys/commodityForm.html**
// @icon         http://yplm.cn/favicon.ico
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    document.body.insertAdjacentHTML('beforeEnd', `
        <textarea id="stepArr" style="position: fixed;
        width: 250px;
        height: 80px;
        top: 1em;
        right: 1em;
        padding: 1em;
        z-index: 10;"></textarea>
    `);
    document.body.insertAdjacentHTML('beforeEnd', `
        <button
         onclick="echoData(this)"
         type="button"
         style="-webkit-appearance: none;position: fixed;bottom: 86px;left: 50%;transform: translateX(-50%);z-index:999999999;padding: 5px 20px;border: 1px solid #AAA;background-image: linear-gradient(to bottom,#fff 0,#F8F8F8 100%);background-repeat: repeat-x;border-radius: 2px;">默认数据</button>
    `);
    W.echoData = function() {
        const categoryId = GM_getValue('categoryId'); //分类
        const goodsName = GM_getValue('goodsName'); //分类
        var app = document.querySelector("#app").__vue__;
        app.imageList = [];
        app.form = {
            categoryId:categoryId||'',
            goodsName:goodsName||'',
            brandId:8,
            dzPeriod:10,
            isStock:'1',
            img1:"",
            img2:"",
            img3:"",
            img4:"",
            img5:"",
            img6:"",
            size:'',
            goodsVideo:"",
            goodsDetails:""
        };
        app.$refs['specif'].init(JSON.stringify([{"key":"款号","value":""},{"key":"成份","value":""}]));
    };
    document.body.insertAdjacentHTML('beforeEnd', `
        <button
          id="startSp"
          onclick="startSp(this)"
          type="button"
          style="-webkit-appearance: none;position: fixed;bottom: 50px;left: 50%;transform: translateX(-50%);z-index:999999999;padding: 5px 20px;border: 1px solid #AAA;background-image: linear-gradient(to bottom,#fff 0,#F8F8F8 100%);background-repeat: repeat-x;border-radius: 2px;">提交</button>
    `);

    W.startSp = function() {
        save();
    };

    //设置步骤
    function setStep(goodId) {
        try {
            var arr = document.querySelector("#stepArr").value.split('\n');
            if(arr&&arr.length>=2){
                var data = [
                    {
                      "title": "规格",
                      "list": [
                        {
                          "steps": [],
                          "title": "尺码",
                          "showType": "text",
                          "sort": 0
                        }
                      ],
                      "sort": 0
                    }
                  ];
                  for (let index = 0; index < arr.length; index++) {
                    const element = arr[index];
                    data[0].list[0].steps.push({
                        "index": 0,
                        "listIndex": 0,
                        "showType": "text",
                        "price": 0,
                        "img": "",
                        "topImg": "",
                        "default": index==0?"0":"1",
                        "inventory": "0",
                        "showList": [],
                        "title": element,
                        "describe": element,
                        "id": `${dateFormat('YYYYmmdd', new Date())}-${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}`,
                        "sort": 0
                      })
                  };

                  Vue.http.post(`https://dz.yplm.cn/sys/goods/updateSetFunction?goodId=${goodId}`, JSON.stringify(data), {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    emulateJSON: true
                }).then((xml) => {
                    var res = xml.body;
                    if (res.code === 200) {
                        onTheShelf(goodId);
                        console.log('设置步骤', res);
                    } else {
                        console.error('设置步骤', res)
                    }
                });

            }else{
                alert(arr)
            }
        } catch (error) {
            console.error(error);
            alert('错误')
        }


    };

    //上架
    function onTheShelf(id) {
        Vue.http.post(`https://dz.yplm.cn/sys/goods/newProducts`, {
            id
        }, {
            emulateJSON: true
        }).then((xml) => {
            var res = xml.body;
            if (res.code === 200) {
                document.querySelector("#startSp").disabled = false;
                document.querySelector("#startSp").innerText = '提交';
                console.log('上架', res);
                alert('完成');
            } else {
                console.error('上架', res)
            }

        });
    };
    //获取最新的一个商品id
    function getFirst(goodsName) {
        Vue.http.post(`https://dz.yplm.cn/sys/goods/list`, {
            status: 2,
            page: 1,
            goodsName
        }, {
            emulateJSON: true
        }).then((xml) => {
            var res = xml.body;
            console.log('list', res);
            if (res.code === 200 && res.data.list.length > 0) {
                const id = res.data.list[0].id;
                //设置步骤
                setStep(id);
            } else {
                console.error('获取失败', res.data.list)
            }
        });
    };
    //保存
    function save() {
        var _this = document.querySelector("#app").__vue__;
        _this.$refs['form'].validate((valid) => {
            if (valid) {
                document.querySelector("#startSp").disabled = true;
                document.querySelector("#startSp").innerText = 'loading';

                let url = "/sys/goods/save";
                if (_this.query.id) {
                    url = "/sys/goods/update"
                };

                let data = JSON.parse(JSON.stringify(_this.form));
                if (_this.$refs['specif'].check()) {
                    data.size = JSON.stringify(_this.$refs['specif'].getData())
                } else {
                    _this.$message.error('请填写规格');
                    return;
                };
                data['img1'] = '';
                data['img2'] = '';
                data['img3'] = '';
                data['img4'] = '';
                data['img5'] = '';
                data['img6'] = '';
                const imgList = _this.imageList || [];
                imgList.forEach((element, index) => {
                    const imgKey = `img${index + 1}`;
                    data[imgKey] = element;
                });
                GM_setValue('categoryId',data.categoryId);
                GM_setValue('goodsName',data.goodsName);
                _this.buttonLoading = true;
                _this.$http.post(url, data, {
                    emulateJSON: true
                }).then((xml) => {
                    _this.buttonLoading = false;
                    var res = xml.body;
                    if (res.code === 200) {
                        if (_this.query.id) {
                            alert('ok');
                            // var id = +_this.query.id;
                            // window.location.href = `commodityForm.html?id=${id+1}`;
                        } else {
                            getFirst(data.goodsName);
                        }
                    } else {
                        _this.$notify({
                            title: '警告',
                            message: res.msg || '提交失败！请稍后再试',
                            type: 'warning'
                        });
                    }
                }).catch((err) => {
                    _this.buttonLoading = false;
                    _this.$notify.error({
                        title: '错误',
                        message: '提交错误！请稍后再试',
                        duration: 2000
                    });
                })
            } else {
                console.log('error submit!!');
                return false;
            }
        })
    }
    // Your code here...
})();
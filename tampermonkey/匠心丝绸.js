// ==UserScript==
// @name         添加商品
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      https://dz.yplm.cn/dev/sys/commodityForm.html
// @include      https://dz.yplm.cn/dev/sys/commodityForm.html?*
// @icon         https://wj.qq.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const categoryId = 37; //分类

    const echoID = 15; //回显数据id;
    const goodsName = '素绉缎长巾'; //搜索数据名称;
    const stepArr = [{
            name: '尺寸',
            title: '172cm X 52cm',
            describe: '大方巾',
        },
        {
            name: '成分',
            title: '100%桑蚕丝',
            describe: '100%SILK',
        }
    ]

    document.body.insertAdjacentHTML('beforeEnd', '<button onclick="clearData(this)" type="button" style="-webkit-appearance: none;position: fixed;bottom: 100px;left: 50%;transform: translateX(-50%);z-index:999999999;padding: 5px 20px;border: 1px solid #AAA;background-image: linear-gradient(to bottom,#fff 0,#F8F8F8 100%);background-repeat: repeat-x;border-radius: 2px;">清除图片</button>');
    document.body.insertAdjacentHTML('beforeEnd', '<button onclick="echoData(this)" type="button" style="-webkit-appearance: none;position: fixed;bottom: 150px;left: 50%;transform: translateX(-50%);z-index:999999999;padding: 5px 20px;border: 1px solid #AAA;background-image: linear-gradient(to bottom,#fff 0,#F8F8F8 100%);background-repeat: repeat-x;border-radius: 2px;">回显数据</button>');
    document.body.insertAdjacentHTML('beforeEnd', '<button id="startSp" onclick="startSp(this)" type="button" style="-webkit-appearance: none;position: fixed;bottom: 50px;left: 50%;transform: translateX(-50%);z-index:999999999;padding: 5px 20px;border: 1px solid #AAA;background-image: linear-gradient(to bottom,#fff 0,#F8F8F8 100%);background-repeat: repeat-x;border-radius: 2px;">保存&设置步骤&上架</button>');
    window.clearData = function() {
        var app = document.querySelector("#app").__vue__;
        app.imageList = [];
    };
    window.echoData = function() {
        var app = document.querySelector("#app").__vue__;
        // app.getInfo(echoID);
        app.imageList = [];
        app.form.categoryId = 37;
        console.log(app);
    };
    window.startSp = function() {
        save();
    };


    //设置步骤
    function setStep(goodId) {
        var data = [{
            "title": "规格",
            "list": [{
                    "steps": [{
                        "index": 0,
                        "listIndex": 0,
                        "showType": "text",
                        "price": 0,
                        "img": "",
                        "topImg": "",
                        "default": "0",
                        "inventory": "0",
                        "showList": [],
                        "title": stepArr[0].title,
                        "describe": stepArr[0].describe,
                        "id": `${dateFormat('YYYYmmdd', new Date())}-${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}`,
                        "sort": 0
                    }],
                    "title": stepArr[0].name,
                    "showType": "text",
                    "sort": 0
                },
                {
                    "steps": [{
                        "index": 0,
                        "listIndex": 1,
                        "showType": "text",
                        "price": 0,
                        "img": "",
                        "topImg": "",
                        "default": "0",
                        "inventory": "0",
                        "showList": [],
                        "title": stepArr[1].title,
                        "describe": stepArr[1].describe,
                        "id": `${dateFormat('YYYYmmdd', new Date())}-${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}-${Math.random().toString(16).substring(2)}`,
                        "sort": 0
                    }],
                    "title": stepArr[1].name,
                    "showType": "text",
                    "sort": 1
                }
            ],
            "sort": 0
        }];
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
                document.querySelector("#startSp").innerText = '保存&设置步骤&上架';
                console.log('上架', res);
                alert('完成');
                var app = document.querySelector("#app").__vue__;
                app.imageList = [];
            } else {
                console.error('上架', res)
            }

        });
    };
    //获取最新的一个商品id
    function getFirst() {
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
                _this.buttonLoading = true;
                _this.$http.post(url, data, {
                    emulateJSON: true
                }).then((xml) => {
                    _this.buttonLoading = false;
                    var res = xml.body;
                    if (res.code === 200) {
                        if (_this.query.id) {
                            alert('ok');
                            var id = +_this.query.id;
                            window.location.href = `commodityForm.html?id=${id+1}`;
                        } else {
                            // getFirst();
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
/*
 * @Author: sku
 * @Date: 2021-07-27 17:11:46
 * @LastEditTime: 2021-12-15 15:10:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 */
Vue.component('Sku', {
    template: `<div class="sku">
                    <h3>Sku</h3>
                    <div style="margin-bottom:10px;" v-for="(attr, index) in process_attribute" :key="index">
                        <h4>{{ attr.name }}</h4>
                        <div class="sku-group">
                        <button 
                                v-for="(item, index2) in attr.item" 
                                :key="index2" 
                                style="margin: 0 5px 5px 0;" 
                                :style="{
                                    color:item.actived ? 'red' : '#666',
                                    opacity:item.disabled?0.7:1
                                }" 
                                :disabled="item.disabled" 
                                @click="skuClick(index, index2)">{{ item.name }}</button>
                        </div> 
                    </div>
                    <div style="margin-top: 20px;">
                        库存：
                        <span>{{ stock }}</span>
                    </div>
                    <div style="margin-bottom:20px;">
                        价格：
                        <span v-if="minprice == maxprice">{{ minprice }}</span>
                        <span v-else>{{ minprice }} - {{ maxprice }}</span>
                    </div>
                    <button type="button" @click="submit">购买</button>
               </div>`,
    props: {},
    data() {
        return {
            separator: ';',
            attribute: [{
                    "name": "颜色",
                    "item": [
                        "星光色",
                        "午夜色",
                        "粉色",
                        "蓝色",
                        "红色"
                    ]
                },
                {
                    "name": "版本",
                    "item": [
                        "128GB",
                        "256GB",
                        "512GB"
                    ]
                },
                {
                    "name": "运营商",
                    "item": [
                        "全网通",
                        "移动版",
                        "联通版",
                        "电信版"
                    ]
                }
            ],
            sku: [{
                    "sku": "星光色;128GB;全网通",
                    "price": 5699,
                    "stock": 0
                },
                {
                    "sku": "星光色;128GB;移动版",
                    "price": 5699,
                    "stock": 0
                },
                {
                    "sku": "星光色;128GB;联通版",
                    "price": 5699,
                    "stock": 0
                },
                {
                    "sku": "星光色;128GB;电信版",
                    "price": 5699,
                    "stock": 0
                },
                {
                    "sku": "星光色;256GB;全网通",
                    "price": 7288,
                    "stock": 0
                },
                {
                    "sku": "星光色;256GB;移动版",
                    "price": 7288,
                    "stock": 0
                },
                {
                    "sku": "星光色;256GB;联通版",
                    "price": 7288,
                    "stock": 0
                },
                {
                    "sku": "星光色;256GB;电信版",
                    "price": 7288,
                    "stock": 0
                },
                {
                    "sku": "星光色;512GB;全网通",
                    "price": 9688,
                    "stock": 0
                },
                {
                    "sku": "星光色;512GB;移动版",
                    "price": 9688,
                    "stock": 0
                },
                {
                    "sku": "星光色;512GB;联通版",
                    "price": 9688,
                    "stock": 0
                },
                {
                    "sku": "星光色;512GB;电信版",
                    "price": 9688,
                    "stock": 0
                },
                {
                    "sku": "午夜色;128GB;全网通",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "午夜色;128GB;移动版",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "午夜色;128GB;联通版",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "午夜色;128GB;电信版",
                    "price": 5699,
                    "stock": 0
                },
                {
                    "sku": "午夜色;256GB;全网通",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "午夜色;256GB;移动版",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "午夜色;256GB;联通版",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "午夜色;256GB;电信版",
                    "price": 7288,
                    "stock": 0
                },
                {
                    "sku": "午夜色;512GB;全网通",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "午夜色;512GB;移动版",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "午夜色;512GB;联通版",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "午夜色;512GB;电信版",
                    "price": 9688,
                    "stock": 0
                },
                {
                    "sku": "粉色;128GB;全网通",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "粉色;128GB;移动版",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "粉色;128GB;联通版",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "粉色;128GB;电信版",
                    "price": 5699,
                    "stock": 0
                },
                {
                    "sku": "粉色;256GB;全网通",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "粉色;256GB;移动版",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "粉色;256GB;联通版",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "粉色;256GB;电信版",
                    "price": 7288,
                    "stock": 0
                },
                {
                    "sku": "粉色;512GB;全网通",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "粉色;512GB;移动版",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "粉色;512GB;联通版",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "粉色;512GB;电信版",
                    "price": 9688,
                    "stock": 0
                },
                {
                    "sku": "蓝色;128GB;全网通",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "蓝色;128GB;移动版",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "蓝色;128GB;联通版",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "蓝色;128GB;电信版",
                    "price": 5699,
                    "stock": 0
                },
                {
                    "sku": "蓝色;256GB;全网通",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "蓝色;256GB;移动版",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "蓝色;256GB;联通版",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "蓝色;256GB;电信版",
                    "price": 7288,
                    "stock": 0
                },
                {
                    "sku": "蓝色;512GB;全网通",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "蓝色;512GB;移动版",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "蓝色;512GB;联通版",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "蓝色;512GB;电信版",
                    "price": 9688,
                    "stock": 0
                },
                {
                    "sku": "红色;128GB;全网通",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "红色;128GB;移动版",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "红色;128GB;联通版",
                    "price": 5699,
                    "stock": 10
                },
                {
                    "sku": "红色;128GB;电信版",
                    "price": 5699,
                    "stock": 0
                },
                {
                    "sku": "红色;256GB;全网通",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "红色;256GB;移动版",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "红色;256GB;联通版",
                    "price": 7288,
                    "stock": 10
                },
                {
                    "sku": "红色;256GB;电信版",
                    "price": 7288,
                    "stock": 0
                },
                {
                    "sku": "红色;512GB;全网通",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "红色;512GB;移动版",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "红色;512GB;联通版",
                    "price": 9688,
                    "stock": 10
                },
                {
                    "sku": "红色;512GB;电信版",
                    "price": 9688,
                    "stock": 0
                }
            ],
            process_attribute: [],
            process_sku: [],
            // 当前选中 sku 的库存及价格区间
            stock: '',
            minprice: '',
            maxprice: ''
        }
    },
    mounted() {
        this.init()
            // console.log(this.itemquantity('黑'));
    },
    methods: {
        initSku(attribute = [], sku = []) {
            sku.forEach(element => {
                element.price = isNaN(Number(element.price)) ? 0 : Number(element.price);
                element.stock = isNaN(Number(element.stock)) ? 0 : Number(element.stock);
            });
            this.attribute = attribute;
            this.sku = sku;

            this.process_attribute = [];
            this.process_sku = [];
            this.stock = '';
            this.minprice = '';
            this.maxprice = '';

            this.init();
        },
        init() {
            // 对 attribute 数据进行加工，并存入 process_attribute 中
            this.attribute.map(attr => {
                    let temp = {
                        name: attr.name
                    }
                    temp.item = attr.item.map(item => {
                        return {
                            name: item,
                            actived: false,
                            disabled: this.itemquantity(item) <= 0
                        }
                    })
                    this.process_attribute.push(temp)
                })
                // 对 sku 数据进行加工，并存入 process_sku 中
            this.sku.map(v => {
                    var combArr = this.arrayCombine(v.sku.split(this.separator))
                    for (var j = 0; j < combArr.length; j++) {
                        var key = combArr[j].join(this.separator)
                        if (this.process_sku[key]) {
                            // 库存累加，价格添加进数组
                            this.process_sku[key].stock += v.stock
                            this.process_sku[key].prices.push(v.price)
                        } else {
                            this.process_sku[key] = {
                                stock: v.stock,
                                prices: [v.price]
                            }
                        }
                    }
                })
                // 更新数据视图
            this.process_sku = Object.assign({}, this.process_sku)
            this.skuCheck()

            console.log('process_attribute', this.process_attribute);
            console.log('process_sku', this.process_sku);
        },
        //查询属性数量
        itemquantity(item) {
            let quantity = 0;
            this.sku.forEach(element => {
                var skuArr = element.sku.split(this.separator);
                if (skuArr.indexOf(item) != -1) {
                    quantity += element.stock;
                }
            });
            return quantity
        },
        arrayCombine(targetArr) {
            var resultArr = []
            for (var n = 0; n <= targetArr.length; n++) {
                var flagArrs = this.getFlagArrs(targetArr.length, n)
                while (flagArrs.length) {
                    var flagArr = flagArrs.shift()
                    var combArr = Array(targetArr.length)
                    for (var i = 0; i < targetArr.length; i++) {
                        if (flagArr[i]) {
                            combArr[i] = targetArr[i]
                        }
                    }
                    resultArr.push(combArr)
                }
            }
            return resultArr
        },
        getFlagArrs(m, n) {
            var flagArrs = [],
                flagArr = [],
                isEnd = false
            for (var i = 0; i < m; i++) {
                flagArr[i] = i < n ? 1 : 0
            }
            flagArrs.push(flagArr.concat())
                // 当n不等于0并且m大于n的时候进入
            if (n && m > n) {
                while (!isEnd) {
                    var leftCnt = 0
                    for (var i = 0; i < m - 1; i++) {
                        if (flagArr[i] == 1 && flagArr[i + 1] == 0) {
                            for (var j = 0; j < i; j++) {
                                flagArr[j] = j < leftCnt ? 1 : 0
                            }
                            flagArr[i] = 0
                            flagArr[i + 1] = 1
                            var aTmp = flagArr.concat()
                            flagArrs.push(aTmp)
                            if (aTmp.slice(-n).join('').indexOf('0') == -1) {
                                isEnd = true
                            }
                            break
                        }
                        flagArr[i] == 1 && leftCnt++
                    }
                }
            }
            return flagArrs
        },
        skuClick(key1, key2) {
            if (!this.process_attribute[key1].item[key2].disabled) {
                this.process_attribute[key1].item.map((item, index) => {
                    item.actived = index == key2 ? !item.actived : false
                })
                this.skuCheck()
                this.getStockPrice()
            }
        },
        skuCheck() {
            let sku = []
            this.process_attribute.map(attr => {
                let name = ''
                attr.item.map(item => {
                    if (item.actived) {
                        name = item.name
                    }
                })
                sku.push(name)
            })
            this.stock = this.process_sku[sku.join(this.separator)].stock
            this.minprice = Math.min.apply(Math, this.process_sku[sku.join(this.separator)].prices)
            this.maxprice = Math.max.apply(Math, this.process_sku[sku.join(this.separator)].prices)
        },
        getStockPrice() {
            this.process_attribute.map(attr => {
                attr.item.map(item => {
                    item.disabled = this.itemquantity(item.name) <= 0
                })
            })
            let count = 0
            let i = 0
            this.process_attribute.map((attr, index) => {
                    let flag = false
                    attr.item.map(item => {
                        if (item.actived) {
                            flag = true
                        }
                    })
                    if (!flag) {
                        count += 1
                        i = index
                    }
                })
                // 当只有一组规格没选时
            if (count == 1) {
                this.process_attribute[i].item.map(item => {
                    let sku = []
                    let text = item.name
                    this.process_attribute.map((attr, index) => {
                        if (index != i) {
                            attr.item.map(item2 => {
                                if (item2.actived) {
                                    sku.push(item2.name)
                                }
                            })
                        } else {
                            sku.push(text)
                        }
                    })
                    if (this.process_sku[sku.join(this.separator)].stock == 0) {
                        item.disabled = true
                    }
                })
            }
            // 当所有规格都有选时
            if (count == 0) {
                this.process_attribute.map((attr, index) => {
                    let i = index
                    this.process_attribute[index].item.map(item => {
                        if (!item.actived) {
                            let sku = []
                            let text = item.name
                            this.process_attribute.map((list, index) => {
                                if (index != i) {
                                    list.item.map(item2 => {
                                        if (item2.actived) {
                                            sku.push(item2.name)
                                        }
                                    })
                                } else {
                                    sku.push(text)
                                }
                            })
                            if (this.process_sku[sku.join(this.separator)].stock == 0) {
                                item.disabled = true
                            }
                        }
                    })
                })
            }
        },
        submit() {
            let sku = []
            let isSelectSKU = this.process_attribute.every(attr => {
                let filter = attr.item.filter(v => v.actived)
                if (filter.length != 0) {
                    sku.push(filter[0].name)
                }
                return filter.length != 0
            })
            if (isSelectSKU) {
                alert(`当前SKU为：${sku.join(this.separator)}`)
            } else {
                alert('请选择完整商品属性')
            }
        }
    }
})
<template>
    <div>
        <div class="singleTopicSelection">
            <transition name="van-fade">
                <div v-if="gameing">
                    <div class="love_wrapper" ref="love">
                        <div class="heart" ref="heart"></div>
                    </div>
                    <div class="topic_wrapper">
                        <div class="topic_name" ref="topic_name" @click="move('love_topic_name')">
                            <div class="love_blank" ref="love_topic_name"></div>
                            <div class="topic_name_bg" v-html="topicAction.title"></div>
                            <div class="topic_surplus">剩余{{ topicAction.allImg.length }}</div>
                        </div>
                        <div class="topic_optionswrapper">
                            <div class="topic_options topic_options_A" ref="topic_options_A"
                                @click="move('topic_options_love_A')">
                                <div class="love_blank" ref="topic_options_love_A"></div>
                                <div class="topic_options_img">
                                    <van-image :src="topicAction.optionsAImg[0]" fit="cover"></van-image>
                                </div>
                            </div>
                            <div class="topic_options topic_options_B" ref="topic_options_B"
                                @click="move('topic_options_love_B')">
                                <div class="love_blank" ref="topic_options_love_B"></div>
                                <div class="topic_options_img">
                                    <van-image :src="topicAction.optionsBImg[0]" fit="cover"></van-image>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
            <van-dialog v-model="topicDialogShow" class="topicDialog" title="请选择" :beforeClose="randumTopic"
                theme="round-button" confirm-button-text="随机">
                <div style="padding:20px 0;" v-if="loading">
                    <van-loading color="#0094ff" size="24px" vertical>加载中...</van-loading>
                </div>
                <van-cell-group v-else style="margin:10px;" inset>
                    <van-cell v-for="(item, index) in topicList" :key="index" @click="startGame(index)"
                        :title="item.title" :label="item.label" is-link></van-cell>
                </van-cell-group>
            </van-dialog>
            <van-dialog v-model="isOver" class="topicDialog" :title="topicAction.title" cancel-button-text="分享"
                confirm-button-text="继续" :beforeClose="beforeClose" theme="round-button"
                :show-cancel-button="isShare">
                <div v-for="(item, index) in topicAction.statistics || []" :key="index" class="review-item">
                    <h2>{{ item.count }}</h2>
                    <h4 v-if="item.name">{{ item.name }}</h4>
                    <van-image :src="item.url" fit="cover"></van-image>
                </div>
                <div style="font-size: 13px;text-align: center;padding: 10px;color: #323233;">
                    如果您有更好的创意请点击<a style="text-decoration: underline;"
                        href="https://wenjuan.feishu.cn/m?t=sJPFPizCp2Gi-03xg" target="_blank"
                        rel="noopener noreferrer">提交创意</a>
                </div>
            </van-dialog>
        </div>
    </div>
</template>

<script>
const shareIcon = `data:image/png;base64,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`;
export default {
    name: 'singleTopicSelection',
    data() {
        return {
            isShare:(typeof navigator.share != 'undefined'),
            moveIng: false,
            heartShow: false,
            topicDialogShow: true,
            loading: true,
            topicList: [],
            gameing: false,//游戏中
            isOver: false,//游戏是否结束
            topicAction: {
                title: "",
                imgs: [],
                allImg: [],
                optionsAImg: [],
                optionsBImg: [],
                statistics: []
            }
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
        setAngle(n, is) {
            const love = this.$refs['love'];
            if (!is) {
                love && (love.style.marginLeft = `${n}px`);
            } else {
                love && (love.style.marginLeft = `-${n}px`);
            }
        },
        select(str, is) {
            if (str == "A" && this.gameing && !this.isOver) {
                this.move(is ? 'topic_options_love_A' : 'topic_options_love_B')
            };
            if (str == "B" && this.gameing && !this.isOver) {
                this.move(is ? 'topic_options_love_B' : 'topic_options_love_A')
            };
        },
        async startGame(index) {
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: 'loading',
            });
            const item = JSON.parse(JSON.stringify(this.topicList[index]));
            if (item.imgs.length < 3) {
                vant.Notify({ type: 'danger', message: `[${item.title}]-敬请期待` });
                toast.clear();
                this.topicDialogShow = true;
                return;
            };
            await this.loadImg(item.imgs); //加载图片
            this.topicDialogShow = false;
            this.topicAction = {
                title: item.title,
                imgs: item.imgs,
                allImg: item.imgs.sort((a, b) => Math.random() > 0.5 ? -1 : 1).filter((e, i) => i < 8).map(e => e.url && e.url),  //打乱顺序 && 最多取8条
                optionsAImg: [],
                optionsBImg: [],
                statistics: [],
            };
            console.log('[item]', item);
            console.log('[topicAction]', this.topicAction);
            this.selectTopic('A', 'noStatistics');
            this.selectTopic('B', 'noStatistics');
            this.gameing = true;
            this.$nextTick(_ => {
                this.move('love_topic_name')
            });
            toast.clear();
        },
        //统计
        statistics(url) {
            const item = this.topicAction.imgs.find(e => e.url === url);
            const index = this.topicAction.statistics.findIndex(e => e.url === url);
            if (index >= 0) {
                let item = this.topicAction.statistics.find(e => e.url === url);
                this.$set(this.topicAction.statistics[index], 'count', item.count + 1)
            } else {
                this.topicAction.statistics.push({ count: 1, url, name: item.name })
            }
        },
        selectTopic(type, statisticsStr) {
            if (this.isOver || this.topicDialogShow) {
                return;
            }
            if (this.topicAction.allImg.length <= 0) {
                this.gameing = true;
                const arr = JSON.parse(JSON.stringify(this.topicAction.statistics));
                this.topicAction.statistics = arr.sort(this.compare('count'))
                this.isOver = true;
                console.log('Over')
            } else {
                this.isOver = false;
                if (type == "A") {
                    let url = this.topicAction.optionsBImg[0];
                    (statisticsStr != "noStatistics") && this.statistics(url);
                    this.topicAction.optionsAImg.unshift(this.topicAction.allImg[0]);
                } else if (type == "B") {
                    let url = this.topicAction.optionsAImg[0];
                    (statisticsStr != "noStatistics") && this.statistics(url);
                    this.topicAction.optionsBImg.unshift(this.topicAction.allImg[0]);
                };
                this.topicAction.allImg.shift();
            }
        },
        //随机
        randumTopic(action, done) {
            if (this.topicList.length > 0) {
                done();
                this.startGame(this.randum(0, this.topicList.length - 1))
            } else {
                this.$toast('topicList null')
                done(false);
            }
        },
        //获取数据
        getData() {
            this.loading = true;
            const url = "https://cdn.jsdelivr.net/gh/wangpeng1478/web@master/ImageSelect/data.json";
            fetch(`${url}?s=${new Date().getDate()}_${new Date().getHours()}`).then(r => r.json()).then(response => {
                this.topicList = response.filter(e => e.imgs && e.imgs.length >= 4);
                this.loading = false;
            }).catch(err => {
                this.loading = false;
                console.log(err);
            });
        },
        getElementPagePosition(element) {
            //计算x坐标
            var actualLeft = element.offsetLeft;
            var current = element.offsetParent;
            while (current !== null) {
                actualLeft += (current.offsetLeft + current.clientLeft);
                current = current.offsetParent;
            }
            if (document.compatMode == "BackCompat") {
                var elementScrollLeft = document.body.scrollLeft;
            } else {
                var elementScrollLeft = document.documentElement.scrollLeft;
            }
            var left = actualLeft - elementScrollLeft;
            //计算y坐标
            var actualTop = element.offsetTop;
            var current = element.offsetParent;
            while (current !== null) {
                actualTop += (current.offsetTop + current.clientTop);
                current = current.offsetParent;
            }
            if (document.compatMode == "BackCompat") {
                var elementScrollTop = document.body.scrollTop;
            } else {
                var elementScrollTop = document.documentElement.scrollTop;
            }
            var right = actualTop - elementScrollTop;
            //返回结果
            return { x: left, y: right }
        },
        async move(e, is) {
            if ((this.moveIng && !is) || this.isOver) {
                return;
            };
            this.moveIng = true;
            const love = this.$refs['love'];
            const heart = this.$refs['heart'];
            const topic_name = this.$refs['topic_name'];
            const topic_options_A = this.$refs['topic_options_A'];
            const topic_options_B = this.$refs['topic_options_B'];
            const dom = this.$refs[e];
            const { x, y } = this.getElementPagePosition(dom);
            if (e === "love_topic_name") {
                topic_name.style.transform = `translate(0px,0px)`;
                topic_options_A.style.transform = `translate(0px,0px) rotate(0deg) scale(1)`;
                topic_options_B.style.transform = `translate(0px,0px) rotate(0deg) scale(1)`;
                topic_options_A.style.boxShadow = `inset 0 0 0px 0 transparent`;
                topic_options_B.style.boxShadow = `inset 0 0 0px 0 transparent`;
                love.style.transform = `translate(${x}px,${y}px) rotate(0deg) scale(1)`;
                love.style.background = `#fff`;
                await this.delay(0.6);
                this.moveIng = false;
                love.style.transition = `0.5s ease-in-out`;
                heart.classList.remove('heartAnimation');
            } else if (e == "topic_options_love_A") {
                topic_name.style.transform = `translate(20px,0px)`;
                topic_options_A.style.boxShadow = `inset 0 0 0 10px #e2264d`;
                topic_options_A.style.transform = `translate(0px,0px) rotate(-10deg) scale(1.3)`;
                topic_options_B.style.transform = `translate(20px,0px) rotate(0deg) scale(1)`;
                love.style.transform = `translate(${x - 12}px,${y - 10}px) rotate(-10deg) scale(1.3)`;
                love.style.background = `transparent`;
                await this.delay(0.4);
                heart.classList.add('heartAnimation');
                await this.delay(0.3);
                this.move('love_topic_name', true);
                this.selectTopic("B");
            } else if (e == "topic_options_love_B") {
                topic_name.style.transform = `translate(-20px,0px)`;
                topic_options_A.style.transform = `translate(-20px,0px) rotate(0deg) scale(1)`;
                topic_options_B.style.boxShadow = `inset 0 0 0 10px #e2264d`;
                topic_options_B.style.transform = `translate(-20px,0px) rotate(10deg) scale(1.3)`;
                love.style.transform = `translate(${x - 12}px,${y - 10}px) rotate(10deg) scale(1.3)`;
                love.style.background = `transparent`;
                await this.delay(0.4);
                heart.classList.add('heartAnimation');
                await this.delay(0.3);
                this.move('love_topic_name', true);
                this.selectTopic("A");
            };

        },
        async loadImg(Arr) {
            const loadAll = Arr.map(async (iten) => {
                return new Promise(resolve => {
                    const img = new Image();
                    img.src = iten.url;
                    img.onload = () => {
                        resolve(img);
                    };
                    img.onerror = () => {
                        resolve(img);
                    };
                })
            });
            return Promise.all(loadAll)
        },
        randum(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min)
        },
        compare(property) {
            return function (a, b) {
                var value1 = a[property];
                var value2 = b[property];
                return value2 - value1;
            }
        },
        //延迟
        delay(m = 1) {
            return new Promise(res => {
                setTimeout(() => {
                    res(true);
                }, m * 1000);
            })
        },
        async beforeClose(action, done) {
            if (action === "cancel") {
                try {
                    const { host, search, href } = location;
                    const { projectId } = Object.fromEntries(new URLSearchParams(search));

                    const statistics = this.topicAction.statistics;
                    let result = '';
                    let blob;
                    if (statistics && statistics.length > 0 && statistics[0].name) {
                        result = `-${statistics[0].name}`;
                        blob = await fetch(statistics[0].url).then(r => r.blob());
                    };
                    let files = [];
                    if (blob) {
                        files = [this.Base64UrlToBlob(await this.toBase64(blob))];
                    } else {
                        files = [this.Base64UrlToBlob(shareIcon)];
                    }
                    console.log('files', files);
                    navigator.share({
                        url: host === "code.devrank.cn" ? `https://code.juejin.cn/pen/${projectId}` : href,
                        title: `我在玩图片选择题（${this.topicAction.title}${result || ''}）,您也来试试吧！`,
                        text: `我在玩图片选择题（${this.topicAction.title}${result || ''}）,您也来试试吧！`,
                        files
                    }).then(res => {
                        this.$toast('分享成功')
                        done(false);
                    }).catch(err => {
                        this.$toast('分享失败-' + err)
                        done(false);
                    })
                } catch (error) {
                    this.$toast('分享失败-' + error)
                    done(false);
                }
            } else {
                done();
                this.topicDialogShow = true;
            }
        },
        toBase64(blob) {
            return new Promise(res => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = () => {
                    res(reader.result);
                };
            })
        },
        Base64UrlToBlob(base64, type = "image/png", filename = "icon.png") {
            // 获取到base64编码
            const base64_str = base64.split(',');
            // 将base64编码转为字符串
            const decode_str = atob(base64_str[1]);
            let n = decode_str.length;
            // 创建初始化为0的，包含length个元素的无符号整型数组
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = decode_str.charCodeAt(n);
            }
            return new File([u8arr], filename, {
                type,
            });
        },
    }
}
</script>


<style lang="less">
.singleTopicSelection{
    position: relative;
    z-index: 20;

.topic_wrapper {
    position: fixed;
    top: 5vh;
    left: 50%;
    width: 300px;
    margin-left: -150px;
}

.topic_wrapper .topic_name {
    width: 80%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: inherit;
    min-height: 80px;
    background-color: #f2f9ff;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    transition: 0.5s ease-in-out;
}

.topic_surplus {
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 12px;
    opacity: 0.5;
    transform: scale(0.7);
}

.topic_wrapper .topic_name .topic_name_bg {
    background-color: #fff;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 6px;
    border-radius: 10px;
    overflow: hidden;
    color: #323233;
    font-size: 15px;
    font-weight: 600;
    padding: 20px 15px;
    text-align: center;
}

.topic_optionswrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: -20px;
    position: relative;
    z-index: 1;
}

.topic_optionswrapper .topic_options {
    position: relative;
    padding: 5px;
    width: 70px;
    height: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    background-color: #f2f9ff;
    box-shadow: inset 0 0 0 0 transparent;
    transition: 0.5s ease-in-out;
    overflow: hidden;
}

.topic_options_img .van-image,
.topic_options_img .img {
    display: block;
    width: 100%;
    height: 100%;
}

.love_wrapper {
    background: #fff;
    font-size: 12px;
    width: 25px;
    height: 25px;
    border-radius: 100px;
    position: fixed;
    top: 0;
    left: 0;
    transform: translate(0, 0);
    z-index: 10;
}

.love_blank {
    position: absolute;
    width: 25px;
    height: 25px;
    background-color: red;
    border-radius: 100px;
    left: 50%;
    top: -12.5px;
    margin-left: -12.5px;
    opacity: 0;
}

.love_wrapper .heart {
    background: url('data:image/png;base64,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');
    background-position: right;
    background-repeat: no-repeat;
    display: block;
    background-size: 2900%;
    position: absolute;
    height: 40px;
    width: 40px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.heartAnimation {
    -webkit-animation-name: heartBlast;
    animation-name: heartBlast;
    -webkit-animation-duration: .8s;
    animation-duration: .8s;
    -webkit-animation-iteration-count: 1;
    animation-iteration-count: 1;
    -webkit-animation-timing-function: steps(28);
    animation-timing-function: steps(28);
    background-position: right;
}

@-webkit-keyframes heartBlast {
    0% {
        background-position: left;
    }

    100% {
        background-position: right;
    }
}

@keyframes heartBlast {
    0% {
        background-position: left;
    }

    100% {
        background-position: right;
    }
}

.topicDialog .van-dialog__header {
    padding-bottom: 10px;
    padding-top: 20px;
}

.topicDialog .van-dialog__content {
    background-color: #f7f8fa;
    -webkit-overflow-scrolling: touch;
    overflow: hidden auto;
    max-height: 40vh;
    min-width: 100px;
    transition: 0.25s;
}

.topic_options_img {
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff;
    position: relative;
    width: 100%;
    height: 100%;
}

.topic_options_img::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: 100%;
    height: 100%;
    z-index: 5;
}



.review-item {
    display: block;
    margin: 15px;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
}

.review-item .van-image,
.review-item .van-image img {
    display: block;
    width: 100%;
}

.review-item h2 {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #000;
    z-index: 10;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 100px;
    opacity: 0.8;
    color: #fff;
    margin: 0;
}

.review-item h4 {
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10;
    font-size: 12px;
    padding: 10px 0;
    color: #fff;
    width: 100%;
    text-align: center;
    margin: 0;
}

.review-item h2::before {
    content: 'x';
}
}

</style>

<template>
    <div class="barrageAI">
        <div v-if="loading" style="padding:20px 0;">
            <van-loading color="#0094ff" size="24px" vertical>加载中</van-loading>
        </div>
        <div :style="{'opacity':loading?0:1}">
            <h1>防挡弹幕</h1>
            <div style="width:100%" ref="dplayer"></div>
            <br />
            <van-cell-group inset>
                <van-field label="视频" :value="actionViedo.name" @click="viedoActionShow=true" readonly is-link></van-field>
                <van-field label="智能防挡弹幕">
                    <template #input>
                        <van-switch v-model="maskOpen" size="20" />
                    </template>
                </van-field>
                <van-field label="模型分类">
                    <template #label>
                        <span>模型分类</span>
                        <van-icon name="question-o" @click="showDialog('尺寸越大，识别越准确，同时性能也更差')" style="padding: 0 3px;" />
                    </template>
                    <template #input>
                        <van-radio-group :disabled="!maskOpen" @change="changeModelType" v-model="modelType">
                            <van-radio name="landscape">144x256 x3</van-radio>
                            <van-radio name="general">256x256 x3</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>
                <van-field>
                    <template #label>
                        <span>阈值概率</span>
                        <van-icon name="question-o" @click="showDialog('前景阈值概率(越小物体越清晰，同时噪点也比较多)')" style="padding: 0 3px;" />
                    </template>
                    <template #input>
                        <van-slider :disabled="!maskOpen" v-model="foregroundThresholdProbability" min="0.1" max="1" step="0.1"/>
                    </template>
                </van-field>
                <van-field>
                    <template #label>
                        <span>上传视频</span>
                        <van-icon name="question-o" @click="showDialog('视频背景不要太乱')" style="padding: 0 3px;" />
                    </template>
                    <template #input>
                        <van-uploader :before-read="uploaderViedo" accept="video/*" />
                    </template>
                </van-field>
            </van-cell-group>
            <br />
            <img v-if="maskOpen && maskImageUrl" :src="maskImageUrl" width="100%" />
        </div>

        <van-action-sheet v-model="viedoActionShow" :actions="viedoList" description="请选择视频" @select="viedoActionSelect" cancel-text="取消" close-on-click-action>
        </van-action-sheet>
    </div>
</template>

<script>
import { isObjEmpty } from '@/libs/utils';
import DPlayer from 'dplayer';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import '@mediapipe/selfie_segmentation';
/* https://github.com/tensorflow/tfjs-models/tree/master/body-segmentation */
export default {
    data() {
        return {
            loading:true,
            maskOpen:true,
            foregroundThresholdProbability:0.3,
            modelType:"landscape",
            segmenter:null,
            task:null,
            dp:null,
            videoUrl:'',
            maskImageUrl:'', //遮罩
            viedoActionShow:false,
            viedoList:[
                {
                    name: '只因你太美（鸡你太美）',
                    subname: '蔡徐坤',
                    url:"https://dcdn.it120.cc/2022/11/04/87b7b5af-476c-4d2b-ae90-36724d66a407.mp4",
                    barrage:[ "时 隔 四 年 依 然 经 典", "小小房间竟然人才辈出，实在是恐怖如斯", "《有生之年看到原版》", "以前的鲲鲲充满了自信和笑容", "梦开始的地方", "1.自我介绍", "这短暂的一分钟养活了多少up主（doge）", "万 恶 之 源", "《开 始 吟 唱》", "《名场面》", "《music》", "《经典咏流传》", "非物质文化遗产", "《文艺复兴》", "《白 带 异 常》", "梦开始的地方，我的梦回来了", "每一帧都是经典", "每一帧都是表情包诶", "《梦开始的地方》", "5.优雅转身", "前 方 高 能", "准备铁山靠", "《铁山靠》", "招式3:《铁 山 靠》", "坤法第一式：铁山靠", "小秘密：随便一帧都是经典画面", "《白鹤亮翅》", "跳水00:40", "《 老 肩 巨 滑 》", "《每天一遍，精神百倍》", "优雅，真的是优雅", "《经典永流传》", "《垂直握把》", "《起舞弄清影》", "每时每刻打开都有人在看系列", "《护裆派》", "《让我蠢蠢欲动》", "᭙ᦔꪀꪑᦔ，​", "这种感觉我从未有Cause I Got A Cush On You Who You", "武当（档）派", "爷不知道就他笑死了多少无辜的生命", "《国家宝藏》之家禽", "《无效定语从句》", "卧槽，每一帧都是万恶之源", "“鳖”", "每日一遍", "嘎子偷狗时代考察", "《亡之音》", "看见这个头型我就想笑", "最后亿遍", "期待的话，请多多为我投票吧！", "《作词作曲》", "你干嘛∽哈哈～哎呦", "糖果超甜", "笑死我了哈哈哈哈", "你是我的我是你的谁", "原版都这么滑稽哈哈哈", "你不要过来！！！", "《啥时候都有人》", "我的口头禅" ],
                },
                {
                    name: '蓝色战衣1',
                    subname: '一栗小莎子',
                    url:"https://dcdn.it120.cc/2022/11/07/2cfeb9cd-84ff-4981-8ac1-ffa421c82ff1.mp4",
                    barrage:[ "蓝色这个无法超越啊，但是到底哪里不一样嘞", "让我看看谁22年七月份还在看", "看来粉色战衣后回来看看蓝色的，果然还是蓝色更好", "这就是传说中的。蓝衣战神。", "曹操只有一个，但曹贼不是", "S21版本T0英雄莎子相较上版本T0英雄电气鼠 英雄强度差别不大 主打身材流 扭捏颤抖流 但新版本蓝色战袍加身的莎子完美契合男人审美而电气鼠出装一成不变略有逊色，可谓名副其实版本T0", "蓝色战衣：起源（考古）", "她其实什么都懂", "好厉害", "36度会忍不住脱衣服，41度就大脑缺氧了", "有些人我不想点破", "林志玲？", "作者通过穿黑丝，露大腿，形象生动的表达了自己对夏天的喜爱和热情深刻的反应了当代劳动人民夏天特别热的社会现状，表达了对这个大自然的不满之情，以及作者豁达桀骜不驯的内心", "我们班男生天天喊的蓝色战衣是这个吗！？", "有人现在还在看吗", "考古", "@雷电将军 ", "22年10月了",  "你的体温", "蓝衣战神", "@哎哟。 小莎子",  "啊 这……", "@叭叭叭 久久不能入怀", "@qyJLJ& 好会", "每天看十遍", "@玖 这个", "@小鲨鱼 喜欢",  "考古来了", "蓝衣战神", "不行了", "没人能超越我！", "看来粉色战衣后回来看看蓝色的，果然还是蓝色更好", "@黎夏 真的好看", "@Miss Lu 是有点像", "让我看看谁22年10月份还在看", "我还在看@Jͮoͮkͮeͮrͮ ", "@李知恩- @阿彩 @M⁵ 一波抖音回忆，这首歌我老喜欢了", "@一生要强汤姆猫 再艾特艾特你，怕你忘了",  "我王贺兵就爱看这个", "女上", "考古" ],
                },
                {
                    name: '蓝色战衣2',
                    subname: '一栗小莎子',
                    url:"https://dcdn.it120.cc/2022/11/07/23a4e8ae-5a2f-4801-a557-cb5214d0d648.mp4",
                    barrage:[ "蓝色这个无法超越啊，但是到底哪里不一样嘞", "让我看看谁22年七月份还在看", "看来粉色战衣后回来看看蓝色的，果然还是蓝色更好", "这就是传说中的。蓝衣战神。", "曹操只有一个，但曹贼不是", "S21版本T0英雄莎子相较上版本T0英雄电气鼠 英雄强度差别不大 主打身材流 扭捏颤抖流 但新版本蓝色战袍加身的莎子完美契合男人审美而电气鼠出装一成不变略有逊色，可谓名副其实版本T0", "蓝色战衣：起源（考古）", "她其实什么都懂", "好厉害", "36度会忍不住脱衣服，41度就大脑缺氧了", "有些人我不想点破", "林志玲？", "作者通过穿黑丝，露大腿，形象生动的表达了自己对夏天的喜爱和热情深刻的反应了当代劳动人民夏天特别热的社会现状，表达了对这个大自然的不满之情，以及作者豁达桀骜不驯的内心", "我们班男生天天喊的蓝色战衣是这个吗！？", "有人现在还在看吗", "考古", "@雷电将军 ", "22年10月了",  "你的体温", "蓝衣战神", "@哎哟。 小莎子",  "啊 这……", "@叭叭叭 久久不能入怀", "@qyJLJ& 好会", "每天看十遍", "@玖 这个", "@小鲨鱼 喜欢",  "考古来了", "蓝衣战神", "不行了", "没人能超越我！", "看来粉色战衣后回来看看蓝色的，果然还是蓝色更好", "@黎夏 真的好看", "@Miss Lu 是有点像", "让我看看谁22年10月份还在看", "我还在看@Jͮoͮkͮeͮrͮ ", "@李知恩- @阿彩 @M⁵ 一波抖音回忆，这首歌我老喜欢了", "@一生要强汤姆猫 再艾特艾特你，怕你忘了",  "我王贺兵就爱看这个", "女上", "考古" ],
                },
            ],
            actionViedo:{}
        };
    },
    mounted() {
        this.playViedo(this.viedoList[0]);
    },
    beforeDestroy() {
        this.task && (window.cancelAnimationFrame(this.task));
        this.dp && this.dp.destroy();
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
        showDialog(message,title="提示"){
            this.$toast.clear();
            this.$dialog.alert({
                title,
                message:`<b>${message}</b>`,
                theme: 'round-button',
                confirmButtonText:'知道了'
            }).then(() => {
                // on close
            });
        },
        viedoActionSelect(e){
            this.playViedo(e);

        },
        async playViedo(item){
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: 'loading',
            });
            this.dp?(this.dp.pause(),this.dp.danmaku.clear()):(toast.clear(),this.loading = true);
            item.viedoUrl = item.url;
            this.actionViedo = item;
            this.viedoList = this.viedoList.map(e=>{
                e.color = e.name == item.name ? '#1989fa' : '#323233';
                return e
            });
            this.dp?(this.dp.switchVideo({url:item.viedoUrl})):(this.dpInit());
            this.loading = false;
            await this.segmenter && this.segmenter.dispose();
            toast.clear();
            await this.bodySegmentationInit();
        },
        async changeModelType(e){
            this.dp && this.dp.pause();
            await this.segmenter && this.segmenter.dispose();
            this.segmenter = null;
            await this.bodySegmentationInit();
        },
        async uploaderViedo(file){
            this.maskImageUrl = '';
            this.dp && this.dp.pause();
            this.dp && this.dp.danmaku.clear();
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '上传图片中',
            });
            this.actionViedo = {};
            const url = window.URL && window.URL.createObjectURL(file);
            this.dp.switchVideo({
                url,
            })
            toast.clear();
            await this.segmenter && this.segmenter.dispose();
            this.segmenter = null;
            await this.bodySegmentationInit();
            return false
        },
        randomDanmaku(){
            const danmaku = this.actionViedo.barrage||[new Date().toLocaleString(),'测试测试测试测试测试测试'];//弹幕文字
            const colors = ['#ffffff','#ffffff','#ffffff','#ffffff','#e54256','#ffe133','#64DD17','#D500F9'];
            const types = [0,1,2];

            const randomItem = arr => arr[Math.random() * arr.length | 0];
            this.dp.danmaku.draw({
                text: randomItem(danmaku),
                color: randomItem(colors),
                type: randomItem(types), //滚动
            });
        },
        // 视频初始化
        dpInit(){
           this.dp = new DPlayer({
                container: this.$refs.dplayer,
                loop:true,
                volume:0,
                video: {
                    url:this.actionViedo.viedoUrl,
                },
                danmaku:{
                    id: "9E2E3368B56CDBB4",
                    api:'/dplayer/',
                    bottom:"10%",
                    unlimited:false,
                },
            });
            this.dp.video.setAttribute('crossorigin','anonymous'); //在发送跨域请求时不携带凭证（credential）信息
            this.dp.on('play',()=>{
                if (this.task) {
                    window.cancelAnimationFrame(this.task);
                    this.task = null;
                };
                this.task = window.requestAnimationFrame(this.recognition);
            })
            this.dp.on('pause',()=>{
                if (this.task) {
                    window.cancelAnimationFrame(this.task);
                    this.task = null;
                };
            })
            this.dp.on('danmaku_send',(e)=>{
                console.log(e);
            })
        },
        //模型初始化
        async bodySegmentationInit(){
            try {
                const toast = this.$toast.loading({
                    duration: 0, // 持续展示 toast
                    forbidClick: true,
                    message: '模型加载中',
                });
                const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
                const segmenterConfig = {
                    runtime:'mediapipe',
                    modelType:this.modelType,
                    solutionPath:'https://unpkg.com/@mediapipe/selfie_segmentation',
                };
                this.segmenter = await bodySegmentation.createSegmenter(model, segmenterConfig);
                toast.clear();
                this.dp && this.dp.notice('模型加载完成');
                this.dp && this.dp.play();
            } catch (error) {
                this.showDialog('模型加载失败-'+error);
            }
        },
        //识别
        async recognition(){
            const danmaku = this.$refs.dplayer && this.$refs.dplayer.querySelector(".dplayer-danmaku");
            try {
                this.randomDanmaku();
                if(this.segmenter && this.maskOpen && danmaku){
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext('2d');
                    //压缩视频尺寸
                    const imageData = await this.compressionImage(this.dp.video);
                    const segmentationConfig = {
                        flipHorizontal: false,
                        multiSegmentation: false,
                        segmentBodyParts: true,
                        segmentationThreshold:1,
                    };
                    const people = await this.segmenter.segmentPeople(imageData, segmentationConfig);
                    const foregroundColor = {r: 0, g: 0, b: 0, a: 0}; //用于可视化属于人的像素的前景色 (r,g,b,a)。
                    const backgroundColor = {r: 0, g: 0, b: 0, a: 255}; //用于可视化不属于人的像素的背景颜色 (r,g,b,a)。
                    const drawContour = false; //是否在每个人的分割蒙版周围绘制轮廓。
                    const foregroundThresholdProbability = this.foregroundThresholdProbability; //将像素着色为前景而不是背景的最小概率。
                    const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(people, foregroundColor, backgroundColor, drawContour, foregroundThresholdProbability);
                    // console.log('[backgroundDarkeningMask]',backgroundDarkeningMask);
                    canvas.width = backgroundDarkeningMask.width;
                    canvas.height = backgroundDarkeningMask.height;
                    context.putImageData(backgroundDarkeningMask,0,0);
                    const Base64 = canvas.toDataURL("image/png");
                    this.maskImageUrl = Base64;
                    const {width,height} = this.dp.video.getBoundingClientRect();
                    //加载图片到缓存中（如果不加载到缓存中，会导致mask-image失效，因为图片还没有加载到页面上，新的图片已经添加上去了，会导致图片一直是个空白）
                    await this.imgLoad(Base64);
                    danmaku.style = `-webkit-mask-image: url(${Base64});-webkit-mask-size: ${width}px ${height}px;`
                    this.task = window.requestAnimationFrame(this.recognition);
                }else{
                    danmaku.style = '';
                    this.task = window.requestAnimationFrame(this.recognition);
                }
            } catch (err) {
                danmaku.style = '';
                this.task = window.requestAnimationFrame(this.recognition);
            }
        },
        imgLoad(src){
            return new Promise(async resolve => {
                const img = new Image();
                img.src = src;
                img.onload = ()=>{
                    resolve(img);
                };
                img.onerror = ()=>{
                    resolve(img);
                };
            })
        },
        //压缩
        compressionImage(el){
            return new Promise(async resolve => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // 原始尺寸
                const elRect = el.getBoundingClientRect();
                const originWidth = elRect.width;
                const originHeight = elRect.height;

                // 最大尺寸限制
                const maxWidth = 350;
                const maxHeight = 350;

                // 目标尺寸
                var targetWidth = originWidth,
                    targetHeight = originHeight;
                if (originWidth > maxWidth || originHeight > maxHeight) {
                    if (originWidth / originHeight > maxWidth / maxHeight) {
                        // 更宽，按照宽度限定尺寸
                        targetWidth = maxWidth;
                        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                    } else {
                        targetHeight = maxHeight;
                        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                    }
                };
                // canvas对图片进行缩放
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                // 清除画布
                context.clearRect(0, 0, targetWidth, targetHeight);
                // 压缩
                context.drawImage(el, 0, 0, targetWidth, targetHeight);
                const imageData = context.getImageData(0, 0, targetWidth, targetHeight);
                resolve(imageData);
            })
        },
        convertBase64UrlToBlob(base64) {
            let urlData = base64
            let type = base64.type
            let bytes = null
            if (urlData.split(',').length > 1) {//是否带前缀
                bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte
            } else {
                bytes = window.atob(urlData)
            }
            // 处理异常,将ascii码小于0的转换为大于0
            let ab = new ArrayBuffer(bytes.length)
            let ia = new Uint8Array(ab)
            for (let i = 0; i < bytes.length; i++) {
                ia[i] = bytes.charCodeAt(i)
            }
            return new Blob([ab], { type: type })
        },
    },
};
/*
var arr = [];
document.querySelectorAll('[data-e2e="comment-item"] .RHiEl2d8 .YzbzCgxU .a9uirtCT .VD5Aa1A1 .Nu66P_ba').forEach(el=>{
    el.innerText && arr.push(el.innerText)
})
*/
</script>
<style lang="less">
.barrageAI {
    max-width:500px;
    margin:0 auto;
    padding:15px;
    .dplayer-controller .dplayer-icons .dplayer-full {
        display: none;
    }
    .dplayer-danmaku{
        font-size:13px !important;
    }
    .van-radio:not(:last-child){
        margin-bottom: 8px;
    }
}
</style>
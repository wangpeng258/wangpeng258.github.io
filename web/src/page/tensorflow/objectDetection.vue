<template>
    <div class="objectDetectionView">
        <div class="canvas-wrapper" ref="wrapper">
            <video ref="video"
                :style="{ 'transform': controls.flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }" webkit-playsinline="true"
                playsinline="true" preload autoplay loop muted></video>
            <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"
                :style="{ 'transform': controls.flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"></canvas>
        </div>
    </div>
</template>

<script>
import { isPhone, isObjEmpty } from '@/libs/utils';
import Camera from '@/libs/camera';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd  from '@tensorflow-models/coco-ssd';
// https://github.com/tensorflow/tfjs-models/tree/master/face-detection/src/tfjs
// https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
import GUI from 'lil-gui'; // https://lil-gui.georgealways.com/
export default {

    data() {
        return {
            objectDetection:[ { "en": "person", "zh": "人" }, { "en": "bicycle", "zh": "自行车" }, { "en": "car", "zh": "车" }, { "en": "motorcycle", "zh": "摩托车" }, { "en": "airplane", "zh": "飞机" }, { "en": "bus", "zh": "公共汽车" }, { "en": "train", "zh": "火车" }, { "en": "truck", "zh": "卡车" }, { "en": "boat", "zh": "船" }, { "en": "traffic light", "zh": "红绿灯" }, { "en": "fire hydrant", "zh": "消防栓" }, { "en": "stop sign", "zh": "停止标志" }, { "en": "parking meter", "zh": "收费表" }, { "en": "bench", "zh": "长椅" }, { "en": "bird", "zh": "鸟" }, { "en": "cat", "zh": "猫" }, { "en": "dog", "zh": "狗" }, { "en": "horse", "zh": "马" }, { "en": "sheep", "zh": "羊" }, { "en": "cow", "zh": "奶牛" }, { "en": "elephant", "zh": "大象" }, { "en": "bear", "zh": "熊" }, { "en": "zebra", "zh": "斑马" }, { "en": "giraffe", "zh": "长颈鹿" }, { "en": "backpack", "zh": "背包" }, { "en": "umbrella", "zh": "伞" }, { "en": "handbag", "zh": "手提包" }, { "en": "tie", "zh": "领带" }, { "en": "suitcase", "zh": "手提箱" }, { "en": "frisbee", "zh": "飞盘" }, { "en": "skis", "zh": "滑雪板" }, { "en": "snowboard", "zh": "单板滑雪" }, { "en": "sports ball", "zh": "运动球" }, { "en": "kite", "zh": "风筝" }, { "en": "baseball bat", "zh": "棒球棒" }, { "en": "baseball glove", "zh": "棒球手套" }, { "en": "skateboard", "zh": "滑板" }, { "en": "surfboard", "zh": "冲浪板" }, { "en": "tennis racket", "zh": "网球拍" }, { "en": "bottle", "zh": "瓶子" }, { "en": "wine glass", "zh": "红酒杯" }, { "en": "cup", "zh": "杯子" }, { "en": "fork", "zh": "叉子" }, { "en": "knife", "zh": "刀" }, { "en": "spoon", "zh": "勺子" }, { "en": "bowl", "zh": "碗" }, { "en": "banana", "zh": "香蕉" }, { "en": "apple", "zh": "苹果" }, { "en": "sandwich", "zh": "三明治" }, { "en": "orange", "zh": "橙子" }, { "en": "broccoli", "zh": "西兰花" }, { "en": "carrot", "zh": "萝卜" }, { "en": "hot dog", "zh": "热狗" }, { "en": "pizza", "zh": "比萨" }, { "en": "donut", "zh": "甜甜圈" }, { "en": "cake", "zh": "蛋糕" }, { "en": "chair", "zh": "椅子" }, { "en": "couch", "zh": "长椅" }, { "en": "potted plant", "zh": "盆栽" }, { "en": "bed", "zh": "床" }, { "en": "dining table", "zh": "餐桌" }, { "en": "toilet", "zh": "洗手间" }, { "en": "tv", "zh": "电视" }, { "en": "laptop", "zh": "笔记本电脑" }, { "en": "mouse", "zh": "鼠标" }, { "en": "remote", "zh": "远程" }, { "en": "keyboard", "zh": "键盘" }, { "en": "cell phone", "zh": "手机" }, { "en": "microwave", "zh": "微波炉" }, { "en": "oven", "zh": "烤箱" }, { "en": "toaster", "zh": "烤面包机" }, { "en": "sink", "zh": "水槽" }, { "en": "refrigerator", "zh": "冰箱" }, { "en": "book", "zh": "书" }, { "en": "clock", "zh": "时钟" }, { "en": "vase", "zh": "花瓶" }, { "en": "scissors", "zh": "剪刀" }, { "en": "teddy bear", "zh": "泰迪熊" }, { "en": "hair drier", "zh": "电吹风" }, { "en": "toothbrush", "zh": "牙刷" } ],
            camera: null,
            width: document.documentElement.clientWidth || window.innerWidth,
            height: document.documentElement.clientHeight || window.innerHeight,
            canvasWidth: 0,
            canvasHeight: 0,
            deviceList: [], //设备列表
            isCameraOpen: false, //摄像头是否打开
            task: null, //任务
            model: null, //模型
            modelLoad: true, //模型加载中
            gui:null,
            controls:{
                deviceId: localStorage.getItem(`deviceId`) || 'environment', //设备id
                flipHorizontal: false, // 是否水平翻转
                modelType:"lite_mobilenet_v2",
                maxNumBoxes:20,//检测到的对象的边界框的最大数量。可以有同一类的多个对象，但在不同的位置。默认为20。
                minScore:0.5,//返回的对象的返回边界框的最小分数。值在0到1之间。默认值为0.5。
                rectOpacity:0.6,
            },
            canvas: null,
            ctx: null,
        };
    },
    mounted() {
        this.$notify({ type: 'primary', message: '首次模型加载模型可能需要1-2分钟，请耐心等待', duration: 2000, });
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.cameraInit();
        this.openCamera();
    },
    async beforeDestroy() {
        this.isCameraOpen = false;
        this.gui && this.gui.destroy();
        window.cancelAnimationFrame(this.task);
        await this.camera.stop();
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
        guiInit(){
            this.gui && this.gui.destroy();
            let obj = {};
            (this.objectDetection||[]).forEach(element => {
                obj[`is_${element.en}`] = true;
                obj[`color_${element.en}`] = `#${((Math.random() * 0xfffff * 1000000).toString(16)).slice(0, 6)}`;
            });
            this.controls = Object.assign(this.controls,obj)
            this.gui = new GUI();
            const cameraFolder = this.gui.addFolder(`摄像头`);
            cameraFolder.open();
            const deviceArr = new Object();
            this.deviceList.forEach(element => {
                deviceArr[element.name] = element.deviceId;
            });
            cameraFolder.add(this.controls, 'deviceId', deviceArr).name(`摄像头`).onChange((value) => {
               this.openCamera();
            });
            // cameraFolder.add(this.controls, 'flipHorizontal').name(`镜像`);

            const modeFolder = this.gui.addFolder(`模型`);
            modeFolder.close();
            modeFolder.add(this.controls, 'modelType', ['mobilenet_v1','mobilenet_v2','lite_mobilenet_v2']).name(`模型分类`).onChange((value) => {
                this.createModel();
            });
            modeFolder.add(this.controls, 'maxNumBoxes', 0, 100).name('对象最大数量').step(1);
            modeFolder.add(this.controls, 'minScore', 0, 1).name('对象最小分数').step(0.1);
            modeFolder.add(this.controls, `rectOpacity`,0.1, 1).name(`填充透明度`).step(0.1);

            const modelListFolder = this.gui.addFolder(`模型列表`);
            modelListFolder.close();
            (this.objectDetection||[]).forEach(element => {
                modelListFolder.add(this.controls, `is_${element.en}`).name(`[显示]${element.zh}`);
                modelListFolder.addColor(this.controls, `color_${element.en}`).name(`[颜色]${element.zh}`);
            });

        },
        async getMediaDevices(){
            let deviceList = await this.camera.getMediaDevices();
            this.deviceList = deviceList.map(e => {
                e.name = e.label || e.deviceId;
                e.color = e.deviceId == this.deviceId ? '#1989fa' : '#323233';
                return e
            })
        },
        async cameraInit() {
            const video = this.$refs.video;
            this.camera = new Camera(video, {
                audio: false,
                video: {
                    // width: this.width,
                    // height: this.height,
                }
            });
            await this.getMediaDevices();
            this.guiInit();
        },
        openCamera() {
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '打开摄像头',
            });
            this.isCameraOpen = false;
            this.camera.open(this.controls.deviceId)
                .then(async res => {
                    const video = this.$refs.video;
                    const { videoWidth, videoHeight } = video;
                    const { clientWidth, clientHeight } = video;
                    this.canvasWidth = videoWidth;
                    this.canvasHeight = videoHeight;
                    video.width = videoWidth;
                    video.height = videoHeight;
                    this.$refs.wrapper.style.width = clientWidth+'px';
                    this.$refs.wrapper.style.height = clientHeight+'px';
                    this.isCameraOpen = true;
                    if (res.settings && res.settings.deviceId) {
                        this.controls.deviceId = res.settings.deviceId;
                        window.localStorage.setItem(`deviceId`, this.controls.deviceId);
                    };
                    await this.createModel();
                    window.cancelAnimationFrame(this.task);
                    this.task = window.requestAnimationFrame(this.recognition);
                })
                .catch(error => {
                    console.log(error);
                    this.$dialog.alert({
                        title: '失败',
                        message: `打开摄像头失败：${error.errMsg}`,
                        theme: 'round-button',
                    }).then(() => {
                        this.$router.replace('/')
                    });
                })
                .finally(() => {
                    toast.clear();
                })
        },
         //创建模型
         createModel() {
            return new Promise(async resolve => {
                this.modelLoad = true;
                const toast = this.$toast.loading({
                    duration: 0, // 持续展示 toast
                    forbidClick: true,
                    message: '加载模型中',
                });
                this.model = await cocoSsd.load({ base:this.controls.modelType });
                toast.clear();
                this.modelLoad = false;
                resolve(this.model);
            })
        },
        //识别
        async recognition() {
            try {
                if (this.isCameraOpen && !this.modelLoad) {
                    const video = this.$refs.video;
                    const detectArgs = {
                        maxNumBoxes:this.controls.maxNumBoxes, //检测到的对象的边界框的最大数量。可以有同一类的多个对象，但在不同的位置。默认为20。
                        minScore:this.controls.minScore, //返回的对象的返回边界框的最小分数。值在0到1之间。默认值为0.5。
                    };
                    const predictions = await this.model.detect(video, detectArgs.maxNumBoxes,detectArgs.minScore);
                    this.drawResults(predictions, video);
                };
                this.task = window.requestAnimationFrame(this.recognition);
            } catch (error) {
                console.log(error);
                this.task = window.requestAnimationFrame(this.recognition);
            }
        },
        //绘制
        drawResults(predictions){
            // console.log(predictions);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 0.8;
            predictions.forEach(element => {
                const [x, y, width, height] = element.bbox;
                const info = this.objectDetection.find(e=>e.en===element.class)||{};
                if(!this.isEmpty(info) && this.controls[`is_${element.class}`]){
                    const color = this.controls[`color_${element.class}`];
                    this.ctx.strokeStyle=color;
                    this.ctx.fillStyle= this.toRGBA(color,this.controls.rectOpacity||0.6); //填充
                    this.ctx.fillRect(x, y, width, height);
                    this.ctx.strokeRect(x, y, width, height);
                    const fontSize = (width/13)>15?15:(width/13)<8?8:(width/13);
                    this.ctx.font = `${fontSize}px bold Helvetica`;
                    this.ctx.fillStyle = this.colorReverse(color);
                    const text = `${info.zh}`;
                    const textWidth = this.ctx.measureText(text).width;
                    this.ctx.fillText(text,x+(width/2)-(textWidth/2),y+(height/2)+(fontSize/2));

                    this.ctx.font = `${fontSize*0.8}px Helvetica`;
                    this.ctx.fillText(`分数:${element.score.toFixed(2)}`,x+5,y+(fontSize*0.8)+5);
                }

            });
        },
        //颜色反转
        colorReverse(oldColor){
            oldColor = '0x' + oldColor.replace(/#/g, '');
            let str = '000000' + (0xFFFFFF - oldColor).toString(16);
            return '#'+ str.substring(str.length - 6, str.length);
        },
        toRGBA(str,opacity){
            // 16进制颜色值的正则
            var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            // 把颜色值变成小写
            var color = str.toLowerCase();
            if (reg.test(color)) {
                // 如果只有三位的值，需变成六位，如：#fff => #ffffff
                if (color.length === 4) {
                    var colorNew = "#";
                    for (var i = 1; i < 4; i += 1) {
                        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
                    }
                    color = colorNew;
                }
                // 处理六位的颜色值，转为RGB
                var rgbc = [];
                for (var i = 1; i < 7; i += 2) {
                    rgbc.push(parseInt("0x" + color.slice(i, i + 2)));
                }
                //floor 向下取整
                for (var i = 0; i < 3; i++) rgbc[i] = Math.floor(rgbc[i] * (1 - 0.1));
                return `rgba(${rgbc[0]},${rgbc[1]},${rgbc[2]},${opacity})`
            } else {
                return color;
            }
        },
    },
};
</script>
<style lang="less" scoped>
.objectDetectionView {
    width: 100%;
    height: 100%;
    background-color: #000;
    overflow: hidden;
    .canvas-wrapper {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        max-width:600px;
        margin: 0 auto;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .canvas-wrapper>video {
        background: #000;
        display: block;
        width: 100%;
        height: auto;
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 1;
    }

    .canvas-wrapper>canvas {
        display: block;
        width: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 2;

    }
}
</style>

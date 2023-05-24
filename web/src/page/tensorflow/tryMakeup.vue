<template>
    <div class="tryMakeup">
        <div class="canvas-wrapper" ref="wrapper">
            <video ref="video"
                :style="{ 'transform': controls.flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"
                webkit-playsinline="true" playsinline="true" preload autoplay loop muted></video>
            <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        </div>
    </div>
</template>

<script>
//域名
// app-master.youcamapi.cn

//眼影
// https://app-api.youcamapi.cn/service/V2/getSkuByGuids?product=DiorCNWeChat&version=1.0&versiontype=WeChatMiniSDK&platform=ios&locale=zh_CN&country=zh_CN&lang=zh_CN&makeupVer=53&skuFormatVer=53&guids=BCC-14116_20210518_SD_02%2CBCC-14116_20200515_SD_01

// 获ID
// https://app-api.youcamapi.cn/service/V2/getIDSystemData?ids=pattern_eyelash_180716_Leo
// https://app-master.youcamapi.cn/pattern/2021/05/23/IDC/bc10d4e5-a63f-4f03-98d3-154c247c7060/eyelash/thumb/pattern_eyelash_180716_Leo.jpg

import { isPhone, isObjEmpty } from '@/libs/utils';
import Camera from '@/libs/camera';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'; //https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/face_mesh';
import GUI from 'lil-gui'; // https://lil-gui.georgealways.com/

export default {

    data() {
        return {
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
            gui: null,
            controls: {
                deviceId: localStorage.getItem(`deviceId`) || 'user', //设备id
                flipHorizontal: false, // 是否水平翻转
                isPause: false, //暂停
                verticalSynchronization:true,//垂直同步
                lips:true,//口
                lipsColor:'#ff0000',
                lipsOpacity:0.5,
                eyelash:true,//睫毛
            },
            canvas: null,
            ctx: null,
            eyelashList:[
                {
                    skuName:"惊艳纤羽睫毛膏",
                    thumbnail:`https://app-master.youcamapi.cn/pattern/2018/03/28/IDC/22e553e7-5914-4266-964d-236b46d57407/eyelash/thumb/pattern_eyelash_180221_Spring_06.jpg`,
                    upper:`https://app-master.youcamapi.cn/pattern/2018/03/28/IDC/e254ad2e-9425-4892-9936-d0f9b2e4d182/eyelash/eyelash_180221_Spring_06_a.png`,
                    lower:`https://app-master.youcamapi.cn/pattern/2018/03/28/IDC/7fdc138e-549b-494a-a838-3f97d74831cf/eyelash/eyelash_180221_Spring_06_b.png`,
                },
                {
                    skuName:"惊艳盈密睫毛膏",
                    thumbnail:`https://app-master.youcamapi.cn/pattern/2021/05/23/IDC/bc10d4e5-a63f-4f03-98d3-154c247c7060/eyelash/thumb/pattern_eyelash_180716_Leo.jpg`,
                    upper:`https://app-master.youcamapi.cn/pattern/2021/05/23/IDC/c26b2495-8720-46dd-ac9f-6b6f9660e52f/eyelash/eyelash_180716_Leo_a.png`,
                    lower:`https://app-master.youcamapi.cn/pattern/2021/05/23/IDC/5261a92b-2cfc-4395-bd6f-4fbe1bbf107e/eyelash/eyelash_180716_Leo_b.png`,
                },
            ]
        };
    },
    mounted() {
        if (isPhone()) {
            this.controls.flipHorizontal = true;
        }
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
        guiInit() {
            this.gui && this.gui.destroy();
            this.gui = new GUI();
            const cameraFolder = this.gui.addFolder(`摄像头`);
            cameraFolder.close();
            const deviceArr = this.deviceList.reduce((pre, next) =>{
                const {name,deviceId} = next;
                pre[name] = deviceId
                return pre
            },{});
            console.log(deviceArr);
            cameraFolder.add(this.controls, 'deviceId', deviceArr).name(`摄像头`).onChange((value) => {
                this.openCamera();
            });
            cameraFolder.add(this.controls, 'flipHorizontal').name(`镜像`).onChange((value) => {
                this.createModel();
            });
            cameraFolder.add(this.controls, 'isPause').name(`暂停`).onChange((value) => {
                const video = this.$refs.video;
                value ? video.pause() : video.play();
            });
            cameraFolder.add(this.controls, 'verticalSynchronization').name(`垂直同步`);

            const makeupFolder = this.gui.addFolder(`彩妆`);
            makeupFolder.open();

            makeupFolder.add(this.controls, 'lips').name(`口红`).onChange((value) => {
                lipsToggle(value,['lipsColor','lipsOpacity']);
            });
            makeupFolder.addColor(this.controls, 'lipsColor').name('颜色');
            makeupFolder.add(this.controls, 'lipsOpacity', 0.1, 1).name('透明度').step(0.1);
            lipsToggle(this.controls.lips,['lipsColor','lipsOpacity']);

            // makeupFolder.add(this.controls, 'eyelash').name(`眼睫毛`).onChange((value) => {

            // });



            function lipsToggle(value,arr){
               const object = makeupFolder.controllers
               for (const key in object) {
                if (Object.hasOwnProperty.call(object, key)) {
                    const element = object[key];
                    if(arr.includes(element.property)){
                        value?element.show():element.hide();
                    }
                }
               }
            }


        },
        async getMediaDevices() {
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
                        if (this.deviceList.filter(e => e.deviceId == this.controls.deviceId).length === 0) {
                            this.deviceList.unshift({
                                name: res.label || '[未知设备]',
                                deviceId: this.controls.deviceId
                            })
                        }
                        window.localStorage.setItem(`deviceId`, this.controls.deviceId);
                        this.guiInit();
                    };
                    await this.createModel();
                    window.cancelAnimationFrame(this.task);
                    this.task = window.requestAnimationFrame(this.recognition);
                })
                .catch(error => {
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
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                const toast = this.$toast.loading({
                    duration: 0, // 持续展示 toast
                    forbidClick: true,
                    message: '加载模型中',
                });
                await tf.setBackend('webgl')
                const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
                const detectorConfig = {
                    maxFaces: 1, //检测到的最大面部数量
                    refineLandmarks: true, //可以完善眼睛和嘴唇周围的地标坐标，并在虹膜周围输出其他地标
                    runtime: 'mediapipe',
                    solutionPath: 'https://unpkg.com/@mediapipe/face_mesh', //WASM二进制文件和模型文件所在的路径
                };
                this.model = await faceLandmarksDetection.createDetector(model, detectorConfig);
                toast.clear();
                this.modelLoad = false;
                resolve(this.model);
            })
        },
        //识别
        async recognition() {
            try {
                if (this.isCameraOpen && !this.modelLoad && !this.controls.isPause) {
                    const video = this.$refs.video;
                    const faces = await this.model.estimateFaces(video, {
                        flipHorizontal: this.controls.flipHorizontal, //镜像
                    });
                    this.drawResults(faces,video); //绘制
                };
                this.task = window.requestAnimationFrame(this.recognition);
            } catch (error) {
                console.log(error);
                this.task = window.requestAnimationFrame(this.recognition);
            }
        },
        drawResults(faces,video) {
            this.ctx.save();
            const {width,height} = this.canvas;
            const {verticalSynchronization,flipHorizontal} = this.controls;
            this.ctx.clearRect(0, 0,width, height);
            if(verticalSynchronization){
                this.ctx.drawImage(video,0,0,this.canvas.width,height);
                if (flipHorizontal) {
                    var imgData = this.ctx.getImageData(0, 0,width, height);
                    var newImgData = this.ctx.getImageData(0, 0,width, height);
                    this.ctx.clearRect(0, 0,width, height);
                    this.ctx.putImageData(this.imageDataHRevert(newImgData, imgData), 0, 0);//左右翻转
                };
            };
            faces.forEach(faceItem => {
                const keypoints = (faceItem.keypoints || []);
                this.setLipsColor(keypoints); //绘制嘴
                this.setEyelash(keypoints); //眼睫毛
            })
            this.ctx.restore();
        },
        //眼睫毛
        setEyelash(keypoints){
            const {eyelash} = this.controls;
            if(eyelash){
                const left_eyelash = [];
            }
        },
        //设置嘴的颜色
        setLipsColor(keypoints){
            const {lips,lipsColor,lipsOpacity} = this.controls;
            if(lips){
                const bottom_lips = [61, 146, 91, 181, 84, 17, 314, 405, 321,375,291,292,308,324,318,402,317,14,87,178,88,95,78,62,61];//下
                const top_lips = [61,185, 40, 39, 37, 0, 267, 269, 270, 409,291,292,308,415,310,311,312,13,82,81,80,191,78,62,61];//上
                const color = this.toRGBA(lipsColor,lipsOpacity)
                const bottom_points = bottom_lips.map(idx => keypoints[idx]);
                this.drawLine(bottom_points, 1, color, true);
                const top_points = top_lips.map(idx => keypoints[idx]);
                this.drawLine(top_points, 1, color, true);
            }
        },
        //画线
        drawLine(lineArr = [], lineWidth = 2, color = "lime",isFill=false) {
            this.ctx.beginPath();
            this.ctx.lineCap = "round";
            this.ctx.lineJoin = "round";
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = lineWidth;
            lineArr.forEach((e, index) => {
                if (index > 0) {
                    this.ctx.lineTo(e.x, e.y);
                } else {
                    this.ctx.moveTo(e.x, e.y);
                }
            });
            this.ctx.stroke();
            this.ctx.closePath();
            if(isFill){
                this.ctx.fillStyle = color;
                this.ctx.fill();
            }
        },
        //横向像素反转
        imageDataHRevert(sourceData, newData) {
            var h;
            for (var i = 0, h = sourceData.height; i < h; i++) {
                var j = 0;
                var w;
                for (j = 0, w = sourceData.width; j < w; j++) {
                    newData.data[i * w * 4 + j * 4 + 0] = sourceData.data[i * w * 4 + (w - j) * 4 + 0];
                    newData.data[i * w * 4 + j * 4 + 1] = sourceData.data[i * w * 4 + (w - j) * 4 + 1];
                    newData.data[i * w * 4 + j * 4 + 2] = sourceData.data[i * w * 4 + (w - j) * 4 + 2];
                    newData.data[i * w * 4 + j * 4 + 3] = sourceData.data[i * w * 4 + (w - j) * 4 + 3];
                }
            }
            return newData;
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
.tryMakeup {
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
        transform: translate(-50%, -50%) scale(1, 1);
    }
}
</style>

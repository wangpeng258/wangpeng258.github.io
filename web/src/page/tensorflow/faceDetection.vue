<template>
    <div class="faceDetection">
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
import * as faceDetection from '@tensorflow-models/face-detection'; // https://github.com/tensorflow/tfjs-models/tree/master/face-detection/src/tfjs
import '@mediapipe/face_detection';
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
            gui:null,
            controls:{
                deviceId: localStorage.getItem(`deviceId`) || 'user', //设备id
                flipHorizontal: false, // 是否水平翻转
                modelType:"short"
            },
            canvas: null,
            ctx: null,
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
        guiInit(){
            this.gui && this.gui.destroy();
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
            cameraFolder.add(this.controls, 'flipHorizontal').name(`镜像`);

            const modeFolder = this.gui.addFolder(`模型`);
            modeFolder.close();
            modeFolder.add(this.controls, 'modelType', ['short','full']).name(`模型分类`).onChange((value) => {
                this.createModel();
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
                const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
                const detectorConfig = {
                    runtime: 'mediapipe',
                    maxFaces:8,//最大面孔数
                    modelType:'short', //short full
                    solutionPath: 'https://unpkg.com/@mediapipe/face_detection', //WASM二进制文件和模型文件所在的路径
                };
                this.model = await faceDetection.createDetector(model, detectorConfig);
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
                    const faces = await this.model.estimateFaces(video, {
                        flipHorizontal: false, //镜像
                    });
                    this.drawResults(faces, video);
                };
                this.task = window.requestAnimationFrame(this.recognition);
            } catch (error) {
                console.log(error);
                this.task = window.requestAnimationFrame(this.recognition);
            }
        },
        //绘制
        drawResults(faces){
            const colors = ['red','purple','fuchsia','green','lime','olive','navy','blue'];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            faces.forEach((faceItem,index) => {
                const {xMin,yMin,width,height} = faceItem.box;
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = colors[index]||`red`;
                this.ctx.strokeRect(xMin,yMin, width, height);
                this.ctx.fillStyle = colors[index]||`red`;
                (faceItem.keypoints || []).forEach((element) => {
                    /* arc */
                    this.ctx.beginPath();
                    this.ctx.arc(element.x, element.y, 3, 0, 2 * Math.PI);
                    this.ctx.fill();
                    /* arc */
                });

                // faceItem.box
                // faceItem.keypoints
            });
        },
    },
};
</script>
<style lang="less" scoped>
.faceDetection {
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

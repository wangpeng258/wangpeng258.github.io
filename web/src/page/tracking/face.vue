<template>
    <div class="trackingFace">
        <div class="canvas-wrapper" ref="wrapper">
            <video ref="video" :id="videoId"
                :style="{ 'transform': controls.flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }" webkit-playsinline="true"
                playsinline="true" preload autoplay loop muted></video>
            <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"
                :style="{ 'transform': controls.flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"></canvas>
        </div>
    </div>
</template>

<script>
import { isObjEmpty } from '@/libs/utils';
import Camera from '@/libs/camera';
import GUI from 'lil-gui';
import '@/libs/tracking-min.js'
import '@/libs/face-min.js'
export default {

    data() {
        return {
            videoId:`video_${Math.random().toString(16).substring(2)}`,
            camera: null,
            width: document.documentElement.clientWidth || window.innerWidth,
            height: document.documentElement.clientHeight || window.innerHeight,
            canvasWidth: 0,
            canvasHeight: 0,
            deviceList: [], //设备列表
            isCameraOpen: false, //摄像头是否打开
            trackerTask:null,
            model: null, //模型
            modelLoad: true, //模型加载中
            gui:null,
            controls:{
                deviceId: localStorage.getItem(`deviceId`) || 'environment', //设备id
                flipHorizontal:false,
                edgesDensity:0.1,//边缘密度
                initialScale:1,//初始比例
                stepSize:1,//步长
                color:'#dc0c0c'
            },
            canvas: null,
            ctx: null,
        };
    },
    mounted() {
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.cameraInit();
        this.openCamera();
    },
    async beforeDestroy() {
        this.isCameraOpen = false;
        this.gui && this.gui.destroy();
        this.trackerTask && await this.trackerTask.stop()
        this.camera && await this.camera.stop();
        this.model && await this.model.removeAllListeners('track');
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
        guiInit(){
            this.gui && this.gui.destroy();
            this.controls = Object.assign(this.controls,{})
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
            modeFolder.add(this.controls, 'edgesDensity', 0.1, 0.5).name('边缘密度').step(0.1).onChange((value) => {
                this.model.setEdgesDensity(value);
            });
            modeFolder.add(this.controls, 'initialScale', 1.0, 10.0).name('初始比例').step(0.1).onChange((value) => {
                this.model.setInitialScale(value);
            });
            modeFolder.add(this.controls, 'stepSize', 0.1, 2).name('步长').step(0.1).onChange((value) => {
                this.model.setStepSize(value);
            });
            modeFolder.addColor(this.controls, 'color').name(`边框颜色`)
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
                    await this.getMediaDevices();
                    const video = this.$refs.video;
                    // const { videoWidth, videoHeight } = video;
                    const { clientWidth, clientHeight } = video;
                    this.canvasWidth = clientWidth;
                    this.canvasHeight = clientHeight;
                    video.width = clientWidth;
                    video.height = clientHeight;
                    this.$refs.wrapper.style.width = clientWidth+'px';
                    this.$refs.wrapper.style.height = clientHeight+'px';
                    this.isCameraOpen = true;
                    if (res.settings && res.settings.deviceId) {
                        this.controls.deviceId = res.settings.deviceId;
                        window.localStorage.setItem(`deviceId`, this.controls.deviceId);
                    };
                    this.createModel();
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
                this.model = await new tracking.ObjectTracker(['face']);

                const {edgesDensity,initialScale,stepSize} = this.controls;
                this.model.setInitialScale(initialScale);
                this.model.setStepSize(stepSize);
                this.model.setEdgesDensity(edgesDensity);

                this.trackerTask && await this.trackerTask.stop()
                this.trackerTask = tracking.track(`#${this.videoId}`, this.model);
                this.model && await this.model.removeAllListeners('track');
                this.model.on('track',(event)=>{
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    event.data.forEach((rect)=>{
                        this.ctx.strokeStyle = this.controls.color;
                        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                    });
                });
                toast.clear();
                this.modelLoad = false;
                resolve(this.model);
            })
        },
    },
};
</script>
<style lang="less" scoped>
.trackingFace {
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

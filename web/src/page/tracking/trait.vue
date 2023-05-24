<template>
    <div class="trackingTrait">
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
                threshold:4,
                size:1,
                color:'#dc0c0c',
                transparent:1,
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
            modeFolder.add(this.controls, 'threshold', 1, 50).name('阈值').step(1).onChange((value) => {
                tracking.Fast.THRESHOLD = value;
            });
            modeFolder.add(this.controls, 'size',1, 4).step(0.5).name(`大小`);
            modeFolder.addColor(this.controls, 'color').name(`颜色`);
            modeFolder.add(this.controls, 'transparent',0.1, 1).step(0.1).name(`透明度`);
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

                var FastTracker = function () {
                    FastTracker.base(this, 'constructor');
                };
                tracking.inherits(FastTracker, tracking.Tracker);
                const {threshold} = this.controls;
                tracking.Fast.THRESHOLD = threshold;

                FastTracker.prototype.threshold = tracking.Fast.THRESHOLD;
                FastTracker.prototype.track = function (pixels, width, height) {
                    var gray = tracking.Image.grayscale(pixels, width, height);
                    var corners = tracking.Fast.findCorners(gray, width, height);
                    this.emit('track', {
                        data: corners
                    });
                };
                this.trackerTask && await this.trackerTask.stop()
                this.model && await this.model.removeAllListeners('track');
                this.model = new FastTracker();
                tracking.track(`#${this.videoId}`, this.model);
                this.model.on('track',(event)=>{
                    const {transparent,color,size} = this.controls;
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    var corners = event.data;
                    for (var i = 0; i < corners.length; i += 2) {
                        this.ctx.beginPath();
                        this.ctx.fillStyle = this.toRGBA(color,transparent);
                        this.ctx.arc(corners[i], corners[i + 1], size, 0, 2 * Math.PI, false);
                        this.ctx.fill();
                    }
                });
                toast.clear();
                this.modelLoad = false;
                resolve(this.model);
            })
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
.trackingTrait {
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

<template>
    <div class="faceDetection">
        <div class="canvas-wrapper" ref="wrapper">
            <video ref="video"
                :style="{ 'transform': controls.flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"
                webkit-playsinline="true" playsinline="true" preload autoplay loop muted></video>
            <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        </div>
    </div>
</template>

<script>
import { isPhone, isObjEmpty } from '@/libs/utils';
import Camera from '@/libs/camera';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'; //https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/face_mesh';
import { Face } from "kalidokit";
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
        guiInit() {
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
            cameraFolder.add(this.controls, 'flipHorizontal').name(`镜像`).onChange((value) => {
                this.createModel();
            });
            cameraFolder.add(this.controls, 'isPause').name(`暂停`).onChange((value) => {
                const video = this.$refs.video;
                value ? video.pause() : video.play();
            });
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
                    this.solve(faces,video);
                };
                this.task = window.requestAnimationFrame(this.recognition);
            } catch (error) {
                console.log(error);
                this.task = window.requestAnimationFrame(this.recognition);
            }
        },
        //预测动作
        solve(faces, video) {
            // console.log('faces',faces);
            // https://github.com/yeemachine/kalidokit
            faces.forEach(faceItem => {
                /* const faceRig = Face.solve(faceItem.keypoints, {
                    runtime: "mediapipe",
                    video,
                    imageSize: { height: this.canvasHeight, width: this.canvasWidth },
                    smoothBlink: false, // 平滑左右眼眨眼延迟
                    blinkSettings: [0.25, 0.75], // 调整上下边界眨眼灵敏度
                });
                console.log(faceRig.eye); */
            })
        },
        //绘制轮廓
        drawResults(faces) {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            faces.forEach(faceItem => {
                const keypoints = (faceItem.keypoints || []);
                const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
                //面网络
                const AdjacentPairs = faceLandmarksDetection.util.getAdjacentPairs(model);
                const facial = Object.keys(AdjacentPairs);
                for (let i = 0; i < facial.length; i++) {
                    const item = facial[i];
                    const points = AdjacentPairs[item].map(idx => keypoints[idx]);
                    this.drawLine(points, 1, '#C0C0C070');
                };
                //关键点强化
                let keypointIndexByContour = faceLandmarksDetection.util.getKeypointIndexByContour(model);
                const cruxFacial = Object.keys(keypointIndexByContour);
                const cruxFacialColor = {
                    faceOval: '#E0E0E0',
                    leftEye: '#30FF30',
                    leftEyebrow: '#30FF30',
                    leftIris: '#30FF30',
                    lips: '#E0E0E0',
                    rightEye: '#FF3030',
                    rightEyebrow: '#FF3030',
                    rightIris: '#FF3030',
                };
                for (let i = 0; i < cruxFacial.length; i++) {
                    const item = cruxFacial[i];
                    //嘴部不加强
                    if(item != "lips"){
                        const points = keypointIndexByContour[item].map(idx => keypoints[idx]);
                        this.drawLine(points, 1, cruxFacialColor[item]);
                    }
                };

            });
            this.ctx.restore();
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
        }
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
        transform: translate(-50%, -50%) scale(1, 1);
    }
}
</style>

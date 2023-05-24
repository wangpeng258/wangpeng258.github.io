<template>
    <div class="handPage">
        <van-notice-bar wrapable :scrollable="false" text="使用您的大拇指和食指捏住蓝色方块移动（首次加载有点慢，请耐心等待）"></van-notice-bar>
        <div class="Camera-view" ref="cameraview" :style="{width:width+'px',height:height+'px'}">
            <video ref="camera" autoplay webkit-playsinline="true" playsinline="true"></video>
            <div id="konvaContainer"></div>
        </div>
        <!-- 切换摄像头 -->
        <div v-if="!isEmpty(deviceList)" class="Camera-toggle" title="切换摄像头" @click="actionShow = true">
            <svg t="1658028836694" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                p-id="5841" width="200" height="200">
                <path
                    d="M868.355 291.969l-95.558-15.726-29.174-72.070c-16.743-41.3-56.578-67.992-101.478-67.992l-260.384 0c-44.855 0-84.709 26.682-101.565 68.042l-29.128 72.019-95.517 15.726c-53.023 8.687-91.504 53.659-91.504 106.941v385.782c0 59.772 49.065 108.406 109.372 108.406h677.035c60.322 0 109.403-48.623 109.403-108.396v-385.792c0-53.282-38.481-98.254-91.499-106.941zM897.356 784.703c0 25.308-21.036 45.897-46.904 45.897h-677.035c-25.848 0-46.874-20.599-46.874-45.908l0-385.782c0-22.512 16.449-41.553 39.132-45.267l112.856-18.584c10.752-1.77 19.805-9.012 23.894-19.113l35.68-88.214c7.192-17.649 24.327-29.052 43.654-29.052h260.384c19.327 0 36.427 11.373 43.558 28.961l35.755 88.315c4.079 10.091 13.132 17.334 23.884 19.103l112.882 18.584c0.010 0 0.020 0 0.020 0.010 22.664 3.702 39.112 22.745 39.112 45.257l0 385.793z"
                    p-id="5842" fill="#ffffff"></path>
                <path
                    d="M436.876 473.188c-17.257 0-31.249 13.987-31.249 31.249v30.486c0 17.262 13.992 31.249 31.249 31.249s31.249-13.987 31.249-31.249v-30.486c0-17.261-13.992-31.249-31.249-31.249z"
                    p-id="5843" fill="#ffffff"></path>
                <path
                    d="M587.024 473.188c-17.262 0-31.249 13.987-31.249 31.249v30.486c0 17.262 13.987 31.249 31.249 31.249s31.249-13.987 31.249-31.249v-30.486c0-17.261-13.987-31.249-31.249-31.249z"
                    p-id="5844" fill="#ffffff"></path>
                <path
                    d="M768.412 403.814c-12.207-12.207-31.981-12.207-44.188 0l-19.261 19.262c-39.232-69.398-114.001-114.87-195.852-114.87-98.691 0-187.276 66.007-215.417 160.518-4.923 16.54 4.496 33.945 21.036 38.868 16.57 4.923 33.945-4.496 38.868-21.026 20.309-68.215 84.257-115.862 155.513-115.862s135.209 47.647 155.523 115.862c0.162 0.541 0.418 1.025 0.605 1.551 0.261 0.734 0.529 1.455 0.847 2.171 0.521 1.178 1.126 2.287 1.775 3.371 0.309 0.516 0.577 1.044 0.919 1.544 1.101 1.619 2.316 3.135 3.678 4.499 0.011 0.011 0.017 0.025 0.030 0.036 0.071 0.071 0.156 0.115 0.226 0.185 1.284 1.258 2.68 2.377 4.151 3.39 0.533 0.368 1.083 0.68 1.632 1.012 1.070 0.645 2.165 1.226 3.304 1.74 0.627 0.281 1.249 0.557 1.891 0.796 1.224 0.457 2.478 0.811 3.757 1.114 0.525 0.123 1.035 0.289 1.564 0.384 1.824 0.333 3.676 0.544 5.561 0.544 1.77 0 3.56-0.208 5.352-0.523 0.558-0.096 1.102-0.238 1.655-0.365 0.643-0.148 1.283-0.234 1.925-0.425 0.45-0.134 0.837-0.371 1.277-0.525 1.057-0.365 2.081-0.793 3.102-1.274 0.917-0.432 1.804-0.889 2.662-1.401 0.837-0.5 1.64-1.048 2.438-1.634 0.927-0.679 1.807-1.391 2.645-2.161 0.338-0.31 0.723-0.531 1.050-0.858l51.736-51.736c12.205-12.197 12.205-31.993-0.002-44.188z"
                    p-id="5845" fill="#ffffff"></path>
                <path
                    d="M709.159 558.289c-16.519-4.923-33.935 4.496-38.858 21.036-20.303 68.215-84.257 115.852-155.513 115.852-71.262 0-135.215-47.647-155.518-115.852-0.135-0.455-0.376-0.845-0.53-1.29-0.363-1.053-0.79-2.076-1.27-3.093-0.432-0.919-0.89-1.805-1.403-2.665-0.498-0.834-1.044-1.633-1.626-2.428-0.685-0.936-1.404-1.824-2.182-2.669-0.306-0.334-0.525-0.715-0.848-1.039-0.328-0.33-0.717-0.553-1.057-0.864-0.847-0.775-1.724-1.489-2.647-2.163-0.781-0.573-1.566-1.112-2.384-1.604-0.879-0.526-1.78-0.989-2.706-1.425-0.919-0.434-1.835-0.84-2.783-1.179-0.939-0.337-1.891-0.602-2.862-0.848-0.976-0.247-1.943-0.468-2.934-0.619-0.992-0.152-1.985-0.231-2.994-0.288-1.029-0.056-2.046-0.080-3.076-0.036-0.953 0.041-1.898 0.142-2.856 0.273-1.129 0.153-2.237 0.363-3.346 0.639-0.454 0.114-0.909 0.125-1.362 0.26-0.444 0.132-0.825 0.366-1.258 0.517-1.073 0.37-2.116 0.804-3.152 1.296-0.898 0.425-1.768 0.873-2.609 1.374-0.852 0.508-1.669 1.064-2.479 1.661-0.918 0.674-1.79 1.379-2.622 2.143-0.34 0.311-0.729 0.535-1.057 0.864l-51.736 51.736c-12.207 12.197-12.207 31.992 0 44.188 6.098 6.103 14.099 9.156 22.094 9.156s15.996-3.051 22.094-9.156l19.26-19.26c39.234 69.4 114.004 114.869 195.853 114.869 98.701 0 187.281-66.007 215.408-160.528 4.92-16.54-4.499-33.935-21.039-38.858z"
                    p-id="5846" fill="#ffffff"></path>
            </svg>
        </div>
        <van-action-sheet v-model="actionShow" :actions="deviceList" description="请选择镜头" @select="actionSelect"
            cancel-text="取消" close-on-click-action>
        </van-action-sheet>
        <!-- 切换摄像头 -->

        <!-- 镜像 -->
        <div class="FlipHorizontal-toggle" :class="{FlipHorizontalIng:flipHorizontal}" title="左右镜像"
            @click="triggerToggleFlipHorizontal">
            <svg t="1663289810507" class="icon" viewBox="0 0 1117 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                p-id="3494" width="128" height="128">
                <path
                    d="M442.898361 116.049051l2.23404 0.74468L74.840328 1.368349A61.901515 61.901515 0 0 0 0 61.966675v883.283427a61.9946 61.9946 0 0 0 74.840328 60.598326l379.507486-118.124847a77.074368 77.074368 0 0 0 41.981329-68.510549V189.58619a77.539793 77.539793 0 0 0-53.430782-73.537139zM403.244157 792.218386L93.084986 874.412428V132.618179l310.159171 82.380212v577.12691zM1054.466716 0.065159a77.260538 77.260538 0 0 0-12.845728 1.30319L675.796995 115.490542l1.30319-0.18617a77.446708 77.446708 0 0 0-56.968012 74.467988v629.161417c0 29.88028 17.034552 55.850991 41.981329 68.696719l379.228231 118.217932a61.9946 61.9946 0 0 0 75.026498-60.691411V61.966675a61.529175 61.529175 0 0 0-61.901515-61.808431z"
                    fill="#ffffff" opacity=".801" p-id="3495">
                </path>
            </svg>
        </div>
        <!-- 镜像 -->

    </div>
</template>

<script>
import { isObjEmpty } from '@/libs/utils';
import Konva from 'konva';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-core';
import '@mediapipe/hands';
export default {

    data() {
        return {
            width: document.documentElement.clientWidth || window.innerWidth,
            height: document.documentElement.clientWidth || window.clientWidth,
            mediaStreamTrack: null, //音频或视频流
            deviceList: [], //设备列表
            deviceId: window.localStorage.getItem(`deviceId`) || '', //设备id
            isCameraOpen: false,//摄像头是否打开
            actionShow: false,//设备选择器
            flipHorizontal: false,//镜像
            detector: null,
            task: null,
            stage: null,
            layer: null,
        };
    },
    mounted() {
        //画布太大会卡
        if (this.width >= 500) {
            this.width = 500;
            this.height = 500;
        };
        //打开摄像头
        this.openMedia();
        //konva初始化
        this.konvaInit();
    },
    //计算属性
    computed: {

    },
    beforeDestroy() {
        this.isCameraOpen = false;
        this.layer && this.layer.destroy(); //销毁全部
        if (this.task) {
            window.cancelAnimationFrame(this.task);
            this.task = null;
        };
        if(this.mediaStreamTrack){
            this.mediaStreamTrack.getVideoTracks().forEach(track => {
                track.stop();
            })
        }
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
        konvaInit() {
            this.stage = new Konva.Stage({
                container: 'konvaContainer',
                width: this.width,
                height: this.height
            });
            this.layer = new Konva.Layer();
            // 移动物体
            const rect = new Konva.Rect({
                id: "moveRect",
                x: this.width / 2,
                y: this.height / 2,
                width: 50,
                height: 50,
                fill: 'blue',
                offset: {
                    x: 50 / 2,
                    y: 50 / 2
                }
            });
            this.layer.add(rect);
            this.stage.add(this.layer);
        },
        //打开摄像头
        async openMedia() {
            this.isCameraOpen = false;
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '打开摄像头',
            });
            let mediaOpts = {
                audio: false,
                video: {
                    width: this.width,
                    height: this.height,
                    frameRate: {
                        ideal: 100,
                        max: 150
                    } //最佳帧率
                }
            };
            if (isObjEmpty(this.deviceId)) {
                // mediaOpts.video.facingMode = "user"; //前置摄像头
                mediaOpts.video.facingMode = "environment"; //后置摄像头
            } else {
                mediaOpts.video.deviceId = this.deviceId;
            }
            try {
                console.log(mediaOpts);
                const stream = await navigator.mediaDevices.getUserMedia(mediaOpts);
                this.mediaStreamTrack = stream;
                //获取设备
                this.deviceList = await this.getDevice() || [];
                let video = this.$refs.camera;
                if ("srcObject" in video) {
                    video.srcObject = stream
                } else {
                    video.src = window.URL && window.URL.createObjectURL(stream) || stream
                };
                await video.play();
                console.log(`play`, video);
                toast.clear();
                this.isCameraOpen = true;
                //模型初始化
                this.handModelInit();
                // if (!isObjEmpty(this.qRCodeRecognitionTask)) {
                //     window.cancelAnimationFrame(this.qRCodeRecognitionTask);
                //     this.qRCodeRecognitionTask = null;
                // };
                // this.qRCodeRecognitionTask = window.requestAnimationFrame(this.startIdentify);
            } catch (error) {
                toast.clear();
                console.error(error);
                this.$dialog.alert({
                    title: '失败',
                    message: `打开摄像头失败：${error}`,
                    theme: 'round-button',
                }).then(() => {
                    this.$router.replace('/')
                });
            }
        },
        //获取设备信息
        getDevice() {
            return new Promise(async resolve => {
                try {
                    const devicesList = await navigator.mediaDevices.enumerateDevices();
                    const arr = [];
                    (devicesList || []).forEach(e => {
                        e.name = e.label || e.deviceId;
                        if (e.kind === "videoinput" && e.deviceId && !e.name.includes('麦克风')) {
                            e.color = e.deviceId == this.deviceId ? '#1989fa' : '#323233';
                            arr.push(e)
                        }
                    });
                    resolve(arr);
                } catch (error) {
                    console.log(error);
                    resolve([]);
                };
            })
        },
        actionSelect(value) {
            const { deviceId } = value;
            this.actionShow = false;
            this.deviceId = deviceId;
            window.localStorage.setItem(`deviceId`, deviceId);
            this.openMedia();
        },
        //镜像切换
        triggerToggleFlipHorizontal() {
            this.flipHorizontal = !this.flipHorizontal;
            var cameraview = this.$refs.cameraview;
            if (this.flipHorizontal) {
                cameraview.style.transform = 'translate(-50%, -50%) scale(-1, 1)';
            } else {
                cameraview.style.transform = 'translate(-50%, -50%) scale(1, 1)';
            };
        },

        //识别手模型初始化
        async handModelInit() {
            if (!this.detector) {
                const model = handPoseDetection.SupportedModels.MediaPipeHands;
                const detectorConfig = {
                    runtime: 'mediapipe', // or 'tfjs',
                    solutionPath: 'https://unpkg.com/@mediapipe/hands',
                    modelType: 'full'
                }
                const toast = this.$toast.loading({
                    duration: 0, // 持续展示 toast
                    forbidClick: true,
                    message: '加载模型中...',
                });
                this.detector = await handPoseDetection.createDetector(model, detectorConfig);
                toast.clear();
                this.$toast('开始识别');
            }

            if (this.task) {
                window.cancelAnimationFrame(this.task);
                this.task = null;
            };
            this.task = window.requestAnimationFrame(this.renderPrediction);
        },
        async renderPrediction() {
            if (this.detector && this.isCameraOpen) {
                try {
                    var video = this.$refs.camera;
                    this.stage && this.stage.find('.Keypoint').forEach(el => el.destroy());
                    const hands = await this.detector.estimateHands(video, { flipHorizontal: false });
                    if (hands.length > 0) {
                        this.drawResults(hands, video);
                    }
                } catch (error) {
                    console.log(error);
                }
            };
            this.task = window.requestAnimationFrame(this.renderPrediction);
        },
        drawResults(hands, video) {
            // this.layer && this.layer.destroy(); //销毁全部

            const group = new Konva.Group();
            hands.forEach(el => {
                const Line1 = []; // 0 1 2 3 4;
                const Line2 = []; // 0 5 6 7 8;
                const Line3 = []; // 9 10 11 12;
                const Line4 = []; // 13 14 15 16;
                const Line5 = []; // 0 17 18 19 20;
                const Line6 = []; // 5 9 13 17;

                let thumb_tip = []; //大拇指
                let index_finger_tip = []; //食指尖

                el.keypoints.forEach(element => {
                    if (element.name === "thumb_tip") {
                        thumb_tip = new Konva.Rect({
                            id: "thumb_tip",
                            name: "Keypoint",
                            x: element.x - 10,
                            y: element.y - 10,
                            width: 20,
                            height: 20,
                            fill: '#adff97',
                        });
                        group.add(thumb_tip);

                    }
                    if (element.name === "index_finger_tip") {
                        index_finger_tip = new Konva.Rect({
                            id: "index_finger_tip",
                            name: "Keypoint",
                            x: element.x - 10,
                            y: element.y - 10,
                            width: 20,
                            height: 20,
                            fill: '#adff97',
                        });
                        group.add(index_finger_tip);
                    };

                    const circle = new Konva.Circle({
                        name: "Keypoint",
                        x: element.x,
                        y: element.y,
                        radius: 3,
                        fill: 'red',
                        strokeWidth: 0
                    });
                    group.add(circle);
                    circle.zIndex(1);
                    if (
                        this.getKeypointsIndex(element.name) === 0 ||
                        this.getKeypointsIndex(element.name) === 1 ||
                        this.getKeypointsIndex(element.name) === 2 ||
                        this.getKeypointsIndex(element.name) === 3 ||
                        this.getKeypointsIndex(element.name) === 4
                    ) {
                        Line1.push(element.x)
                        Line1.push(element.y)
                    };
                    if (
                        this.getKeypointsIndex(element.name) === 0 ||
                        this.getKeypointsIndex(element.name) === 5 ||
                        this.getKeypointsIndex(element.name) === 6 ||
                        this.getKeypointsIndex(element.name) === 7 ||
                        this.getKeypointsIndex(element.name) === 8
                    ) {
                        Line2.push(element.x)
                        Line2.push(element.y)
                    };
                    if (
                        this.getKeypointsIndex(element.name) === 9 ||
                        this.getKeypointsIndex(element.name) === 10 ||
                        this.getKeypointsIndex(element.name) === 11 ||
                        this.getKeypointsIndex(element.name) === 12
                    ) {
                        Line3.push(element.x)
                        Line3.push(element.y)
                    };
                    if (
                        this.getKeypointsIndex(element.name) === 13 ||
                        this.getKeypointsIndex(element.name) === 14 ||
                        this.getKeypointsIndex(element.name) === 15 ||
                        this.getKeypointsIndex(element.name) === 16
                    ) {
                        Line4.push(element.x)
                        Line4.push(element.y)
                    };
                    if (
                        this.getKeypointsIndex(element.name) === 0 ||
                        this.getKeypointsIndex(element.name) === 17 ||
                        this.getKeypointsIndex(element.name) === 18 ||
                        this.getKeypointsIndex(element.name) === 19 ||
                        this.getKeypointsIndex(element.name) === 20
                    ) {
                        Line5.push(element.x)
                        Line5.push(element.y)
                    };
                    if (
                        this.getKeypointsIndex(element.name) === 5 ||
                        this.getKeypointsIndex(element.name) === 9 ||
                        this.getKeypointsIndex(element.name) === 13 ||
                        this.getKeypointsIndex(element.name) === 17
                    ) {
                        Line6.push(element.x)
                        Line6.push(element.y)
                    };
                });

                const L1 = new Konva.Line({
                    name: "Keypoint",
                    points: Line1,
                    stroke: 'green',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                const L2 = new Konva.Line({
                    name: "Keypoint",
                    points: Line2,
                    stroke: 'green',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                const L3 = new Konva.Line({
                    name: "Keypoint",
                    points: Line3,
                    stroke: 'green',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                const L4 = new Konva.Line({
                    name: "Keypoint",
                    points: Line4,
                    stroke: 'green',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                const L5 = new Konva.Line({
                    name: "Keypoint",
                    points: Line5,
                    stroke: 'green',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                const L6 = new Konva.Line({
                    name: "Keypoint",
                    points: Line6,
                    stroke: 'green',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
                group.add(L1, L2, L3, L4, L5, L6);
                L1.zIndex(1);
                L2.zIndex(1);
                L3.zIndex(1);
                L4.zIndex(1);
                L5.zIndex(1);
                L6.zIndex(1);
            });
            // group.cache();
            this.layer.add(group);
            this.stage.add(this.layer);
            this.layer.batchDraw();
            this.collisionDetect();
        },
        //碰撞检测 并移动
        collisionDetect() {
            const is = (r1, r2) => {
                return !(
                    r2.x > r1.x + r1.width ||
                    r2.x + r2.width < r1.x ||
                    r2.y > r1.y + r1.height ||
                    r2.y + r2.height < r1.y
                );
            };
            var thumb_tip = this.stage.findOne('#thumb_tip');
            var index_finger_tip = this.stage.findOne('#index_finger_tip');

            var moveRect = this.stage.findOne('#moveRect');
            if (is(thumb_tip.getClientRect(), index_finger_tip.getClientRect())) {
                thumb_tip.fill('#36ff00');
                index_finger_tip.fill('#36ff00');
            } else {
                thumb_tip.fill('#adff97');
                index_finger_tip.fill('#adff97');
            }
            if (
                is(thumb_tip.getClientRect(), index_finger_tip.getClientRect()) &&
                is(moveRect.getClientRect(), thumb_tip.getClientRect()) &&
                is(moveRect.getClientRect(), index_finger_tip.getClientRect())
            ) {
                var x1 = moveRect.getClientRect().x;
                var y1 = moveRect.getClientRect().y;
                var x2 = thumb_tip.getClientRect().x;
                var y2 = thumb_tip.getClientRect().y;
                moveRect.fill('#409EFF');
                moveRect.move({
                    x: (x2 - x1) - 25,
                    y: (y2 - y1) - 25
                });
            } else {
                moveRect.fill('blue');
            }
        },
        getKeypointsIndex(name) {
            const arr = [
                'wrist',
                'thumb_cmc',
                'thumb_mcp',
                'thumb_ip',
                'thumb_tip',
                'index_finger_mcp',
                'index_finger_pip',
                'index_finger_dip',
                'index_finger_tip',
                'middle_finger_mcp',
                'middle_finger_pip',
                'middle_finger_dip',
                'middle_finger_tip',
                'ring_finger_mcp',
                'ring_finger_pip',
                'ring_finger_dip',
                'ring_finger_tip',
                'pinky_finger_mcp',
                'pinky_finger_pip',
                'pinky_finger_dip',
                'pinky_finger_tip'
            ];
            return arr.findIndex(e => e === name)
        },
    },
};
</script>
<!-- lang="less" scoped -->
<style lang="less" scoped>
.handPage {
    .Camera-view {
        position: absolute;
        display: block;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        #konvaContainer,
        video {
            position: absolute;
            display: block;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
        }
    }


    .FlipHorizontal-toggle,
    .Camera-toggle {
        position: fixed;
        bottom: 5vh;
        width: 15vw;
        height: 15vw;
        max-width: 50px;
        max-height: 50px;
        background-color: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20vw;
        -webkit-tap-highlight-color: transparent;
        z-index: 10;
        opacity: 0.8;
    }

    .FlipHorizontal-toggle {
        right: 10vw;
    }

    .Camera-toggle {
        left: 10vw;
    }

    .FlipHorizontal-toggle>svg,
    .Camera-toggle>svg {
        width: 7vw;
        max-width: 30px;
        transition: 0.5s;
        transform: scaleX(1);
    }

    .FlipHorizontalIng>svg {
        transform: scaleX(-1);
    }
}
</style>



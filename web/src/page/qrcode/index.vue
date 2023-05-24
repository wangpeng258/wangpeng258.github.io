

<template>
    <div class="qrcodePage">
        <video ref="camera" :width="width" :height="height" autoplay webkit-playsinline="true"
            playsinline="true"></video>
        <transition name="van-fade">
            <div v-if="isCameraOpen" ref="overlay" class="Camera-overlay"
                :class="{'CameraAnimation':qRCodeIdentification}">
                <svg ref="scanning" t="1658221233420" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="7631" width="200" height="200">
                    <path
                        d="m863.57333,989.86667l-126.29333,0c-13.65333,0 -25.6,-11.94667 -25.6,-25.6s11.94667,-25.6 25.6,-25.6l126.29333,0c40.96,0 75.09334,-34.13334 75.09334,-75.09334l0,-126.29333c0,-13.65333 11.94666,-25.6 25.6,-25.6s25.6,11.94667 25.6,25.6l0,126.29333c0,69.97334 -56.32,126.29334 -126.29334,126.29334zm-578.56,0l-124.58666,0c-69.97334,0 -126.29334,-56.32 -126.29334,-126.29334l0,-126.29333c0,-13.65333 11.94667,-25.6 25.6,-25.6s25.6,11.94667 25.6,25.6l0,126.29333c0,40.96 34.13334,75.09334 75.09334,75.09334l126.29333,0c13.65333,0 25.6,11.94666 25.6,25.6s-11.94667,25.6 -27.30667,25.6zm679.25334,-679.25334c-13.65334,0 -25.6,-11.94666 -25.6,-25.6l0,-124.58666c0,-40.96 -34.13334,-75.09334 -75.09334,-75.09334l-126.29333,0c-13.65333,0 -25.6,-11.94666 -25.6,-25.6s11.94667,-25.6 25.6,-25.6l126.29333,0c69.97334,0 126.29334,56.32 126.29334,126.29334l0,126.29333c0,13.65333 -11.94667,23.89333 -25.6,23.89333zm-904.53334,0c-13.65333,0 -25.6,-11.94666 -25.6,-25.6l0,-124.58666c0,-69.97334 56.32,-126.29334 126.29334,-126.29334l126.29333,0c13.65333,0 25.6,11.94667 25.6,25.6s-11.94667,25.6 -27.30667,25.6l-124.58666,0c-40.96,0 -75.09334,34.13334 -75.09334,75.09334l0,126.29333c0,13.65333 -11.94666,23.89333 -25.6,23.89333z"
                        fill="#ffffff" p-id="7632" id="svg_1" />
                </svg>
            </div>
        </transition>
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

        <!-- 结果 -->
        <van-dialog class="resultShow" v-model="resultShow" title="识别结果" theme="round-button" confirm-button-text="重新扫描"
            @confirm="startIdentify">
            <van-image @click="ImagePreview(result.url)" :src="result.url"></van-image>
            <div class="textarea">
                <textarea readonly>{{result.data}}</textarea>
            </div>
        </van-dialog>
        <!-- 结果 -->
    </div>
</template>

<script>
import {isObjEmpty} from '@/libs/utils';
import jsQR from "jsqr";

export default {
    data() {
        return {
            width: document.documentElement.clientWidth || window.innerWidth,
            height: document.documentElement.clientHeight || window.innerHeight,
            mediaStreamTrack: null, //音频或视频流
            deviceList: [], //设备列表
            deviceId: window.localStorage.getItem(`deviceId`) || '', //设备id
            isCameraOpen: false,//摄像头是否打开
            actionShow: false,//设备选择器
            qRCodeIdentification: false, //二维码识别中
            qRCodeRecognitionTask: null,//二维码识别任务
            result: {},
            resultShow: false,//结果弹窗
        };
    },
    mounted() {
        //打开摄像头
        this.openMedia();
    },
    //计算属性
    computed: {

    },
    beforeDestroy() {
        if (!isObjEmpty(this.qRCodeRecognitionTask)) {
            window.cancelAnimationFrame(this.qRCodeRecognitionTask);
            this.qRCodeRecognitionTask = null;
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

                if (!isObjEmpty(this.qRCodeRecognitionTask)) {
                    window.cancelAnimationFrame(this.qRCodeRecognitionTask);
                    this.qRCodeRecognitionTask = null;
                };
                this.$nextTick(_ => {
                    this.qRCodeRecognitionTask = window.requestAnimationFrame(this.startIdentify);
                    let svg = this.$refs.scanning;
                    let width = this.width;
                    let height = this.height;
                    let minLength = width > height ? height : width;
                    svg.style.width = `${minLength * 0.75}px`;
                    svg.style.height = `${minLength * 0.75}px`;
                })
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
        startIdentify() {
            if (this.isCameraOpen) {
                try {

                    if (!isObjEmpty(this.result.url)) {
                        //清除内存
                        window.URL && window.URL.revokeObjectURL(this.result.url);
                    };
                    this.resultShow = false;
                    this.qRCodeIdentification = true;
                    // ------裁剪图片--------
                    const video = this.$refs.camera;
                    const vw = video.videoWidth;
                    const vh = video.videoHeight;
                    const minsize = Math.min(vw, vh);
                    const canvas = document.createElement("canvas");
                    const width = minsize;
                    const height = minsize;
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (vw > vh) {
                        ctx.drawImage(video, (vw - minsize) / 2, 0, width, height, 0, 0, width, height);
                    } else {
                        ctx.drawImage(video, 0, (vh - minsize) / 2, width, height, 0, 0, width, height);
                    }
                    // ------裁剪图片--------


                    const imageData = ctx.getImageData(0, 0, width, height);
                    const code = jsQR(imageData.data, width, height, {
                        inversionAttempts: "dontInvert", //不要反转
                    });
                    if (!isObjEmpty(code) && !isObjEmpty(code.data)) {
                        this.qRCodeIdentification = false;
                        //绘制二维码区域
                        function drawLine(begin, end, lineWidth = 2) {
                            ctx.beginPath();
                            ctx.moveTo(begin.x, begin.y);
                            ctx.lineTo(end.x, end.y);
                            ctx.lineCap = "round";
                            ctx.lineJoin = "round";
                            ctx.lineWidth = lineWidth;
                            ctx.strokeStyle = "red";
                            ctx.stroke();
                        };
                        const lineWidth = 2;
                        drawLine(code.location.topLeftCorner, code.location.topRightCorner, lineWidth);
                        drawLine(code.location.topRightCorner, code.location.bottomRightCorner, lineWidth);
                        drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, lineWidth);
                        drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, lineWidth);
                        const Base64 = canvas.toDataURL("image/png");
                        const Blob = this.convertBase64UrlToBlob(Base64);
                        const url = window.URL && window.URL.createObjectURL(Blob);
                        this.result = {
                            url,
                            data: code.data
                        };
                        this.resultShow = true;
                    } else {
                        this.qRCodeRecognitionTask = window.requestAnimationFrame(this.startIdentify);
                    }
                } catch (error) {
                    console.error(error);
                    this.qRCodeRecognitionTask = window.requestAnimationFrame(this.startIdentify);
                }
            }else{
                this.qRCodeRecognitionTask = window.requestAnimationFrame(this.startIdentify);
            }

        },
        //识别
        actionSelect(value) {
            const { deviceId } = value;
            this.actionShow = false;
            this.deviceId = deviceId;
            window.localStorage.setItem(`deviceId`, deviceId);
            this.openMedia();
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
        ImagePreview(url) {
            this.$imagePreview({
                images: [url],
                closeable: true,
            });
        },
    },
};
</script>
<style lang="less" scoped>
.qrcodePage {


    video {
        display: block;
        width: 100vw;
        height: 100vh;
        background: #000;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        object-fit: cover;
    }

    .Camera-toggle {
        position: fixed;
        left: 50%;
        bottom: 5vh;
        width: 15vw;
        height: 15vw;
        max-width: 90px;
        max-height: 90px;
        transform: translateX(-50%);
        background-color: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20vw;
        -webkit-tap-highlight-color: transparent;
        z-index: 10;
        opacity: 0.8;
    }

    .Camera-toggle>svg {
        width: 7vw;
        max-width: 30px;
    }

    .Camera-overlay {
        transition: all .3s ease-in-out;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: transparent;
        z-index: 5;
        pointer-events: none;
        overflow: hidden;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .Camera-overlay>svg {
        width: 5vw;
        height: 5vw;
        animation: animate_line 3s ease-in-out infinite;
        opacity: 0.8;
        filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.4));
    }

    @-webkit-keyframes animate_line {

        0%,
        100% {
            transform: scale(1);
        }

        100% {
            transform: scale(0.8);
        }
    }

    @keyframes animate_line {

        0%,
        100% {
            transform: scale(1);
        }

        50% {
            transform: scale(0.8);
        }
    }

    .resultShow .van-image {
        display: block;
        width: 50%;
        margin: 20px auto 10px auto;
    }

    .resultShow .textarea {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px 15px;
    }

    .resultShow .textarea>textarea {
        width: 100%;
        max-height: 120px;
        border: 1px solid #989898;
        padding: 9px;
        resize: none;
        font-size: 13px;
        color: #313131;
    }
}
</style>

<template>
    <div class="pictureInPicture">
        <!-- controls -->
        <van-row class="video-row">
            <van-col span="8">
                <div class="video-row-item">
                    <video ref="meVideo" :src="me" @play="isMePlay = true" @pause="isMePlay = false" :width="width"
                        :height="height" :style="{ 'transform': flipHorizontal ? 'scale(-1, 1)' : 'scale(1, 1)' }"
                        webkit-playsinline="true" crossorigin="anonymous" playsinline="true" autoplay preload loop muted
                        controls></video>
                    <span>video1</span>
                </div>
            </van-col>
            <van-col span="8">
                <div class="video-row-item">
                    <video ref="sheVideo" :src="she" @play="isShePlay = true" @pause="isShePlay = false"
                        :width="width / 3" :height="(width / 3) / (width / height)" webkit-playsinline="true"
                        crossorigin="anonymous" playsinline="true" autoplay preload loop muted controls></video>
                    <span>video2</span>
                </div>
            </van-col>
            <van-col span="8">
                <div class="video-row-item">
                    <video ref="groupVideo" @play="isGroupPlay = true" @pause="isGroupPlay = false" :width="width"
                        :height="height" webkit-playsinline="true" crossorigin="anonymous" playsinline="true" autoplay
                        preload loop muted controls></video>
                    <span>video1+video2</span>
                </div>
            </van-col>
        </van-row>
        <div class="button-row">
            <van-button v-if="isMePlay && isShePlay" @click="pauseAll" native-type="button" type="danger" size="small"
                round>暂停</van-button>
            <van-button v-else @click="playAll" native-type="button" type="info" size="small" round>播放</van-button>
        </div>
        <van-cell-group inset>
            <van-field label="画中画">
                <template #input>
                    <van-switch :value="isPictureInPicture" :loading="pictureInPictureLoading"
                        @click="goPictureInPicture" size="20" />
                </template>
            </van-field>
            <van-field label="镜像">
                <template #input>
                    <van-switch v-model="flipHorizontal" size="20" />
                </template>
            </van-field>
            <van-field label="打开摄像头">
                <template #input>
                    <van-switch :value="isCameraOpen" @click="openCamera" size="20" />
                </template>
            </van-field>
            <van-field label="摄像头" v-if="isCameraOpen" center is-link>
                <template #input>
                    <select class="van-field__control" v-model="deviceId" @change="actionSelect">
                        <option v-for="(item, index) in deviceList" :key="index" :value="item.deviceId"
                            v-text="item.name"></option>
                    </select>
                </template>
            </van-field>
        </van-cell-group>
        <div class="canvasView">
            <canvas ref="canvas" :width="width" :height="height"></canvas>
            <span>canvas</span>
        </div>
    </div>
</template>

<script>
import { isWeiXinClient, isAndroidMobileDevice, isObjEmpty } from '@/libs/utils';
import Camera from '@/libs/camera';
export default {
    data() {
        return {
            width: 540,
            height: 960,
            isMePlay: false,
            isShePlay: false,
            isGroupPlay: false,
            // me: `https://dcdn.it120.cc/2022/11/15/8387c4a1-dc8a-4a7f-bdde-001e87a2b950.mp4`,
            // she: `https://dcdn.it120.cc/2022/11/15/8387c4a1-dc8a-4a7f-bdde-001e87a2b950.mp4`,
            me: `https://dcdn.it120.cc/2022/11/07/2cfeb9cd-84ff-4981-8ac1-ffa421c82ff1.mp4`,
            she: `https://dcdn.it120.cc/2022/11/07/23a4e8ae-5a2f-4801-a557-cb5214d0d648.mp4`,
            camera: null,
            deviceId: localStorage.getItem(`deviceId`) || '', //设备id
            deviceList: [], //设备列表
            isCameraOpen: false, //摄像头是否打开
            task: null, //任务
            taskFps: null, //任务
            throttleFPS:{},
            Fps:0,
            canvas: null,
            ctx: null,
            pictureInPictureLoading: false,
            isPictureInPicture: false,
            flipHorizontal: false,
        };
    },
    mounted() {
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.fps();
        if (isWeiXinClient() || isAndroidMobileDevice()) {
            this.$dialog.alert({
                title: '自动播放失败',
                message: `请手动播放视频`,
                theme: 'round-button'
            })
                .then(async () => {
                    this.$refs.meVideo.play();
                    this.$refs.sheVideo.play();
                    this.groupVideoInit();
                })
        } else {
            this.playAll();
        };
    },
    watch: {
        isMePlay() { this.isPlay() },
        isShePlay() { this.isPlay() },
        isGroupPlay() { this.isPlay() },
    },
    beforeDestroy() {
        this.pauseAll();
        this.camera && this.camera.stop();
        this.task && window.cancelAnimationFrame(this.task);
        this.taskFps && window.cancelAnimationFrame(this.taskFps);
        this.$refs.groupVideo.removeEventListener('enterpictureinpicture', this.isPictureInPictureFun);
        this.$refs.groupVideo.removeEventListener('leavepictureinpicture', this.isPictureInPictureFun);
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
        fps() {
            let be = (performance || Date).now(),
                fps = 0;
            const loop = () => {
                let now = (performance || Date).now();
                fps = Math.round(1000 / (now - be));
                be = now;
                this.Fps = fps;
                this.taskFps = window.requestAnimationFrame(loop)
            };
            this.taskFps && window.cancelAnimationFrame(this.taskFps);
            this.taskFps = window.requestAnimationFrame(loop);
        },
        async openCamera() {
            const video = this.$refs.meVideo;
            video.srcObject = null;
            video.src = '';
            video.load();
            if (this.camera) {
                await this.camera && this.camera.stop();
                this.isCameraOpen = false;
                video.src = this.me;
                video.play();
                return false
            }
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '打开摄像头',
            });


            this.camera = new Camera(video, {
                audio: false,
                video: {
                    // width: this.width,
                    // height: this.height,
                }
            });
            try {
                let deviceList = await this.camera.getMediaDevices();
                this.deviceList = deviceList.map(e => {
                    e.name = e.label || e.deviceId;
                    e.color = e.deviceId == this.deviceId ? '#1989fa' : '#323233';
                    return e
                });
            } catch (error) {
                this.$dialog.alert({
                    title: '失败',
                    message: `获取设备失败：${error.errMsg}`,
                    theme: 'round-button',
                }).then(() => {
                    this.$router.replace('/')
                });
            }
            this.isCameraOpen = false;
            try {
                await this.camera.open(this.deviceId);
                this.isCameraOpen = true;
            } catch (error) {
                this.$dialog.alert({
                    title: '失败',
                    message: `打开摄像头失败：${error.errMsg}`,
                    theme: 'round-button',
                }).then(() => {
                    this.$router.replace('/')
                });
            } finally {
                toast.clear();
            }
        },
        async actionSelect() {
            const video = this.$refs.meVideo;
            video.srcObject = null;
            video.src = '';
            video.load();
            window.localStorage.setItem(`deviceId`, this.deviceId);
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '打开摄像头',
            });
            try {
                await this.camera.open(this.deviceId);
            } catch (error) {
                this.$dialog.alert({
                    title: '失败',
                    message: `打开摄像头失败：${error.errMsg}`,
                    theme: 'round-button',
                }).then(() => {
                    this.$router.replace('/')
                });
            } finally {
                toast.clear();
            }
        },
        async goPictureInPicture() {
            const video = this.$refs.groupVideo;
            this.pictureInPictureLoading = true;
            try {
                if (video !== document.pictureInPictureElement) {
                    await video.requestPictureInPicture();
                } else {
                    await document.exitPictureInPicture();
                }
            } catch (error) {
                this.$dialog.alert({
                    title: '进入画中画失败',
                    message: `${error}`,
                    theme: 'round-button'
                })
            } finally {
                this.pictureInPictureLoading = false;
            }
        },
        isPlay() {
            const [isMePlay, isShePlay] = [this.isMePlay, this.isShePlay];
            if (isMePlay && isShePlay) {
                this.groupVideoInit();
            }
        },
        async pauseAll() {
            this.$refs.meVideo && await this.$refs.meVideo.pause();
            this.$refs.sheVideo && await this.$refs.sheVideo.pause();
            this.$refs.groupVideo && await this.$refs.groupVideo.pause();
        },
        async playAll() {
            await this.$refs.meVideo.play();
            await this.$refs.sheVideo.play();
        },
        groupVideoInit() {
            const video = this.$refs.groupVideo;
            const stream = this.canvas.captureStream(); // 25 FPS
            video.srcObject = stream;
            video.play();
            video.removeEventListener('enterpictureinpicture', this.isPictureInPictureFun);
            video.removeEventListener('leavepictureinpicture', this.isPictureInPictureFun);
            video.addEventListener('enterpictureinpicture', this.isPictureInPictureFun);
            video.addEventListener('leavepictureinpicture', this.isPictureInPictureFun);
            this.task && window.cancelAnimationFrame(this.task);
            this.task = window.requestAnimationFrame(this.toCanvas);
        },
        isPictureInPictureFun() {
            this.$refs.groupVideo.play();
            this.isPictureInPicture = (this.$refs.groupVideo === document.pictureInPictureElement)
        },
        async toCanvas() {
            if ((this.isMePlay && this.isShePlay && this.isGroupPlay) || this.isPictureInPicture) {
                try {
                    var meVideo = this.$refs.meVideo;
                    var sheVideo = this.$refs.sheVideo;
                    this.ctx.clearRect(0, 0, meVideo.width, meVideo.height);

                    if (this.isCameraOpen) {
                        const { sx, sy, swidth, sheight, x, y, width, height } = this.getObjectFitSize('cover', meVideo.width, meVideo.height, meVideo.videoWidth, meVideo.videoHeight)
                        this.ctx.drawImage(meVideo, sx, sy, swidth, sheight, x, y, width, height);
                    } else {
                        this.ctx.drawImage(meVideo, 0, 0, meVideo.width, meVideo.height);
                    };

                    if (this.flipHorizontal) {
                        var imgData = this.ctx.getImageData(0, 0, meVideo.width, meVideo.height);
                        var newImgData = this.ctx.getImageData(0, 0, meVideo.width, meVideo.height);
                        this.ctx.clearRect(0, 0, meVideo.width, meVideo.height);
                        this.ctx.putImageData(this.imageDataHRevert(newImgData, imgData), 0, 0);//左右翻转
                    };



                    this.ctx.drawImage(sheVideo, this.canvas.width - sheVideo.width, 0, sheVideo.width, sheVideo.height);
                    this.ctx.fillStyle = `#fff`;
                    this.ctx.textAlign = 'center';
                    this.ctx.font = 'bold 40px sans-serif';
                    this.isPictureInPicture && this.ctx.fillText(`画中画`, meVideo.width / 2, meVideo.height - 50);
                    this.ctx.textAlign = 'left';
                    this.ctx.font = '30px sans-serif';
                    this.ctx.fillText(new Date().toLocaleTimeString(), 20, 50);

                    if(this.isEmpty(this.throttleFPS)){
                        this.throttleFPS = {
                            t:Date.now(),
                            f:this.Fps
                        };
                        this.ctx.fillText(`FPS:${this.Fps}`, 20, 100);
                    };
                    //每个0.3秒绘制一次
                    if(Date.now() - this.throttleFPS.t>= (1000 * 0.3)){
                        this.ctx.fillText(`FPS:${this.Fps}`, 20, 100);
                        this.throttleFPS = {};
                    }else{
                        this.ctx.fillText(`FPS:${this.throttleFPS.f}`, 20, 100);
                    }

                    this.task = window.requestAnimationFrame(this.toCanvas);
                } catch (error) {
                    console.log(error);
                    this.task = window.requestAnimationFrame(this.toCanvas);
                }
            } else {
                this.task = window.requestAnimationFrame(this.toCanvas);
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
        /**
         * 计算图片裁剪或者摆放位置
         * @param {*} type  contain, cover 暂时只兼容这两个模式
         * @param {*} containerWidth  容器宽度
         * @param {*} containerHeight  容器高度
         * @param {*} imgWidth   图片宽度
         * @param {*} imgHeight  图片高度
         * @return {*} canvas drawImage的所有入参
         */
        getObjectFitSize(
            type = "cover",
            containerWidth,
            containerHeight,
            imgWidth,
            imgHeight
        ) {
            let radio = 1, // 容器与图片的比例
                sx = 0, // 开始剪切的 x 坐标位置。
                sy = 0, // 开始剪切的 y 坐标位置。
                swidth = imgWidth, // 被剪切图像的宽度。
                sheight = imgHeight, // 被剪切图像的高度。
                x = 0, // 在画布上放置图像的 x 坐标位置。
                y = 0, // 在画布上放置图像的 y 坐标位置。
                width = containerWidth, // 要使用的图像的宽度（伸展或缩小图像）。
                height = containerHeight; // 要使用的图像的高度（伸展或缩小图像）。
            let cWHRatio = containerWidth / containerHeight;
            let iWHRatio = imgWidth / imgHeight;
            if (type === "cover") {
                // cover模式，需要裁剪
                if (iWHRatio >= cWHRatio) {
                    // 横图，高先匹配，裁剪宽度
                    radio = containerHeight / imgHeight;
                    sx = (imgWidth - containerWidth / radio) / 2;
                    swidth = containerWidth / radio;
                    sheight = imgHeight;
                } else {
                    // 竖图，宽先匹配，裁剪高度
                    radio = containerWidth / imgWidth;
                    sy = (imgHeight - containerHeight / radio) / 2;
                    swidth = imgWidth;
                    sheight = containerHeight / radio;
                }
            } else if (type === "contain") {
                if (iWHRatio >= cWHRatio) {
                    // 横图，宽先匹配，高度自适应
                    radio = containerWidth / imgWidth;
                    y = (containerHeight - imgHeight * radio) / 2;
                    height = imgHeight * radio;
                } else {
                    // 竖图，高先匹配，宽度自适应
                    radio = containerHeight / imgHeight;
                    x = (containerWidth - imgWidth * radio) / 2;
                    width = imgWidth * radio;
                }
            }
            return {
                sx,
                sy,
                swidth,
                sheight,
                x,
                y,
                width,
                height,
            };
        },
        //延迟
        delay(m = 1) {
            return new Promise(res => {
                setTimeout(() => {
                    res(true);
                }, m * 1000);
            })
        },
    },
};
</script>
<style lang="less" scoped>
.pictureInPicture {
    max-width: 800px;
    margin: 0 auto;

    .video-row {
        margin: 0;

        .video-row-item {
            padding: 10px;
            text-align: center;

            video {
                display: block;
                width: 100%;
                height: auto;
                background-color: black;
            }

            span {
                display: block;
                padding: 10px;
                font-size: 12px;
            }
        }
    }

    .canvasView {
        width: 200px;
        margin: 15px auto;
        text-align: center;

        canvas {
            display: block;
            width: 100%;
            height: auto;
        }

        span {
            display: block;
            padding: 10px;
            font-size: 12px;
        }
    }

    .button-row {
        text-align: center;
        padding: 15px;

        button {
            min-width: 120px;
            margin: 0 10px;
        }
    }
}
</style>

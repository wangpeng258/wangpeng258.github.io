<template>
    <div class="recording">
        <div style="padding:15px">
            <div class="videoArea">
                <video ref="video" @play="VideoPlay" @pause="VideoPause" webkit-playsinline="true" playsinline="true"
                    preload autoplay loop muted></video>
                <transition name="van-fade">
                    <div v-if="inProgress" class="videoTape"></div>
                </transition>
            </div>
            <div style="text-align: center;padding: 15px;">
                <van-button v-if="!inProgress" @click="Start" native-type="button" type="info" round>开始录制</van-button>
                <van-button v-else @click="Stop" native-type="button" type="danger" round>停止录制</van-button>
            </div>
        </div>
    </div>
</template>

<script>
import {isObjEmpty} from '@/libs/utils';
export default {
    data() {
        return {
            inProgress: false, //是否正在录制
            mediaDevices: null, //MediaDevices对象
            mediaRecorder: null, //录制器
            mediaStreamTrack: null, //音频或视频流
            blob: null, //录制的视频
        };
    },
    mounted() {

    },
    beforeDestroy(){
        this.Stop();
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
        Start() {
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '选择录制窗口',
            });
            const mediaOpts = {
                audio: true,
                video: {
                    width: 1920,
                    height: 1080,
                    frameRate: { ideal: 100, max: 150 } //最佳帧率
                }
            }
            if (!this.isEmpty(typeof navigator.mediaDevices)) {
                try {
                    navigator.mediaDevices.getDisplayMedia(mediaOpts).then(stream => {
                        this.mediaStreamTrack = stream;
                        const video = this.$refs.video;
                        if ("srcObject" in video) {
                            video.srcObject = stream
                        } else {
                            video.src = window.URL && window.URL.createObjectURL(stream) || stream
                        };
                        video.play();
                        video.addEventListener('pause', () => {
                            console.log("暂停播放");
                            this.Stop();
                        });
                    }).catch(err => {
                        let message = err.message || err;
                        console.log(err);
                        if (message == 'Permission denied') {
                            this.$toast(`${message}[取消选择录制窗口]`);
                        } else {
                            this.$toast(message);
                        }
                    })
                } catch (error) {
                    console.log(error);
                    this.$toast(`${error}[catch]`);
                }
            } else {
                this.$toast('该浏览器不支持屏幕录制');
            }
        },
        VideoPlay() {
            this.$toast.clear();
            this.MediaRecorderInit();
        },
        VideoPause() {
            this.$toast.clear();
            this.Stop();
        },
        MediaRecorderInit() {
            this.inProgress = false;
            this.blob = null;
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '准备录制',
            });
            this.mediaRecorder = new MediaRecorder(this.mediaStreamTrack, {
                audioBitsPerSecond: 1280000, //音频码率
                videoBitsPerSecond: 1000000 * 20, //视频码率 (数值越大视频越清晰)
                mimeType: 'video/webm;codecs=h264' //视频编码格式
            });

            this.mediaRecorder.start();
            // this.mediaRecorder.resume();

            this.mediaRecorder.ondataavailable = e => {
                this.blob = new Blob([e.data], {
                    'type': e.currentTarget.mimeType
                });
            }
            this.mediaRecorder.onerror = e => {
                this.inProgress = false;
                console.error(e)
                this.$toast.fail('录制失败');
                toast.clear();
            }
            this.mediaRecorder.onstart = e => {
                this.inProgress = true;
                console.log('开始', e);
                this.$toast('开始录制');
                toast.clear();
            }
            this.mediaRecorder.onresume = e => {
                this.inProgress = true;
                console.log('恢复', e);
                this.$toast('恢复录制');
                toast.clear();
            }
            this.mediaRecorder.onstop = e => {
                this.inProgress = false;
                console.log('结束', e);
                this.$toast('录制结束');
                toast.clear();
                console.log(this.blob.size);
                const url = window.URL && window.URL.createObjectURL(this.blob);
                this.$dialog.alert({
                    title: '录制完成',
                    message: `
                                   <video src="${url}" style="display: block;width: 100%;" webkit-playsinline="true" playsinline="true" controls autoplay></video>
                                   <div class="van-cell van-cell--center">
                                        <div class="van-cell__title" style="text-align: left;">
                                           <span>文件大小</span>
                                        </div>
                                        <div class="van-cell__value">
                                            <span>${(this.blob.size / 1024).toFixed(2)}kb</span>
                                        </div>
                                    </div>
                                `,
                    theme: 'round',
                    confirmButtonText: '完成',
                    className: 'viewDialog',
                })
                    .then(() => {
                        // on confirm
                    })
                    .catch(() => {
                        // on cancel
                    });
            }
        },
        Stop() {
            this.inProgress = false;
            this.mediaStreamTrack && this.mediaStreamTrack.getVideoTracks().forEach(track => {
                track.stop();
            })
            this.mediaRecorder && this.mediaRecorder.stop();
        }
    },
};
</script>
<!-- lang="less" scoped -->
<style lang="less" scoped>
.recording {
    max-width: 800px;
    margin: 0 auto;

    .videoArea {
        position: relative;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        margin: 60px 0 0 0;
    }

    video {
        display: block;
        width: 100%;
        background-color: #000;
    }

    .videoTape {
        position: absolute;
        top: 10px;
        right: 10px;
        display: block;
        width: 15px;
        height: 15px;
        background-color: red;
        border-radius: 100px;
        opacity: 0.8;
    }


}
</style>
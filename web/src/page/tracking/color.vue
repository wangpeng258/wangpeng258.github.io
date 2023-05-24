<template>
    <div class="trackingColor">
        <div class="canvas-wrapper" ref="wrapper">
            <video ref="video" :id="videoId"
                :style="{ 'transform': controls.flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"
                webkit-playsinline="true" playsinline="true" preload autoplay loop muted></video>
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
export default {

    data() {
        return {
            videoId: `video_${Math.random().toString(16).substring(2)}`,
            camera: null,
            width: document.documentElement.clientWidth || window.innerWidth,
            height: document.documentElement.clientHeight || window.innerHeight,
            canvasWidth: 0,
            canvasHeight: 0,
            deviceList: [], //设备列表
            isCameraOpen: false, //摄像头是否打开
            trackerTask: null,
            model: null, //模型
            modelLoad: true, //模型加载中
            gui: null,
            Colors:{},
            controls: {
                deviceId: localStorage.getItem(`deviceId`) || 'user', //设备id
                flipHorizontal: false,
                custom: false,
                customColor: "#000000",
                minDimension: 20,
                maxDimension: 200,
                minGroupSize: 30,
                rectOpacity:0.1,
            },
            canvas: null,
            ctx: null,
            customColorElement: null,
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
        updateColors(){
            var colors = [];
            for (var key in this.Colors) {
                if (Object.hasOwnProperty.call(this.Colors, key)) {
                    if (this.controls[key]) {
                        colors.push(key);
                    }
                }
            }
            console.log(colors);
            this.model && this.model.setColors(colors);
        },
        guiInit() {
            this.gui && this.gui.destroy();
            let Colors = {
                custom:this.controls.custom
            };
            Object.keys(tracking.ColorTracker.knownColors_).forEach((color) => {
                Colors[color] = true;
            });
            this.Colors = Colors;

            this.controls = Object.assign(this.controls, Colors)
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
            modeFolder.open();
            // modeFolder.close();
            Object.keys(Colors).forEach((color) => {
                if(color != 'custom'){
                   const item =  modeFolder.add(this.controls, color).name(color).onFinishChange(this.updateColors);
                   item.$name.style.color = item.property;
                }
            });
            modeFolder.add(this.controls, 'custom').name(`自定义颜色`).onFinishChange((value) => {
                if (value) {
                    this.customColorElement.show();
                } else {
                    this.customColorElement.hide();
                }
                this.updateColors();
            });
            this.customColorElement = modeFolder.addColor(this.controls, 'customColor').name(`颜色`).onChange((value) => {
                var components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
                var customColorR = parseInt(components[1], 16);
                var customColorG = parseInt(components[2], 16);
                var customColorB = parseInt(components[3], 16);
                var colorTotal = customColorR + customColorG + customColorB;
                if (colorTotal === 0) {
                    tracking.ColorTracker.registerColor('custom', function (r, g, b) {
                        return r + g + b < 10;
                    });
                } else {
                    var rRatio = customColorR / colorTotal;
                    var gRatio = customColorG / colorTotal;
                    tracking.ColorTracker.registerColor('custom', function (r, g, b) {
                        var colorTotal2 = r + g + b;
                        if (colorTotal2 === 0) {
                            if (colorTotal < 10) {
                                return true;
                            }
                            return false;
                        }
                        var rRatio2 = r / colorTotal2,
                            gRatio2 = g / colorTotal2,
                            deltaColorTotal = colorTotal / colorTotal2,
                            deltaR = rRatio / rRatio2,
                            deltaG = gRatio / gRatio2;
                        return deltaColorTotal > 0.9 && deltaColorTotal < 1.1 &&
                            deltaR > 0.9 && deltaR < 1.1 &&
                            deltaG > 0.9 && deltaG < 1.1;
                    });
                }
            });
            if (!this.controls.custom) {
                this.customColorElement.hide();
            }
            modeFolder.add(this.controls, 'minDimension', 0.1, 200).name('最小尺寸').step(0.1).onChange((value) => {
                this.model.setMinDimension(value);
            });
            modeFolder.add(this.controls, 'maxDimension', 1, 1500).name('最大尺寸').step(1).onChange((value) => {
                this.model.setMaxDimension(value);
            });
            modeFolder.add(this.controls, 'minGroupSize', 1, 1000).name('最小组大小').step(1).onChange((value) => {
                this.model.setMinGroupSize(value);
            });
            modeFolder.add(this.controls, `rectOpacity`,0.1, 1).name(`填充透明度`).step(0.1);

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
                this.model = await new tracking.ColorTracker();
                this.updateColors();
                this.model.customColor = this.controls.customColor;
                const {minDimension,maxDimension,minGroupSize} = this.controls;
                this.model.setMinDimension(minDimension);
                this.model.setMaxDimension(maxDimension);
                this.model.setMinGroupSize(minGroupSize);

                this.trackerTask && await this.trackerTask.stop()
                this.trackerTask = tracking.track(`#${this.videoId}`, this.model);
                this.model && await this.model.removeAllListeners('track');
                // once 一次
                this.model.on('track', (event) => {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    event.data.forEach((rect) => {
                        if (rect.color === 'custom') {
                            rect.color = this.controls.customColor;
                        };
                        this.ctx.strokeStyle = rect.color;
                        this.ctx.fillStyle= this.toRGBA(rect.color,this.controls.rectOpacity||0.1); //填充
                        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                        this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                        const fontSize = (rect.width/13)>20?20:(rect.width/13)<8?8:(rect.width/13);
                        this.ctx.font = `${fontSize}px bold Helvetica`;
                        this.ctx.fillStyle = this.colorReverse(rect.color);
                        const text = `${rect.color}`;
                        const textWidth = this.ctx.measureText(text).width;
                        this.ctx.fillText(text,rect.x+(rect.width/2)-(textWidth/2),rect.y+(rect.height/2)+(fontSize/2));
                    });
                });
                toast.clear();
                this.modelLoad = false;
                resolve(this.model);
            })
        },
        //颜色反转
        colorReverse(oldColor){
            if(oldColor=="yellow"){
               oldColor="#ffff00"
            }else if(oldColor=="magenta"){
                oldColor="#8b008b"
            }else if(oldColor=="cyan"){
                oldColor="#00ffff"
            }
            oldColor = '0x' + oldColor.replace(/#/g, '');
            let str = '000000' + (0xFFFFFF - oldColor).toString(16);
            return '#'+ str.substring(str.length - 6, str.length);
        },
        toRGBA(str,opacity){
            if(str=="yellow"){
               str="#ffff00"
            }else if(str=="magenta"){
                str="#8b008b"
            }else if(str=="cyan"){
                str="#00ffff"
            }
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
.trackingColor {
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

<template>
    <div class="keepPage">
        <div class="canvas-wrapper" ref="canvasWrapper">
            <video ref="video" @loadedmetadata="videoLoadedmetadata" @play="isPlay = true" @pause="isPlay = false" crossorigin="anonymous" webkit-playsinline="true" playsinline="true" preload autoplay loop muted></video>
            <canvas ref="canvas" :class="{'skeletonOpen':isSkeletonOpen}" :width="width" :height="height"></canvas>
            <transition name="van-fade">
                <div v-if="videoLoading" class="modelLoad" style="background-color: transparent;">
                    <van-loading color="#1989fa" vertical>视频加载中</van-loading>
                </div>
            </transition>
            <div class="quantity">
                <span>{{quantityArr.length}}</span>
            </div>
        </div>
        <br />
        <van-cell-group class="statsViewGroup" inset>
            <div class="statsView" ref="statsView"></div>
        </van-cell-group>
        <div class="button-row">
            <van-button v-if="isPlay" @click="$refs.video.pause()" native-type="button" type="danger" size="small" round>暂停</van-button>
            <van-button v-else @click="$refs.video.play()" native-type="button" type="info" size="small" round>播放</van-button>
        </div>
        <van-cell-group inset>
            <van-field label="运动项目" center is-link>
                <template #input>
                    <select class="van-field__control" v-model="activeViedo" @change="viedoChange()">
                        <option v-for="(item, index) in viedoList" :value="index" v-text="item.name"></option>
                    </select>
                </template>
            </van-field>
            <van-field label="播放速度" center>
                <template #input>
                    <van-stepper v-model="playbackRate" min="0.2" max="2" step="0.2"/>
                </template>
            </van-field>
            <van-field label="骨骼">
                <template #input>
                    <van-switch v-model="isSkeletonOpen" size="20" />
                </template>
            </van-field>
            <van-field label="模型" center is-link>
                <template #input>
                    <select class="van-field__control" v-model="modelParams.modelType">
                        <option value="lite">lite</option>
                        <option value="full">full</option>
                        <option value="heavy">heavy</option>
                    </select>
                </template>
            </van-field>
        </van-cell-group>
    </div>
</template>

<script>
import { isPhone, isObjEmpty } from '@/libs/utils';
import Stats from 'stats.js'; //http://mrdoob.github.io/stats.js/
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@mediapipe/pose';
export default {

    data() {
        return {
            camera: null,
            width: 0,
            height: 0,
            stats:null,
            statsFRE:null,
            statsTime:null,
            deviceId: localStorage.getItem(`deviceId`) || '', //设备id
            deviceList: [], //设备列表
            isCameraOpen: false, //摄像头是否打开
            task: null, //任务
            model: null, //模型
            modelLoad: true, //模型加载中
            playbackRate:1,//播放速度
            isSkeletonOpen:false,//骨骼
            modelParams: {
                modelType: 'lite'
            },
            canvas: null,
            ctx: null,
            isPlay: false,
            videoLoading: true,
            activeViedo:0,
            viedoList: [
                {
                    name: '俯卧撑',
                    type:"pushUp",
                    url: 'https://dcdn.it120.cc/2022/11/11/74c1becc-1c67-4373-94a4-9bcfcbe2a52f.mp4'
                },
                {
                    name: '开合跳+扩胸展臂',
                    type:"jumpingJacks",
                    url: 'https://dcdn.it120.cc/2022/11/13/40a8d0b3-86ed-4286-9d49-f8fddf0df28d.mp4'
                },
                {
                    name: '高抬腿',
                    type:"highLegLift",
                    url: 'https://dcdn.it120.cc/2022/11/13/4902dcd6-45fa-484d-99d3-fc7e91b99f6f.mp4'
                },
                {
                    name: '深蹲+对角卷腹',
                    type:"deepSquat",
                    url: 'https://dcdn.it120.cc/2022/11/13/156ec628-3020-4009-a42c-2f0b0623f26f.mp4'
                },
                {
                    name: '髋部中立位',
                    type:"hipUp",
                    url: 'https://dcdn.it120.cc/2022/11/13/e203bff5-139b-4a91-97ef-3619e96e1ab9.mp4'
                },
                {
                    name: '5s深蹲保持+踮脚站立',
                    type:"squatHold",
                    url: 'https://dcdn.it120.cc/2022/11/13/7c3c7534-98a1-4640-a123-e18578a0d827.mp4'
                },
                {
                    name: '登山者',
                    type:"climber",
                    url: 'https://dcdn.it120.cc/2022/11/13/494bc8ba-0e63-4f8e-86fc-a8d099eaf34a.mp4'
                },
            ],
            quantityArr:[],
        };
    },
    async mounted() {
        // console.log('LandmarkGrid',LandmarkGrid);
        this.statsInit();
        this.$notify({ type: 'primary', message: '首次模型加载模型可能需要1-2分钟，请耐心等待', duration: 2000, });
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.viedoChange();
    },
    watch: {
        quantityArr: {
            deep: true,
            async handler(arr) {
                const firstTime = arr.at(0);
                const twoTime = arr.at(1);
                if(firstTime && twoTime){
                    this.$toast({
                        className:"toast_fixed_top_left",
                        message: `耗时${(firstTime - twoTime)/1000}s`,
                        position: 'top',
                        duration:2000,
                        getContainer:'.keepPage'
                    });
                }
            }
        },
        modelParams: {
            deep: true,
            async handler() {
                !this.modelLoad && await this.createModel();
            }
        },
        isPlay(is) {
            this.task && window.cancelAnimationFrame(this.task);
            if (is) {
                this.task = window.requestAnimationFrame(this.recognition);
            }
        },
        playbackRate(num) {
            this.$refs.video.playbackRate = num;
        },
    },
    async beforeDestroy() {
        this.$refs.video&&this.$refs.video.pause();
        this.task && window.cancelAnimationFrame(this.task);
        this.camera && await this.camera.stop();
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
        statsInit(){
            var stats = new Stats();
            this.statsFRE = stats.addPanel(new Stats.Panel( 'FRE', '#ff8', '#221'));
            stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
            stats.domElement.style = ``;
            this.stats = stats;
            this.$refs.statsView.innerHTML = '';
            this.$refs.statsView.appendChild(stats.dom)
        },
        videoLoadedmetadata() {
            const video = this.$refs.video;
            const { clientWidth, clientHeight } = video;
            this.width = clientWidth;
            this.height = clientHeight;
            video.width = clientWidth;
            video.height = clientHeight;
            video.play();
            console.log([video]);
        },
        async viedoChange() {
            const index = this.activeViedo;
            this.videoLoading = true;
            const video = this.$refs.video;
            const { url } = this.viedoList[index];
            video.src = url;
            this.videoLoading = false;
            this.statsInit();
            await this.createModel();
            console.log(url);
        },
        //创建模型
        createModel() {
            return new Promise(async resolve => {
                const toast = this.$toast.loading({
                    duration: 0, // 持续展示 toast
                    forbidClick: true,
                    message: '加载模型中',
                });
                this.quantityArr = [];
                this.$refs.video&&this.$refs.video.pause();
                this.playbackRate= 1;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.modelLoad = true;
                const model = poseDetection.SupportedModels.BlazePose;
                const detectorConfig = {
                    runtime: 'mediapipe',
                    enableSmoothing: true, //默认为真。如果您的输入是静态图像，请将其设置为 false。该标志用于指示是否使用时间滤波器来平滑预测的关键点。
                    enableSegmentation: true, //一个布尔值，指示是否生成分段掩码。
                    smoothSegmentation: true,//是否过滤不同输入图像的分割掩码以减少抖动
                    solutionPath: 'https://unpkg.com/@mediapipe/pose',
                    modelType: this.modelParams.modelType,
                };
                this.model = await poseDetection.createDetector(model, detectorConfig);
                this.modelLoad = false;
                this.$refs.video&&this.$refs.video.play();
                toast.clear();
                resolve(this.model);
            })
        },
        //识别
        async recognition() {
            try {
                // https://github.com/tensorflow/tfjs-models/tree/master/pose-detection
                // https://google.github.io/mediapipe/solutions/pose.html
                // https://camo.githubusercontent.com/3f8aeb2f26bfa2a67ad4ae3c58b2b31dbe43946406ca156a2e34983f7568ce16/68747470733a2f2f73746f726167652e676f6f676c65617069732e636f6d2f6d65646961706970652f626c617a65706f73652d6b6579706f696e74732d757064617465642e706e67
                if (!this.modelLoad && this.isPlay) {
                    const video = this.$refs.video;
                    this.stats.begin();
                    //压缩视频尺寸
                    const imageData = await this.compressionImage(video);
                    const poses = await this.model.estimatePoses(imageData, {
                        flipHorizontal: false
                    });
                    this.drawResults(poses,video);
                    this.stats.end();
                };
                // this.$refs.video.pause();
                this.task = window.requestAnimationFrame(this.recognition);
            } catch (error) {
                console.log(error);
                this.task = window.requestAnimationFrame(this.recognition);
            }
        },
        //绘制
        drawResults(poses,video) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            poses.forEach(posesItem => {
                // console.log('posesItem',posesItem);
                const posesLookupIndices = {
                    left_eye:[0,4,5,6,8],//左眼
                    right_eye:[0,1,2,3,7],//右眼
                    mouth:[10,9],//嘴
                    waist: [24, 23],//腰
                    bear: [12, 11],//肩
                    left_hand: [12, 14, 16, 20, 18, 16, 22],//左手
                    left_body: [12, 24, 26, 28, 30, 32, 28],//左身体
                    right_hand: [11, 13, 15, 19, 17, 15, 21],//右手
                    right_body: [11, 23, 25, 27, 29, 31, 27],//右身体
                };
                const posesLookupColor = {
                    left_eye: '#03c2e2',//左眼
                    right_eye: '#fa8a14',//右眼
                    mouth: 'red',//嘴
                    waist: '#ffffff',//腰
                    bear: '#ffffff',//肩
                    left_hand: '#03c2e2',//左手
                    left_body: '#03c2e2',//左身体
                    right_hand: '#fa8a14',//右手
                    right_body: '#fa8a14',//右身体

                };
                let lineWidth = this.isSkeletonOpen?2:4;
                for (const key in posesLookupIndices) {
                    if (Object.hasOwnProperty.call(posesLookupIndices, key)) {
                        const points = posesLookupIndices[key].map(idx => posesItem.keypoints[idx]);
                        this.drawLine(points, lineWidth, posesLookupColor[key]);
                        points.forEach(el => {
                            this.ctx.beginPath();
                            this.ctx.arc(el.x, el.y, lineWidth, 0, 2 * Math.PI);
                            this.ctx.fillStyle = posesLookupColor[key];
                            this.ctx.fill();
                            this.ctx.stroke();
                            this.ctx.closePath();
                        })
                    }
                };
                const { type } = this.viedoList[this.activeViedo];
                if(type==="pushUp"){
                    this.pushUp(posesItem);//俯卧撑
                }else if(type==="jumpingJacks"){
                    this.jumpingJacks(posesItem);//开合跳
                }else if(type==="highLegLift"){
                    this.highLegLift(posesItem);//高抬腿
                }else if(type==="deepSquat"){
                    this.deepSquat(posesItem);//深蹲+对角卷腹
                }else if(type==="hipUp"){
                    this.hipUp(posesItem);//髋部中立位
                }else if(type==="squatHold"){
                    this.squatHold(posesItem);//5s深蹲保持+踮脚站立
                }else if(type==="climber"){
                    this.climber(posesItem);//登山者
                }

            });
        },
        //登山者
        climber(posesItem){
            const place1 = (posesItem.keypoints || []).find((e,i)=>i===14); //左手
            const place2 = (posesItem.keypoints || []).find((e,i)=>i===13); //右手

            const place3 = (posesItem.keypoints || []).find((e,i)=>i===26); //左脚
            const place4 = (posesItem.keypoints || []).find((e,i)=>i===25); //右脚

            const handDistance = this.getDistance(place1.x,place1.y,place3.x,place3.y);
            const footDistance = this.getDistance(place2.x,place2.y,place4.x,place4.y);

            // console.log(handDistance,footDistance);
            this.statsFRE.update(handDistance,200);
            if(handDistance<55 && footDistance<65){
                window['climber_L'] = {handDistance,footDistance};
                if(!isObjEmpty(window['climber_R'])){
                    this.quantityArr.unshift(new Date().getTime());
                    window['climber_R'] = {};
                }

            }
            if(handDistance>70 && footDistance>40){
                window['climber_R'] = {handDistance,footDistance};
                if(!isObjEmpty(window['climber_L'])){
                    this.quantityArr.unshift(new Date().getTime());
                    window['climber_L'] = {};
                }
            }
        },
        //5s深蹲保持+踮脚站立
        squatHold(posesItem){
            const place1 = (posesItem.keypoints || []).find((e,i)=>i===18); //左手
            const place2 = (posesItem.keypoints || []).find((e,i)=>i===17); //右手

            const place3 = (posesItem.keypoints || []).find((e,i)=>i===32); //左脚
            const place4 = (posesItem.keypoints || []).find((e,i)=>i===31); //右脚

            const place5 = (posesItem.keypoints || []).find((e,i)=>i===24); //左髋
            const place6 = (posesItem.keypoints || []).find((e,i)=>i===23); //右髋

            const handDistance = this.getDistance(place1.x,place1.y,place2.x,place2.y);
            const strideDistance = this.getDistance(place5.x,place5.y,place3.x,place3.y)+this.getDistance(place6.x,place6.y,place4.x,place4.y);

            // console.log(handDistance,strideDistance);
            this.statsFRE.update(handDistance,200);
            if(handDistance>85 && strideDistance>195){
                window['squatHold_open'] = {handDistance,strideDistance};
                if(!isObjEmpty(window['squatHold_open']) && !isObjEmpty(window['squatHold_close'])){
                    this.quantityArr.unshift(new Date().getTime())
                    window['squatHold_open'] = {};
                    window['squatHold_close'] = {};
                }
            }
            if(handDistance<6 && strideDistance<115){
                window['squatHold_open'] = {};
                window['squatHold_close'] = {handDistance,strideDistance};
            }

        },
        //髋部中立位
        hipUp(posesItem){
            const place1 = (posesItem.keypoints || []).find((e,i)=>i===32); //左脚
            const place2 = (posesItem.keypoints || []).find((e,i)=>i===31); //右脚
            const footDistance = this.getDistance(place1.x,place1.y,place2.x,place2.y);

            // console.log(footDistance);
            this.statsFRE.update(footDistance,200);
            if(footDistance>110){
                window['deepSquat_open'] = {footDistance};
                if(!isObjEmpty(window['deepSquat_open']) && !isObjEmpty(window['deepSquat_close'])){
                    this.quantityArr.unshift(new Date().getTime())
                    window['deepSquat_open'] = {};
                    window['deepSquat_close'] = {};
                }
            }
            if(footDistance<25){
                window['deepSquat_open'] = {};
                window['deepSquat_close'] = {footDistance};
            }
        },
        //深蹲+对角卷腹
        deepSquat(posesItem){
            const place1 = (posesItem.keypoints || []).find((e,i)=>i===14); //左手关节
            const place2 = (posesItem.keypoints || []).find((e,i)=>i===13); //右手关节

            const place3 = (posesItem.keypoints || []).find((e,i)=>i===26); //左腿关节
            const place4 = (posesItem.keypoints || []).find((e,i)=>i===25); //右腿关节

            const jointDistance1 = this.getDistance(place1.x,place1.y,place4.x,place4.y); //左手关节到右腿关节的距离
            const jointDistance2 = this.getDistance(place2.x,place2.y,place3.x,place3.y); //右手关节到左腿关节的距离

            // console.log(jointDistance1,jointDistance2);
            this.statsFRE.update(jointDistance1,200);
            if(jointDistance1>81 && jointDistance2<20){
                window['deepSquat_L'] = {jointDistance1,jointDistance2};
                if(!isObjEmpty(window['deepSquat_R'])){
                    this.quantityArr.unshift(new Date().getTime());
                    window['deepSquat_R'] = {};
                }

            }
            if(jointDistance1<20 && jointDistance2>85){
                window['deepSquat_R'] = {jointDistance1,jointDistance2};
                if(!isObjEmpty(window['deepSquat_L'])){
                    this.quantityArr.unshift(new Date().getTime());
                    window['deepSquat_L'] = {};
                }
            }
        },
        //高抬腿
        highLegLift(posesItem){
            const place1 = (posesItem.keypoints || []).find((e,i)=>i===18); //左手
            const place2 = (posesItem.keypoints || []).find((e,i)=>i===17); //右手

            const place3 = (posesItem.keypoints || []).find((e,i)=>i===32); //左脚
            const place4 = (posesItem.keypoints || []).find((e,i)=>i===31); //右脚

            const handDistance = this.getDistance(place1.x,place1.y,place3.x,place3.y);
            const footDistance = this.getDistance(place2.x,place2.y,place4.x,place4.y);

            // console.log(handDistance,footDistance);
            this.statsFRE.update(handDistance,200);
            if(handDistance<55 && footDistance>155){
                window['highLegLift_L'] = {handDistance,footDistance};
                if(!isObjEmpty(window['highLegLift_R'])){
                    this.quantityArr.unshift(new Date().getTime());
                    window['highLegLift_R'] = {};
                }

            }
            if(handDistance>155 && footDistance<70){
                window['highLegLift_R'] = {handDistance,footDistance};
                if(!isObjEmpty(window['highLegLift_L'])){
                    this.quantityArr.unshift(new Date().getTime());
                    window['highLegLift_L'] = {};
                }
            }

        },
        //开合跳
        jumpingJacks(posesItem){
            const place1 = (posesItem.keypoints || []).find((e,i)=>i===18); //左手
            const place2 = (posesItem.keypoints || []).find((e,i)=>i===17); //右手

            const place3 = (posesItem.keypoints || []).find((e,i)=>i===32); //左脚
            const place4 = (posesItem.keypoints || []).find((e,i)=>i===31); //右脚

            const handDistance = this.getDistance(place1.x,place1.y,place2.x,place2.y);
            const footDistance = this.getDistance(place3.x,place3.y,place4.x,place4.y);

            // console.log(handDistance,footDistance);
            this.statsFRE.update(handDistance,200);
            if(handDistance>90 && footDistance>45){
                window['jumpingJacks_open'] = {handDistance,footDistance};
                if(!isObjEmpty(window['jumpingJacks_open']) && !isObjEmpty(window['jumpingJacks_close'])){
                        this.quantityArr.unshift(new Date().getTime());
                        window['jumpingJacks_open'] = {};
                        window['jumpingJacks_close'] = {};
                    }
            }
            if(handDistance<20 && footDistance<20){
                window['jumpingJacks_close'] = {handDistance,footDistance};
                window['jumpingJacks_open'] = {};
            }
        },
        //俯卧撑
        pushUp(posesItem){
            const place1 = (posesItem.keypoints || []).find((e,i)=>i===12); //左肩
            const place2 = (posesItem.keypoints || []).find((e,i)=>i===32); //左脚
            /*
                                  x1,y1(左肩)
                                    |
                                    |
                                    |
                      x2,y2  -------|------- x4,y4
                                  x3,y3(左脚)
            */
            const [x1, y1, x2, y2, x3, y3, x4, y4] = [
                place1.x, place1.y,
                0, place2.y,
                place2.x, place2.y,
                this.canvas.width, place2.y
            ];
            // this.ctx.beginPath();
            // this.ctx.lineCap = 'round';
            // this.ctx.strokeStyle = 'red';
            // this.ctx.lineWidth = 4;
            // this.ctx.moveTo(x1,y1);
            // this.ctx.lineTo(x3,y3);
            // this.ctx.stroke();

            // this.ctx.beginPath();
            // this.ctx.lineCap = 'round';
            // this.ctx.strokeStyle = 'blue';
            // this.ctx.lineWidth = 4;
            // this.ctx.moveTo(x2,y2);
            // this.ctx.lineTo(x4,y4);
            // this.ctx.stroke();

            const angle = this.getAngle({
                x: x1 - x3,
                y: y1 - y3,
            }, {
                x: x4 - x3,
                y: y4 - y3,
            });
            // console.log('angle',angle);
            // 左脚 => 左肩
            if(angle>150 && angle<180){
                const newAngle = 180 - angle;
                // console.log('newAngle',newAngle);
                const [min,max] = [13,28];
                const pro = this.GetPercent(newAngle-min,max-min);
                this.statsFRE.update(pro<=0?1:pro>100?100:pro,100);

                if(newAngle>=20 && newAngle<=max){
                    window['pushUp_up'] = {
                        a:newAngle
                    };
                    if(!isObjEmpty(window['pushUp_up']) && !isObjEmpty(window['pushUp_down'])){
                        this.quantityArr.unshift(new Date().getTime())
                        window['pushUp_up'] = {};
                        window['pushUp_down'] = {};
                    }
                }
                if(newAngle>=min && newAngle<=14){
                    window['pushUp_up'] = {};
                    window['pushUp_down'] = {
                        a:newAngle
                    };
                }
            }else{
                window['pushUp_up'] = {};
                window['pushUp_down'] = {};
            }
        },
        //画线
        drawLine(lineArr = [], lineWidth = 2, color = "lime") {
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
                };
            });
            this.ctx.stroke();
            this.ctx.closePath();
        },
        //获取夹角
        getAngle({ x: x1, y: y1 }, { x: x2, y: y2 }) {
            const dot = x1 * x2 + y1 * y2
            const det = x1 * y2 - y1 * x2
            const angle = Math.atan2(det, dot) / Math.PI * 180
            return Math.round(angle + 360) % 360
        },
        //距离
        getDistance(x1, y1, x2, y2) {
            return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
        },
        /**
         * @ 占比计算
         * @ num 当前数
         * @ total 总数
         */
        GetPercent(num, total) {
            num = parseFloat(num);
            total = parseFloat(total);
            if (isNaN(num) || isNaN(total)) {
                return "-";
            }
            return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
        },
        //压缩
        compressionImage(el) {
            return new Promise(async resolve => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                // 原始尺寸
                const elRect = el.getBoundingClientRect();
                const originWidth = elRect.width;
                const originHeight = elRect.height;

                // 最大尺寸限制
                const maxWidth = this.width;
                const maxHeight = this.height;

                // 目标尺寸
                var targetWidth = originWidth,
                    targetHeight = originHeight;
                if (originWidth > maxWidth || originHeight > maxHeight) {
                    if (originWidth / originHeight > maxWidth / maxHeight) {
                        // 更宽，按照宽度限定尺寸
                        targetWidth = maxWidth;
                        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                    } else {
                        targetHeight = maxHeight;
                        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                    }
                };
                // canvas对图片进行缩放
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                // 清除画布
                context.clearRect(0, 0, targetWidth, targetHeight);
                // 压缩
                context.drawImage(el, 0, 0, targetWidth, targetHeight);
                const imageData = context.getImageData(0, 0, targetWidth, targetHeight);
                resolve(imageData);
            })
        },
    },
};
</script>
<style lang="less">

.keepPage {
    max-width:500px;
    margin:0 auto;
    position: relative;
    .toast_fixed_top_left{
        position: absolute;
        top: 0;
        left: 0;
        transform: translate3d(0,0,0);
        font-size:12px;
        border-radius:0 0 8px 0;
        padding: 4px 0px;
    }
    &>.van-cell-group--inset{
        margin-bottom: 16px;
    }
    .canvas-wrapper {
        position: relative;
        user-select: none;
        margin: 0 auto;
    }

    .canvas-wrapper>video {
        background: #000;
        display: block;
        width: 100%;
        height: auto;
    }

    .canvas-wrapper>canvas {
        user-select: none;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 0;
        width: 30%;
        background: rgba(0 ,0, 0,0.7);
        border-radius: 0 5px 0 0;
        transition: 0.25s;
    }
    .canvas-wrapper>canvas.skeletonOpen{
        width:100%;
        border-radius:0;
        background:transparent;
    }

    .modelLoad {
        background-color: rgba(0, 0, 0, 0.7);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 50;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .quantityChart{
        width: 100%;
        max-height:100px;
        display: block;
        overflow: hidden scroll;
        .quantityChart-item{
            display: block;
            padding: 10px 12px;
            font-size: 12px;
        }
    }
    .quantity{
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;
        font-size:19px;
        font-weight: bold;
        color:#000022;
        width:40px;
        height:40px;
        border-radius:100px;
        background: #fff;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }
    .statsViewGroup{
        padding: 5px;
        .statsView>div{
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            flex-direction: row-reverse;
            canvas{
                display:block !important;
                margin: 5px;
            }
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

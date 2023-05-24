<template>
    <div class="faceContrast">
        <div class="progress">
            <div class="progress-item" style="width:10%;background-color:#ff976a"></div>
            <div class="progress-item" style="width:35%;background-color:#07c160"></div>
            <div class="progress-item" style="width:55%;background-color:#ee0a24"></div>
            <div class="progress-bar" v-if="(faceProportion>0)" ref="distance" :style="{left:faceProportion+'%'}" v-text="faceProportion.toFixed(1)"></div>
        </div>
        <div style="padding: 15px 0">
            <div class="canvas-wrapper"
                :style="{ width: width + 'px', height: height + 'px'}">
                <img class="ImageUp" :src="ImageUp" v-show="(inputlType=='Image'&&ImageUp)" :width="width" :height="height" />
                <video v-show="inputlType=='Camera'" ref="video" :style="{ 'transform': modelParams.flipHorizontal ? 'scale(-1, 1)' : 'scale(1, 1)' }" :width="width" :height="height" @play="isPause = false" @pause="(isPause = true)"
                    webkit-playsinline="true" playsinline="true" preload autoplay loop muted></video>
                <canvas ref="canvas" :style="{ 'transform': modelParams.flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }" :width="width" :height="height"></canvas>
                <img class="PreviewImg" ref="PreviewImg" :style="{ 'transform': modelParams.flipHorizontal ? 'scale(-1, 1)' : 'scale(1, 1)' }"  v-show="(projectionsLoading||trainingLoading)">
                <transition name="van-fade">
                   <div class="PromptWords" v-if="(((faceProportion<10)||faceProportion>45)&&((projectionsLoading||trainingLoading)||inputlType=='Image')&& faceProportion>0)" v-text="(faceProportion<10)?'太远':faceProportion>45?'太近':''"></div>
                </transition>
            </div>
        </div>
        <input type="file" @change="fileChange($event)" accept="image/*" ref="InputFile" style="display:none">
        <van-tabs v-model="tabsActive" type="card" @click="clickTabs"
            :style="{ 'height': `calc(100% - ${height}px - 30px)` }">
            <van-tab name="Settings" title="配置" :disabled="(trainingLoading || projectionsLoading)">
                <van-cell-group inset>
                    <van-field label="输入模型">
                        <template #input>
                            <van-radio-group @change="changeInputlType" v-model="inputlType" direction="horizontal">
                                <van-radio name="Camera">Camera</van-radio>
                                <van-radio name="Image">Image</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>
                    <van-field label="摄像头" v-if="inputlType=='Camera'" center is-link>
                        <template #input>
                            <select class="van-field__control" v-model="deviceId" @change="openCamera">
                                <option v-for="(item, index) in deviceList" :key="index" :value="item.deviceId"
                                    v-text="item.name"></option>
                            </select>
                        </template>
                    </van-field>
                    <van-field label="镜像" v-if="inputlType=='Camera'" center>
                        <template #input>
                            <van-switch v-model="modelParams.flipHorizontal" size="15"></van-switch>
                        </template>
                    </van-field>
                    <!-- <van-field label="暂停" center>
                        <template #input>
                            <van-switch v-model="isPause" size="15"
                                @change="isPause ? $refs.video.pause() : $refs.video.play()"></van-switch>
                        </template>
                    </van-field> -->
                    <van-field label="录入数量" center>
                        <template #input>
                            <van-stepper v-model="maxTrainingNum" min="1" max="100" />
                        </template>
                    </van-field>
                    <van-field label="录入间隔" center>
                        <template #input>
                            <van-stepper v-model="acquisitionInterval" min="0.1" max="2" step="0.1"
                                decimal-length="1" />
                        </template>
                    </van-field>
                    <van-field label="识别间隔" center>
                        <template #input>
                            <van-stepper v-model="predictionInterval" min="0.1" max="2" step="0.1" decimal-length="1" />
                        </template>
                    </van-field>

                    <van-field label="下载录入模型" center>
                        <template #input>
                            <van-button @click="downloadsModel" type="info" native-type="button" size="small">下载
                            </van-button>
                        </template>
                    </van-field>
                    <van-field label="加载本地JSON" center>
                        <template #input>
                            <div>
                                <van-uploader :before-read="loadlocalModel" accept="application/json" />
                            </div>
                        </template>
                    </van-field>
                    <van-field label="删除JSON" center>
                        <template #input>
                            <van-button @click="removeModel" type="danger" native-type="button" size="small">删除
                            </van-button>
                        </template>
                    </van-field>
                </van-cell-group>
            </van-tab>
            <van-tab name="Input" title="录入" :disabled="(trainingLoading || projectionsLoading)">
                <van-notice-bar wrapable :scrollable="false" :text="inputlType=='Camera'?'可以在人脸列表中重复录入':'上传图片=> 选择人脸 => 开始录入。可以在人脸列表中重复录入'" left-icon="info-o" />
                <div style="text-align:center;padding:15px" v-if="inputlType=='Image'">
                    <van-button @click="$refs.InputFile.click()" type="default" native-type="button" style="min-width:150px;" round>上传图片
                    </van-button>
                </div>
                <h2 class="doc-block__title">
                    人脸列表
                    <van-button @click="addFaceItem" :disabled="(trainingLoading)" type="info" native-type="button"
                        size="mini">添加人脸</van-button>
                </h2>
                <van-radio-group v-model="targetNumber" :disabled="trainingLoading">
                    <van-cell-group inset>
                        <van-cell v-for="(item, index) in faceList" :key="index" :title="item" clickable
                            @click="(!trainingLoading && (targetNumber = item))">
                            <template #right-icon>
                                <van-radio :name="item" />
                            </template>
                        </van-cell>
                        <div v-if="isEmpty(faceList)" class="empty__description">人脸列表为空，请添加人脸</div>
                    </van-cell-group>
                </van-radio-group>
                <van-cell-group v-if="(trainingData.length > 0)" inset>
                    <div class="trainingData">
                        <img v-for="(item, index) in trainingData" :key="index" :src="item.Base64"
                            :alt="trainingData.length - index" :style="{ 'transform': modelParams.flipHorizontal ? 'scale(-1, 1)' : 'scale(1, 1)' }" />
                    </div>

                    <van-field label="采集进度" v-if="inputlType=='Camera'" center>
                        <template #input>
                            <van-progress :percentage="GetPercent(trainingData.length, maxTrainingNum)"
                                style="width: 100%;" />
                        </template>
                    </van-field>
                </van-cell-group>
                <div style="text-align:center;padding:15px">
                    <van-button @click="clickTrain" type="primary" :disabled="(!targetNumber || trainingLoading)"
                        native-type="button" style="min-width:150px;" round>{{ trainingLoading ? '录入中' : '开始录入' }}
                    </van-button>
                </div>
            </van-tab>
            <van-tab name="Identification" title="识别" :disabled="(trainingLoading || projectionsLoading)">
                <van-cell-group inset>
                    <div style="text-align:center;padding:15px" v-if="inputlType=='Image'">
                        <van-button @click="$refs.InputFile.click()" type="default" native-type="button" style="min-width:150px;" round>上传图片
                        </van-button>
                    </div>
                    <div style="text-align:center;padding:15px">
                        <van-button @click="ToggleProjections" :disabled="(isEmpty(faceList) || trainingLoading)"
                            :type="projectionsLoading ? 'warning' : 'info'" native-type="button"
                            style="min-width:150px;" round>{{ projectionsLoading ? '暂停识别' : '开始识别' }}</van-button>
                    </div>
                    <table class="resultTable">
                        <thead>
                            <tr>
                                <th width="30%">名称</th>
                                <th>汉明距离</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in predictedResults" :key="index" v-show="item.name">
                                <td>{{ item.name }}</td>
                                <td>{{ item.score }}</td>
                            </tr>
                        </tbody>
                    </table>
                </van-cell-group>
            </van-tab>
        </van-tabs>

    </div>
</template>

<script>
import { isPhone, isObjEmpty, compare } from '@/libs/utils';
import Camera from '@/libs/camera';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'; //https://github.com/tensorflow/tfjs-models/tree/master/face-landmarks-detection
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/face_mesh';
import Dexie from 'dexie';
import { ref } from 'vue';
// https://www.jianshu.com/p/db164ffa7c42
export default {

    data() {
        return {
            width: 300,
            height: 300,
            inputShapeWidth: 200,//录入模型的宽度
            inputShapeHeight: 200,//录入模型的高度
            tabsActive: `Settings`,
            inputlType:`Camera`,//输入模型
            ImageUp:'',
            faceProportion:0,//脸部距离镜头记录
            db: null,
            deviceList: [], //设备列表
            isCameraOpen: false, //摄像头是否打开
            task: null, //任务
            model: null, //模型
            modelLoad: true, //模型加载中
            deviceId: localStorage.getItem(`deviceId`) || 'user', //设备id
            isPause: false, //暂停
            modelParams: {
                flipHorizontal: false, // 是否水平翻转
            },
            canvas: null,
            ctx: null,
            maxTrainingNum: 20, //采集数量
            acquisitionInterval: 0.5, //采集间隔
            predictionInterval: 0.5, //识别间隔
            trainingLoading: false,//录入中
            trainingData: [],//录入数据
            interval: 0,//间隔记录
            faceList: [],//录入人脸数据
            targetNumber: '', //当前录入人脸
            projectionsLoading: false,//开始识别中
            predictedResults: [],//识别结果
            entryData:[],
        };
    },
    async mounted() {
        if (isPhone()) {
            this.flipHorizontal = true;
        };
        // this.$notify({ type: 'primary', message: '首次模型加载模型可能需要1-2分钟，请耐心等待', duration: 2000, });
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        await this.createDb(); //初始化数据库
        await this.getFaceList(); //获取录入人脸的名称
        this.changeInputlType();
    },
    async beforeDestroy() {
        this.isCameraOpen = false;
        window.cancelAnimationFrame(this.task);
        this.camera && await this.camera.stop();
    },
    watch: {
        modelParams: {
            deep: true,
            async handler() {
                // !this.modelLoad && await this.createModel();
            }
        }
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
         //input上传
        async fileChange(event) {
            if(!event.target.files)return;
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: 'loading',
            });
            this.faceProportion = 0;
            const file = event.target.files[0];
            window.URL && window.URL.revokeObjectURL(this.ImageUp);
            const url = window.URL && window.URL.createObjectURL(file);
            this.ImageUp  = url;
            const image = await this.imgLoad(url);
            const imageData = await this.compressionImage(image); //压缩图片
            console.log(imageData);
            const faces = await this.model.estimateFaces(imageData, {
                flipHorizontal: false
            });

            if(faces && faces.length>0){
                this.drawResults(faces); //绘制
            }else{
                this.$toast('图片中没有检测到人脸');
                setTimeout(() => {
                    window.URL && window.URL.revokeObjectURL(this.ImageUp);
                    this.ImageUp  = '';
                }, 1000);
            }
            event.target.value = '';
            toast.clear();
        },
        //切换输入模式
        async changeInputlType(){
            this.isCameraOpen = false;
            window.cancelAnimationFrame(this.task);
            this.camera && await this.camera.stop();
            this.faceProportion = 0;
            window.URL && window.URL.revokeObjectURL(this.ImageUp);
            this.ImageUp  = '';
            const inputlType = this.inputlType;
            if(inputlType==="Image"){
                await this.createModel();
            }
            if(inputlType==="Camera"){
                this.cameraInit();
                this.openCamera();
            }
        },
        //创建数据库
        async createDb() {
            // https://dexie.org/docs/Tutorial/Vue
            this.db = new Dexie('faceData');
            await this.db.version(1).stores({
                entryData: `++id, name, data, base64, time`, //录入人脸数据
            });
            console.log(this.db);
        },
        async getEntryData(){
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: 'loading',
            });
            try {
                this.entryData = await this.db.entryData.toArray();
                console.log(this.entryData );
                toast.clear();
            } catch (error) {
                toast.clear();
                this.$toast('录入人脸数据获取失败')
            }

        },
        async getFaceList() {
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: 'loading',
            });
            try {
                this.faceList = [...new Set(await this.db.entryData.orderBy('name').keys())];
                toast.clear();
            } catch (error) {
                toast.clear();
                this.$toast('录入人脸数据获取失败')
            }
        },
        async ToggleProjections() {
            if(this.inputlType==="Camera"){
                this.projectionsLoading = !this.projectionsLoading;
            }
            if(this.inputlType==="Image"){
                const trainingData = this.trainingData;
                if(!this.isEmpty(trainingData)){
                    this.onRegNum(trainingData[0].FaceFingerprint);
                    this.$toast('识别成功')
                }else{
                    this.$toast('请上传图片')
                }
            }
        },
        async clickTabs(name, title) {
            console.log(name, title);
            this.targetNumber = '';
            this.trainingData = [];
            this.interval = 0;
            this.predictedResults = [];
            window.URL && window.URL.revokeObjectURL(this.ImageUp);
            this.ImageUp = '';
            this.faceProportion = 0;
            if(name==="Input"){
                await this.getFaceList();
            }
            if(name==="Identification"){
                await this.getEntryData();
            }
        },
        clickTrain() {

            if (this.targetNumber) {
                if(this.inputlType==="Camera"){
                    if (this.isCameraOpen && !this.modelLoad && !this.isPause) {
                        this.trainingData = [];
                        this.interval = 0;
                        this.trainingLoading = true;
                    } else {
                        this.$dialog.alert({
                            title: '警告',
                            message: '请检查摄像头是否打开，识别模型是否加完完毕，视频是否打开',
                        })
                    }
                };
                if(this.inputlType==="Image"){
                    const trainingData = this.trainingData;
                    if(!this.isEmpty(trainingData)){
                        this.setEntryData();
                    }else{
                        this.$toast('请上传图片')
                    }
                }

            } else {
                this.$toast('请选择需要录入的人脸')
            }
        },
        addFaceItem() {
            const name = prompt('请输入人脸名称', '');
            if (!name) return;
            if (this.faceList.find(e => e === name)) {
                this.$toast(`[${name}]已存在`)
                return;
            };
            this.faceList.push(name);
            this.targetNumber = name;
            console.log(name);
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
                    width: this.width,
                    height: this.height,
                }
            });
            await this.getMediaDevices();
        },
        openCamera() {
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '打开摄像头',
            });
            this.isCameraOpen = false;
            this.camera.open(this.deviceId)
                .then(async res => {
                    const video = this.$refs.video;
                    const { videoWidth, videoHeight } = video;
                    const { clientWidth, clientHeight } = video;
                    video.width = videoWidth;
                    video.height = videoHeight;
                    console.log(`视频尺寸:${videoWidth}/${videoHeight}\n显示尺寸:${clientWidth}/${clientHeight}`);
                    this.isCameraOpen = true;
                    if (res.settings && res.settings.deviceId) {
                        this.deviceId = res.settings.deviceId;
                        if (this.deviceList.filter(e => e.deviceId == this.deviceId).length === 0) {
                            this.deviceList.unshift({
                                name: res.label || '[未知设备]',
                                deviceId: this.deviceId
                            })
                        }
                        window.localStorage.setItem(`deviceId`, this.deviceId);
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
                        this.inputlType = `Image`;
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
                if (this.isCameraOpen && !this.modelLoad && !this.isPause) {
                    const video = this.$refs.video;
                    const faces = await this.model.estimateFaces(video, {
                        flipHorizontal: false
                    });
                    this.drawResults(faces, video); //绘制
                };
                this.task = window.requestAnimationFrame(this.recognition);
            } catch (error) {
                console.log(error);
                this.task = window.requestAnimationFrame(this.recognition);
            }
        },
        //绘制轮廓
        drawResults(faces) {
            this.ctx.save();
            const { width, height } = this.canvas;
            this.ctx.clearRect(0, 0, width, height);
            faces.forEach(faceItem => {
                const faceProportion = this.GetPercent(faceItem.box.width * faceItem.box.height, width * height);
                this.faceProportion = faceProportion;
                const keypoints = (faceItem.keypoints || []);
                const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
                //面网络
                const AdjacentPairs = faceLandmarksDetection.util.getAdjacentPairs(model);
                const facial = Object.keys(AdjacentPairs);
                for (let i = 0; i < facial.length; i++) {
                    const item = facial[i];
                    const points = AdjacentPairs[item].map(idx => keypoints[idx]);
                    this.drawLine(points, 0.1, '#000');
                };
                this.tailorFace(faceItem);
            });
            this.ctx.restore();
        },
        //裁剪脸部
        async tailorFace(faceItem) {
            if (this.inputlType==="Camera" &&!this.projectionsLoading && !this.trainingLoading) return;

            const { xMin, yMin, width, height } = faceItem.box;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;

            const imageData = this.ctx.getImageData(xMin, yMin, canvas.width, canvas.height);
            context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
            const faceBase64 = canvas.toDataURL("image/png");
            const image = await this.imgLoad(faceBase64);
            canvas.width = this.inputShapeWidth;
            canvas.height = this.inputShapeHeight;
            context.clearRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = 'white'; //实际是透明的,必须填充白色
            context.fillRect(0, 0, canvas.width, canvas.height);

            const imgHeight = canvas.height * 1; //高度
            const coefficient = imgHeight / image.height;
            const imgWidth = coefficient * image.width;
            context.drawImage(image, 0, 0, image.width, image.height, (canvas.width - imgWidth) / 2, (canvas.height - imgHeight) / 2, imgWidth, imgHeight);

            const Base64 = canvas.toDataURL("image/png");
            this.$refs.PreviewImg && (this.$refs.PreviewImg.src = Base64);
            // if(this.faceProportion<10 || this.faceProportion>45){
            //     console.log(this.inputlType==="Camera");
            //     return;
            // };
            const FaceFingerprint = this.getFaceFingerprint(context.getImageData(0, 0, canvas.width, canvas.height));
            if(this.inputlType==="Image"){
                this.trainingData.unshift({
                    Time: Date.now(),
                    Base64,
                    FaceFingerprint
                });
            }
            const maxTrainingNum = this.maxTrainingNum;
            const acquisitionInterval = this.acquisitionInterval; //采集间隔

            //每个0.5秒绘制一次
            if (this.trainingLoading && this.trainingData.length < maxTrainingNum && (Date.now() - this.interval) >= (1000 * acquisitionInterval)) {
                //录入数据
                this.trainingData.unshift({
                    Time: Date.now(),
                    Base64,
                    FaceFingerprint
                });

                this.interval = Date.now()
                if (this.trainingData.length >= maxTrainingNum) {
                    console.log('数据采集完毕');
                    this.setEntryData();
                }
            };

            const predictionInterval = this.predictionInterval; //识别间隔
            if (this.projectionsLoading && (Date.now() - this.interval) >= (1000 * predictionInterval)) {
                this.onRegNum(FaceFingerprint);
            }

        },
        //预测
        async onRegNum(data) {
            const grouping = this.entryData.reduce((pre, next) =>{
                const i = pre.findIndex(e=>e.name===next.name);
                if(i>=0){
                    pre[i].list.push(next)
                }else{
                    pre.push({
                        name:next.name,
                        score:0,
                        list:[next]
                    })
                }
                return pre
            }, []);
            const getHammingDistance = grouping.map((event) =>{
                event.score = event.list.map(e=>this.hammingDistance(data,e.data)).sort((a,b)=>a.score-b.score)[0]
                return event
            }).sort((a,b)=>a.score-b.score);
            this.predictedResults = getHammingDistance;
        },
        //汉明距离
        hammingDistance(str1,str2){
            let distance = 0
            const str1Arr = str1.split('')
            const str2Arr = str2.split('')
            str1Arr.forEach((letter, index) => {
                if (letter !== str2Arr[index]) {
                distance++
                }
            })
            return distance
        },
        async setEntryData() {
            this.$refs.video && this.$refs.video.pause();
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '保存数据中',
            });
            var array = this.trainingData;
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                try {
                    toast.message = `保存数据中（${index}/${array.length}）`;
                    await this.db.entryData.add({
                        name: this.targetNumber,
                        data: element.FaceFingerprint,
                        // base64: element.Base64,
                        time: element.Time,
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            toast.clear();
            this.$toast('保存成功');
            this.trainingLoading = false;
            this.$refs.video && this.$refs.video.play();
            if(this.inputlType==="Image"){
                setTimeout(() => {
                    this.trainingData = [];
                    window.URL && window.URL.revokeObjectURL(this.ImageUp);
                    this.ImageUp = '';
                    this.faceProportion = 0;
                }, 1000);
            }
        },
        //获取脸指纹
        getFaceFingerprint(imgData) {
            const grayList = imgData.data.reduce((pre, cur, index) => {
                if ((index + 1) % 4 === 0) {
                    pre.push(imgData.data[index - 1])
                }
                return pre
            }, [])
            const length = grayList.length;
            const grayAverage = grayList.reduce((pre, next) => (pre + next), 0) / length;
            return grayList.map(gray => (gray >= grayAverage ? 1 : 0)).join('')
        },
        //画线
        drawLine(lineArr = [], lineWidth = 2, color = "lime", isFill = false,ctx=this.ctx) {
            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            lineArr.forEach((e, index) => {
                if (index > 0) {
                    ctx.lineTo(e.x, e.y);
                } else {
                    ctx.moveTo(e.x, e.y);
                }
            });
            ctx.stroke();
            ctx.closePath();
            if (isFill) {
                ctx.fillStyle = color;
                ctx.fill();
            }
        },
        //下载
        async downloadsModel() {
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: 'loading',
            });
            try {
                const entryData = await this.db.entryData.toArray();
                if (entryData.length > 0) {
                    await this.saveJSON(entryData, `faceData.json`);
                    toast.clear();
                } else {
                    this.$toast('数据不存在')
                }
            } catch (error) {
                toast.clear();
                this.$toast('下载失败')
            }
        },
        //加载模型
        async loadlocalModel(file) {
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: 'loading',
            });
            try {
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onload = async (event) => {
                    var array = JSON.parse(event.target.result);
                    for (let index = 0; index < array.length; index++) {
                        const element = array[index];
                        try {
                            if (element.name && element.data && element.time) {
                                toast.message = `加载数据中（${index}/${array.length}）`;
                                await this.db.entryData.add({
                                    id: element.id,
                                    name: element.name,
                                    data: element.data,
                                    base64: element.base64 || "",
                                    time: element.time,
                                });
                            }

                        } catch (error) {
                            console.log(error);
                        }
                    }
                    toast.clear();
                    this.$toast('加载成功')
                };
                reader.onerror = () => {
                    console.log(reader.error);
                    toast.clear();
                    this.$toast('加载失败1')
                }

            } catch (error) {
                toast.clear();
                this.$toast('加载失败2')
            }
            return false
        },
        //删除数据
        removeModel() {
            this.$dialog.confirm({
                title: '警告',
                message: `确定删除数据？`,
                theme: 'round-button',
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                allowHtml: true,
            })
                .then(async () => {
                    const toast = this.$toast.loading({
                        duration: 0, // 持续展示 toast
                        forbidClick: true,
                        message: 'loading',
                    });
                    try {
                        await this.db.delete();
                        this.faceList = [];//录入人脸数据
                        this.targetNumber = ""; //当前录入人脸
                        await this.createDb(); //初始化数据库
                        toast.clear();
                        this.$toast('删除成功')
                    } catch (error) {
                        console.log(error);
                        toast.clear();
                        this.$toast('删除失败')
                    }
                })
                .catch(() => {

                });
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
        //压缩图片
        compressionImage(el){
            return new Promise(async resolve => {
                console.log(el);
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = this.width;
                canvas.height = this.height;

                const { sx, sy, swidth, sheight, x, y, width, height } = this.getObjectFitSize('contain', canvas.width, canvas.height, el.width, el.height)
                context.drawImage(el, sx, sy, swidth, sheight, x, y, width, height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                resolve(imageData);
            })
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
        saveJSON(data, filename) {
            return new Promise(async resolve => {
                if (!filename) {
                    filename = 'json.json'
                }
                if (typeof data === 'object') {
                    data = JSON.stringify(data)
                }
                var blob = new Blob([data], { type: 'text/json' });
                var e = document.createEvent('MouseEvents');
                var a = document.createElement('a');
                a.download = filename;
                a.href = window.URL.createObjectURL(blob);
                a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
                e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(e);
                resolve(a);
            })
        },
        imgLoad(src) {
            return new Promise(async resolve => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    img.width = img.width;
                    img.height = img.height;
                    resolve(img);
                };
                img.onerror = () => {
                    resolve(img);
                };
            })
        },
    },
};
</script>
<style lang="less" scoped>
.faceContrast {
    max-width: 600px;
    margin: 0 auto;
    height: 100%;
    .progress{
        position: absolute;
        top:0;
        left:0;
        width:100%;
        height:15px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        .progress-item{
            font-size: 12px;
            height: 100%;
        }
        .progress-bar{
            font-size:12px;
            position: absolute;
            left:0;
            top:0;
            font-size: 12px;
            color: #fff;
            display: flex;
            height: 100%;
            align-items: center;
            transition:0.2s;
        }
    }

    /deep/.van-tabs__content {
        height: calc((100% - 30px) - 15px);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .canvas-wrapper {
        position: relative;
        margin: 0 auto;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background: #000;
    }

    .canvas-wrapper,
    .canvas-wrapper>video,
    .canvas-wrapper>canvas {
        border-radius: 8px;
        overflow: hidden;
    }

    .canvas-wrapper>.ImageUp{
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .canvas-wrapper>video {
        display: block;
        width: 100%;
        height: auto;
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

    .canvas-wrapper>.PreviewImg {
        display: block;
        width:70px;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 3;
        opacity: 0.5;
        &[src=""],
        &:not([src]) {
            opacity: 0;
        }
    }
    .canvas-wrapper>.PromptWords {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0,0,0,0.5);
        font-size: 14px;
        color: #fff;
        padding: 5px 10px;
    }

    .van-tabs__content {
        margin-top: 10px;
    }

    .van-notice-bar--wrapable .van-notice-bar__content {
        font-size: 12px;
    }

    .doc-block__title {
        margin: 0;
        padding: 20px 16px 16px;
        font-size: 14px;
        font-weight: 500;
        position: relative;

        &>button {
            position: absolute;
            top: 50%;
            right: 15px;
            transform: translateY(-50%);
        }
    }

    .empty__description {
        color: #969799;
        font-size: 14px;
        line-height: 20px;
        padding: 15px;
    }

    .van-cell-group--inset {
        margin-top: 15px;
    }

    .trainingData {
        display: flex;
        overflow: auto;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin: 10px;
        padding: 0 10px;

        img {
            width: 40px;
            height: 40px;
        }
    }

    .resultTable {
        width: 100%;
        margin: 1em 0;
        text-align: left;

        .van-image {
            background-color: #f7f8fa;
        }

        .van-panel {
            display: inline-block;
            width: 150px;
            margin: 5px;

            .van-image {
                display: block;
                width: 100%;
            }
        }
    }

    .resultTable,
    .resultTable th,
    .resultTable td {
        border: 1px solid #c6c6c6;
        border-collapse: collapse;
        padding: 5px;
        vertical-align: middle;
    }

}
</style>

<template>
    <div class="faceMesh3d">
        <div class="canvas-wrapper" ref="wrapper">
            <video ref="video"
                :style="{ 'transform': flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }"
                webkit-playsinline="true" playsinline="true" preload autoplay loop muted></video>
            <canvas ref="canvas" :style="{ 'transform': flipHorizontal ? 'translate(-50%,-50%) scale(-1, 1)' : 'translate(-50%,-50%) scale(1, 1)' }" :width="canvasWidth" :height="canvasHeight"></canvas>
        </div>
        <!-- 切换摄像头 -->
        <van-action-sheet v-model="actionShow" :actions="deviceList" description="请选择设备" @select="actionSelect"
            cancel-text="取消" close-on-click-action>
        </van-action-sheet>
        <!-- 切换摄像头 -->

        <div class="btn-group">
            <van-button type="default" native-type="button" size="small" icon="photograph" @click="actionShow = true">切换摄像头</van-button>
            <van-button type="default" native-type="button" size="small" icon="smile" @click="meshPopup = true">选择3D模型</van-button>
            <van-button type="default" native-type="button" size="small" :icon="flipHorizontal?'ascending':'descending'" @click="triggerToggleFlipHorizontal" class="flipHorizontalBut">切换镜像</van-button>
        </div>

        <!-- 选择3D模型 -->
        <van-popup class="meshPopup" v-model="meshPopup" position="bottom"  :style="{ height: '80%',width:'100%' }" round closeable>
            <h2 class="meshPopup-title van-hairline--bottom">选择3D模型</h2>
            <div class="scrollbar-y" style="height: calc(100% - 55px);background-color: #f7f8fa;">
                <div class="meshList">
                    <div class="meshList-item" v-for="(item,index) in meshList" :key="index" :class="{meshAction:meshIndex===index}" @click="meshIndex!=index && changeMesh(meshIndex=index)">
                        <van-image :src="item.src" fit="cover"></van-image>
                        <div class="meshName van-ellipsis" v-if="item.name" v-text="item.name"></div>
                    </div>
                    <div class="meshList-item">
                        <van-uploader :before-read="uploaderGlb" preview-size="100px" accept="*"></van-uploader>
                        <div class="uploader-text">
                            <div>
                                <van-icon name="photograph" />
                                <p>上传glb模型</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="helpCollapse">
                    <van-collapse v-model="helpTextModel">
                        <van-collapse-item title="如何制作3D模型？" name="0">
                            关于3D模型和形态动画如何制作，这需要一定的3D绘图基础，您也可以到<a href="https://sketchfab.com/3d-models" target="_blank" rel="noopener noreferrer">sketchfab</a>中下载制作好的模型。
                        </van-collapse-item>
                    </van-collapse>
                </div>
            </div>
        </van-popup>
        <!-- 选择贴纸 -->

    </div>
</template>

<script>
import { isPhone, isObjEmpty } from '@/libs/utils';
import Camera from '@/libs/camera';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/face_mesh';
import { Face } from "kalidokit";
export default {

    data() {
        return {
            camera: null,
            width: document.documentElement.clientWidth || window.innerWidth,
            height: document.documentElement.clientHeight || window.innerHeight,
            canvasWidth: 0,
            canvasHeight: 0,
            actionShow: false,
            deviceList: [], //设备列表
            isCameraOpen: false, //摄像头是否打开
            task: null, //任务
            model: null, //模型
            modelLoad: true, //模型加载中
            deviceId: localStorage.getItem(`deviceId`) || 'user', //设备id
            flipHorizontal: false, // 是否水平翻转
            // three
            scene:null,
            threeCamera:null,
            renderer:null,
            geometry:null,
            background:null,
            Object3D:null,
            morphTarget:null,
            // three
            meshPopup:false,
            meshIndex:0,
            meshList:[
                {
                    "name":"猪头",
                    "type": "model",
                    "src":"https://dcdn.it120.cc/2022/12/07/e64174b8-a96c-4f36-9b70-9ed5c952f4df.png",
                    "model":"https://dcdn.it120.cc/2022/12/07/55607c9c-1aaa-494a-b332-6a5360933c4a.glb"
                },
                {
                    "name":"大象",
                    "type": "model",
                    "src":"https://dcdn.it120.cc/2022/12/07/208ccc82-94db-4aab-a431-c7531ec190a3.png",
                    "model":"https://dcdn.it120.cc/2022/12/07/4c4096b0-fd19-4a1b-886c-7b263c35dfe9.glb"
                },
                {
                    "name":"小狗",
                    "type": "model",
                    "src":"https://dcdn.it120.cc/2022/12/07/bb97bbff-3799-4a16-88f9-527495859e0d.png",
                    "model":"https://dcdn.it120.cc/2022/12/07/2204b6c9-e334-4e56-b056-2fe19ca7a578.glb"
                },
                {
                    "name":"猴子",
                    "type": "model",
                    "src":"https://dcdn.it120.cc/2022/12/07/38c7776f-8604-45fc-bc4e-60435bc03f6e.png",
                    "model":"https://dcdn.it120.cc/2022/12/07/92fbd0de-9d5f-449e-999f-709e7eb0cc63.glb"
                }
            ],
            helpTextModel:['0']
        };
    },
    async mounted() {
        if (isPhone()) {
            this.flipHorizontal = true;
        }
        this.$notify({ type: 'primary', message: '首次模型加载模型可能需要1-2分钟，请耐心等待', duration: 2000, });
        await this.getData();
        this.cameraInit();
        this.openCamera();
    },
    async beforeDestroy() {
        this.isCameraOpen = false;
        window.cancelAnimationFrame(this.task);
        this.Object3D && this.scene.remove(this.Object3D);
        this.renderer && this.renderer.dispose();
        this.threeCamera = null;
        this.camera && await this.camera.stop();
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
        //获取数据
       async getData() {
            if(location.hostname==="localhost") return;
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '获取贴纸',
            });
           try {
            // https://sketchfab.com/3d-models/heart-glasses-ef812c7e7dc14f6b8783ccb516b3495c
            const url = "https://wangpeng1478.github.io/web/faceMesh/data.json";
            const response = await fetch(`${url}?s=${new Date().getDate()}_${new Date().getHours()}`).then(r => r.json());
            this.meshList = response.filter(e=>e.type==="model");
           } catch (error) {
            console.log('getData',error);
           } finally{
             toast.clear();
           }
        },
        uploaderGlb(file){
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: 'loading',
            });
            const url = window.URL && window.URL.createObjectURL(file);
            if(file.name.includes('.glb')){
                this.meshList.push({
                    model:url,
                    type: "model",
                    name:file.name
                })
                toast.clear();
            }else{
                toast.clear();
                this.$toast('格式错误-'+file.type)
            }
            return false
        },
        //创建3d场景
        Create3dScene(){
            let w = this.canvasWidth;
            let h = this.canvasHeight;
            let video = this.$refs.video;
            let canvas = this.$refs.canvas;

            const scene = new THREE.Scene()
            // 根据你的需要，也可以把camera画面当作scene的背景
            const backgroundTexture = new THREE.VideoTexture(video)
            const background = new THREE.Mesh(
                new THREE.PlaneGeometry(w, h),
                new THREE.MeshBasicMaterial({
                    map: backgroundTexture
                })
            )
            background.position.set(0, 0, -1000)
            scene.add(background)

            // 放置camera，这里选用的是正交相机(OrthographicCamera)
            const camera = new THREE.OrthographicCamera(
                w / -2,
                w / 2,
                h / 2,
                h / -2,
                0.1,
                2000
            )
            camera.position.set(0, 0, 1000)
            camera.lookAt(scene.position)

            // 添加一些光照
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.3)
            scene.add(hemiLight)
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
            scene.add(ambientLight)
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
            directionalLight.position.set(0.5, 0, 0.866)
            scene.add(directionalLight)

            // 创建渲染器
            const renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true
            })
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize(w, h)

            this.scene = scene;
            this.threeCamera = camera;
            // this.background = background;
            this.renderer = renderer;
            this.changeMesh();
        },
        //改变3D模型
        changeMesh(meshIndex=0){
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '加载3D模型中',
            });
            try {

                //模型地址
                const modelUrl = this.meshList[meshIndex].model;
                console.log('modelUrl',modelUrl);
                const loader = new GLTFLoader();
                const Object3D = new THREE.Object3D();
                this.Object3D && this.scene.remove(this.Object3D);
                Object3D.position.set( 0, 0, 0 )
                loader.load(modelUrl, (gltf) => {
                    const object = gltf.scene
                    const box = new THREE.Box3().setFromObject(object)
                    const size = box.getSize(new THREE.Vector3()).length()
                    const center = box.getCenter(new THREE.Vector3())
                    object.position.x += (object.position.x - center.x);
                    object.position.y += (object.position.y - center.y + 1);
                    object.position.z += (object.position.z - center.z - 15);
                    Object3D.add(object)
                    this.scene.add(Object3D)

                    // 面部动作
                    this.morphTarget = this.findMorphTarget(object)
                    this.Object3D = Object3D;
                    this.meshIndex = meshIndex;
                    this.meshPopup = false;
                    toast.clear();
                    console.log('面部动作',this.morphTarget);
                })
            } catch (error) {
                console.log(error);
                toast.clear();
                this.$toast('图片设置失败')
            }

        },
        //计算Matrix
        track(object, prediction) {
           try {
             // position: 以眉心(midwayBetweenEyes)[168]作为位置基准
             const position = prediction.midwayBetweenEyes[0]
            // scale: 以最左侧(234)和最右侧(454)的距离作为缩放基准
            const scale = this.getScale(prediction.scaledMesh, 234, 454)
            // rotation: 以头顶(10)左脸颊(50)右脸颊(280)作为旋转基准
            const rotation = this.getRotation(prediction.scaledMesh, 10, 50, 280)
            object.position.set(...position)
            object.scale.setScalar(scale/20)
            object.scale.x *= -1
            object.rotation.setFromRotationMatrix(rotation)
            object.rotation.y = -object.rotation.y
            object.rotateZ(Math.PI)
            object.rotateX(-Math.PI * .05)
            if (this.morphTarget) {
                // flipped
                this.morphTarget['leftEye'] && this.morphTarget['leftEye'](1 - prediction.faceRig.eye.r)
                this.morphTarget['rightEye'] && this.morphTarget['rightEye'](1 - prediction.faceRig.eye.l)
                this.morphTarget['mouth'] && this.morphTarget['mouth'](prediction.faceRig.mouth.shape.A)
            }
           } catch (error) {
                // console.log(error);
           }
        },
        //面部动作
        findMorphTarget(nodes, value){
            const morphTarget = {};
            const traverse = (node) => {
                if (node.type === 'Mesh' && node.morphTargetInfluences) {
                    const mesh = node;
                    Object.keys(mesh.morphTargetDictionary).forEach(key => {
                        morphTarget[key] = (value) => {
                            mesh.morphTargetInfluences[mesh.morphTargetDictionary[key]] = value
                        }
                    })
                }
                node.children.forEach(traverse)
            }
            traverse(nodes)
            return morphTarget
        },
        getScale(n, e=0, t=1){
            const pos1 = new THREE.Vector3(...n[e]);
            const pos2 = new THREE.Vector3(...n[t]);
            return pos1.distanceTo(pos2)
        },
        getRotation(n, e=0, t=1, s=2){
            const pos1 = new THREE.Vector3(...n[e]);
            const pos2 = new THREE.Vector3(...n[t]);
            const pos3 = new THREE.Vector3(...n[s]);
            const m4 = new THREE.Matrix4();
            const axisX = pos2.clone().sub(pos3).normalize()
            const axisY = pos2.clone().add(pos3).multiplyScalar(.5).sub(pos1).multiplyScalar(-1).normalize()
            const axisZ = new THREE.Vector3().crossVectors(axisX, axisY).normalize();
            return m4.makeBasis(axisX, axisY, axisZ).invert()
        },
        render3D(prediction){
            if (prediction) {
                this.track(this.Object3D,prediction)
            }
            this.renderer.render(this.scene, this.threeCamera)
        },
        resolveMesh(faceMesh, vw=this.canvasWidth, vh=this.canvasHeight){
            return faceMesh.map(p => [p[0] - vw / 2, vh / 2 - p[1], -p[2]])
        },
        //镜像切换
        async triggerToggleFlipHorizontal() {
            this.flipHorizontal = !this.flipHorizontal;
        },
        actionSelect(value) {
            const { deviceId } = value;
            this.actionShow = false;
            if (!isObjEmpty(deviceId) && this.deviceId != deviceId) {
                this.deviceId = deviceId;
                window.localStorage.setItem(`deviceId`, deviceId);
                this.openCamera();
            }
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
            if(this.width>960){
                this.width = 960;
                this.height = 540;
            }
            this.camera = new Camera(video, {
                audio: false,
                video: isPhone()?{frameRate:60}:{ width: this.width,height: this.height,frameRate:60}
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
                    this.canvasWidth = videoWidth;
                    this.canvasHeight = videoHeight;
                    video.style.width = videoWidth+'px';
                    video.style.height = videoHeight+'px';
                    this.$refs.wrapper.style.width = clientWidth+'px';
                    this.$refs.wrapper.style.height = (videoWidth/clientWidth) * clientHeight+'px';
                    this.isCameraOpen = true;
                    if (res.settings && res.settings.deviceId) {
                        this.deviceId = res.settings.deviceId;
                        if (this.deviceList.filter(e => e.deviceId == this.deviceId).length === 0) {
                            this.deviceList.unshift({
                                color:`#1989fa`,
                                name: res.label || '[未知设备]',
                                deviceId: this.deviceId
                            })
                        }
                        window.localStorage.setItem(`deviceId`, this.deviceId);
                    };
                    await this.createModel();
                    this.Create3dScene();
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
                if (this.isCameraOpen && !this.modelLoad && !this.isPause) {
                    const video = this.$refs.video;
                    const faces = await this.model.estimateFaces(video, {
                        flipHorizontal: false, //镜像
                        // flipHorizontal: this.flipHorizontal, //镜像
                    });
                    if (faces.length > 0) {
                        var keypoints = faces[0].keypoints;
                        var scaledMesh = keypoints.reduce((acc, pos) =>{
                                acc.push([pos.x,pos.y,pos.z])
                                return acc
                            }, []);
                        const faceMesh = this.resolveMesh(scaledMesh)

                        // 计算眨眼，张嘴的幅度
                        const faceRig = Face.solve(keypoints, {
                            runtime: "mediapipe",
                            video,
                            imageSize: { height: this.canvasHeight, width: this.canvasWidth },
                            smoothBlink: false, // 平滑左右眼眨眼延迟
                            blinkSettings: [0.25, 0.75], // 调整上下边界眨眼灵敏度
                        });
                        this.Object3D && (this.Object3D.visible = true)
                        this.render3D({
                            midwayBetweenEyes:[168].map(idx => faceMesh[idx]),
                            scaledMesh,
                            faceRig,
                        });
                    }else{
                        this.Object3D && (this.Object3D.visible = false)
                        this.renderer.render(this.scene, this.threeCamera)
                    }
                };
                this.task = window.requestAnimationFrame(this.recognition);
            } catch (error) {
                console.log(error);
                this.task = window.requestAnimationFrame(this.recognition);
            }
        },
        // 计算眨眼，张嘴的幅度
    },
};
</script>
<style lang="less" scoped>
.faceMesh3d {
    width: 100%;
    height: 100%;
    background-color: #000;
    overflow: hidden;
    .meshPopup{
        overflow: hidden;
        .meshPopup-title{
            font-size: 15px;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 55px;
        }
        .meshList{
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            .meshList-item{
                width:100px;
                height:100px;
                margin: 10px;
                overflow: hidden;
                position: relative;
                border: 3px solid #e8e8e8;
                transition: 0.35s;
                border-radius: 5px;
                &.meshAction{
                    border: 3px solid #1989fa;
                }
                .van-image,
                .van-image>img{
                    display: block;
                    width:100%;
                    height:100%;
                }
                .meshName{
                    position: absolute;
                    left:50%;
                    bottom:0;
                    transform: translateX(-50%);
                    width:100%;
                    text-align: center;
                    background-color: rgba(0, 0, 0,0.5);
                    color:#fff;
                    font-size: 12px;
                    padding: 4px 0;
                }
                .van-uploader{
                    position: absolute;
                    left:0;
                    top:0;
                    width:100%;
                    height:100%;
                    z-index:10;
                    opacity:0;
                }
                .uploader-text{
                    user-select: none;
                    position: absolute;
                    left:0;
                    top:0;
                    width:100%;
                    height:100%;
                    z-index:9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    &>div{
                        text-align: center;
                    }
                    .van-icon{
                        color: #ababab;
                        font-size: 24px;
                    }
                    p{
                        color: #666;
                        margin: 3px;
                        font-size: 12px;
                    }
                }
            }
        }
    }
    .scrollbar-y{
        overflow: hidden auto;
        -webkit-overflow-scrolling: touch;
        position: relative;
    }

    .canvas-wrapper {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
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
    .helpCollapse{
        margin:15px;
    }
    .btn-group{
        position: fixed;
        bottom: 5vh;
        left:50%;
        transform: translateX(-50%);
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 320px;
        &>button{
            border-radius:0;
            flex: 1;
            background-color: rgba(255, 255, 255, 0.95);
        }
        &>button:first-child{
            border-radius: 5px 0 0 5px;
        }
        &>button:last-child{
            border-radius: 0 5px 5px 0;
        }
        .flipHorizontalBut .van-button__icon{
            transform: rotate(90deg);
        }
    }
}
</style>

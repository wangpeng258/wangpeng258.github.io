<template>
    <div class="faceMesh">
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
            <van-button type="default" native-type="button" size="small" icon="smile" @click="meshPopup = true">选择贴纸</van-button>
            <van-button type="default" native-type="button" size="small" :icon="flipHorizontal?'ascending':'descending'" @click="triggerToggleFlipHorizontal" class="flipHorizontalBut">切换镜像</van-button>
        </div>

        <!-- 选择贴纸 -->
        <van-popup class="meshPopup" v-model="meshPopup" position="bottom"  :style="{ height: '80%',width:'100%' }" round closeable>
            <h2 class="meshPopup-title van-hairline--bottom">选择贴纸</h2>
            <div class="scrollbar-y" style="height: calc(100% - 55px);background-color: #f7f8fa;">
                <div class="meshList">
                    <div class="meshList-item" v-for="(item,index) in meshList" :key="index" :class="{meshAction:meshIndex===index}" @click="meshIndex!=index && changeMesh(meshIndex=index)">
                        <van-image :src="item.src" fit="cover"></van-image>
                        <div class="meshName van-ellipsis" v-if="item.name" v-text="item.name"></div>
                    </div>
                    <div class="meshList-item">
                        <van-uploader :before-read="uploaderImage" preview-size="100px" accept="image/*"></van-uploader>
                        <div class="uploader-text">
                            <div>
                                <van-icon name="photograph" />
                                <p>上传图片</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="helpCollapse">
                    <van-collapse v-model="helpTextModel">
                        <van-collapse-item title="如何制作贴纸？" name="0">
                            首先<a href="https://dcdn.it120.cc/2022/12/06/2b63b0b4-a4b8-481d-97ab-60c2a09d740b.jpg" target="_blank" rel="noopener noreferrer">下载面部网格</a>，导入PS或其他制图工具，将面部网格图片设置为最底层，然后在上面绘制图案，然后导出PNG。
                        </van-collapse-item>
                    </van-collapse>
                </div>
            </div>
        </van-popup>
        <!-- 选择贴纸 -->

    </div>
</template>

<script>
// https://effect.douyin.com/learn/startup-pro
// https://effect.douyin.com/learn/general-2d

import { isPhone, isObjEmpty } from '@/libs/utils';
import { TRIANGULATION,UVS } from '@/libs/faceData';
import Camera from '@/libs/camera';
import * as THREE from 'three';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/face_mesh';
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
            mesh:null,
            // three
            meshPopup:false,
            meshIndex:0,
            meshList:[
                {
                    name:`敬过往祈新年`,
                    src:`https://dcdn.it120.cc/2022/12/14/cb57d900-8597-4c70-b34d-2966dc428bc7.png`,
                    srcX:`https://dcdn.it120.cc/2022/12/14/3f1e0c82-3455-4896-9ea3-d19541db52be.png`
                },
                {
                    name:`彩色贴纸`,
                    src:`https://dcdn.it120.cc/2022/12/06/795dea0b-76e9-48b8-a162-20b29d2731a7.png`
                },
                {
                    name:`3D面部贴纸`,
                    src:`https://dcdn.it120.cc/2022/12/09/770e9c62-2fb6-4899-8b3e-93437cbaddfb.png`
                },
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
        this.mesh && this.scene.remove(this.mesh);
        this.geometry && this.scene.remove(this.geometry);
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
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '获取贴纸',
            });
           try {
            // const url = "https://web-1254176432.cos.ap-shanghai.myqcloud.com/faceMesh/data.json";
            // const response = await fetch(`${url}?s=${new Date().getDate()}_${new Date().getHours()}`).then(r => r.json());
            // this.meshList = response.filter(e=>e.type!="model");
           } catch (error) {
            console.log('getData',error);
           } finally{
             toast.clear();
           }
        },
        uploaderImage(file){
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: 'loading',
            });
            const url = window.URL && window.URL.createObjectURL(file);
            if(file.type.includes('image/')){
                this.meshList.push({
                    src:url,
                    name:file.name
                })
                toast.clear();
            }else{
                toast.clear();
                this.$toast('图片格式错误-'+file.type)
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
                0,
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
            this.background = background;
            this.renderer = renderer;
            this.changeMesh();
        },
        //改变贴图
        changeMesh(meshIndex=0){
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '加载贴图中',
            });
            try {
                this.mesh && this.scene.remove(this.mesh);
                this.geometry && this.scene.remove(this.geometry);

                const geometry = new THREE.BufferGeometry()
                geometry.setIndex(TRIANGULATION)
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(UVS.map((item, index) => index % 2 ? item : 1 - item), 2))
                geometry.computeVertexNormals()
                this.geometry = geometry;


                const textureLoader = new THREE.TextureLoader();
                const {src,srcX} = this.meshList[meshIndex];
                textureLoader.load(this.flipHorizontal?src:srcX||src,texture=>{
                    texture.encoding = THREE.sRGBEncoding
                    texture.anisotropy = 16
                    const material = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        color: new THREE.Color(0xffffff), //设置材质的颜色
                        reflectivity: 0.5
                    });
                    const mesh = new THREE.Mesh(geometry, material)
                    this.scene.add(mesh)
                    this.mesh = mesh;
                    this.meshIndex = meshIndex;
                    this.meshPopup = false;
                    toast.clear();
                })
            } catch (error) {
                console.log(error);
                toast.clear();
                this.$toast('图片设置失败')
            }

        },
        render3D(prediction){
            if (prediction) {
                this.updateGeometry(prediction)
            }
            this.renderer.render(this.scene, this.threeCamera)
        },
        // 根据face mesh实时更新geometry
        updateGeometry(prediction){
            let w = this.canvasWidth;
            let h = this.canvasHeight;
            const faceMesh = this.resolveMesh(prediction.scaledMesh, w, h)
            const positionBuffer = faceMesh.reduce((acc, pos) => acc.concat(pos), [])
            this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionBuffer, 3))
            this.geometry.attributes.position.needsUpdate = true
        },
        resolveMesh(faceMesh, vw, vh){
            return faceMesh.map(p => [p[0] - vw / 2, vh / 2 - p[1], -p[2]])
        },
        //镜像切换
        async triggerToggleFlipHorizontal() {
            this.flipHorizontal = !this.flipHorizontal;
            this.changeMesh(this.meshIndex);
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
                        this.render3D({
                            scaledMesh:keypoints.reduce((acc, pos) =>{
                                acc.push([pos.x,pos.y,pos.z])
                                return acc
                            }, [])
                        });
                    }else{
                        this.render3D({scaledMesh:[]})
                    }
                };
                this.task = window.requestAnimationFrame(this.recognition);
            } catch (error) {
                console.log(error);
                this.task = window.requestAnimationFrame(this.recognition);
            }
        }
    },
};
</script>
<style lang="less" scoped>
.faceMesh {
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

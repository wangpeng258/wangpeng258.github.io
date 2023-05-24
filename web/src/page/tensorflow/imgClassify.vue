<template>
    <div class="imgClassify">
        <input id="inputFileColorThief" type="file" @change="fileChange($event)" accept="image/*" multiple style="display: none;">
        <label for="inputFileColorThief" class="uploader" ref="uploader">
            <div class="uploader__text">将文件拖到此处，或<span>点击上传</span></div>
        </label>
        <div style="text-align:center;font-size: 12px;"><i>支持粘贴上传</i></div>
        <table class="resultTable">
            <thead>
                <tr>
                    <th>名称</th>
                    <th width="50" style="text-align: center;">分数</th>
                    <th width="50" style="text-align: center;">耗时</th>
                    <th width="140" style="text-align: center;">图片</th>
                </tr>
            </thead>
            <tbody>
            <tr v-for="(item,index) in result" :key="index">
                <td v-text="item.className"></td>
                <td style="text-align: center;" v-text="item.probability"></td>
                <td style="text-align: center;" v-text="item.time"></td>
                <td style="text-align: center;"><van-image :src="item.src"  width="130" height="130" fit="contain"></van-image></td>
            </tr>
        </tbody>
        </table>

    </div>
</template>

<script>
import { isObjEmpty } from '@/libs/utils';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as mobilenet from '@tensorflow-models/mobilenet';
import GUI from 'lil-gui'; // https://lil-gui.georgealways.com/
export default {

    data() {
        return {
            model:null,
            modelLoad:false,
            gui:null,
            controls:{
                modelType:'2-1'
            },
            result:[],
            modelTypeArr:{
                '1-1':{
                    version: 1,
                    alpha:1,
                    modelUrl:`https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_100_224/classification/1/model.json?tfjs-format=file`
                },
                '1-0.75':{
                    version: 1,
                    alpha:0.75,
                    modelUrl:`https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_075_224/classification/1/model.json?tfjs-format=file`
                },
                '1-0.5':{
                    version: 1,
                    alpha:0.5,
                    modelUrl:`https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_050_224/classification/1/model.json?tfjs-format=file`
                },
                '1-0.25':{
                    version: 1,
                    alpha:0.25,
                    modelUrl:`https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_025_224/classification/1/model.json?tfjs-format=file`
                },
                '2-1':{
                    version: 2,
                    alpha:1,
                    modelUrl:`https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v2_100_224/classification/2/model.json?tfjs-format=file`
                },
                '2-0.75':{
                    version: 2,
                    alpha:0.75,
                    modelUrl:`https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v2_075_224/classification/2/model.json?tfjs-format=file`
                },
                '2-0.5':{
                    version: 0.5,
                    alpha:1,
                    modelUrl:`https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v2_050_224/classification/2/model.json?tfjs-format=file`
                },
            }
        };
    },
    mounted() {
        // 剪切板上传
        document.addEventListener('paste', this.upPaste);
        this.$refs.uploader.addEventListener("dragenter", this.funPreventDefault, false);
        this.$refs.uploader.addEventListener("dragover", this.funDragover, false);
        this.$refs.uploader.addEventListener("dragleave", this.funDragleave, false);
        this.$refs.uploader.addEventListener("drop", this.funDrop, false);
        this.guiInit();
        this.createModel();
    },
    beforeDestroy() {
        document.removeEventListener('paste', this.upPaste);
        this.$refs.uploader.removeEventListener("dragenter", this.funPreventDefault, false);
        this.$refs.uploader.removeEventListener("dragover", this.funDragover, false);
        this.$refs.uploader.removeEventListener("dragleave", this.funDragleave, false);
        this.$refs.uploader.removeEventListener("drop", this.funDrop, false);
        this.gui && this.gui.destroy();
    },
    methods: {
        isEmpty(e) {
            return isObjEmpty(e)
        },
        //阻止默认行为
        funPreventDefault(event) {
            event.preventDefault()
        },
        //拖动悬停
        funDragover(event) {
            event.preventDefault();
            event.target.style.borderColor = '#409eff';
            event.target.style.boxShadow = '0 0 11px 3px rgba(64, 158, 255,0.5)';
        },
        //拖动悬停离开
        funDragleave(event) {
            event.preventDefault();
            event.target.style.borderColor = '#c0ccda';
            event.target.style.boxShadow = '0 0 0 0 transparent';
        },
        //拖动悬停放下
       async funDrop(event) {
            event.preventDefault();
            event.target.style.borderColor = '#c0ccda';
            event.target.style.boxShadow = '0 0 0 0 transparent';
            this.recognition(event.dataTransfer.files);
        },
        //剪切板上传
        async upPaste(event) {
            let items = event.clipboardData && event.clipboardData.items;
            let files = [];
            if (items && items.length) {
                // 检索剪切板items
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        files.push(items[i].getAsFile());
                    }
                }
            };
            this.recognition(files);
        },
        //input上传
        async fileChange(event) {
            this.recognition(event.target.files);
        },
         //file => base64
        fileToBase64(file){
            return new Promise(resolve => {
                const fr = new FileReader();
                fr.onloadend =  (e)=>{
                    resolve(e.target.result)
                }
                fr.readAsDataURL(file);
            })
        },
         //file => Image
        fileToImage(file) {
            return new Promise(async resolve => {
                const img = new Image();
                img.src = await this.fileToBase64(file);
                img.onload = () => {
                    resolve(img);
                };
                img.onerror = () => {
                    resolve(img);
                };
            })
        },
        guiInit(){
            this.gui && this.gui.destroy();
            this.gui = new GUI();
            this.gui.add(this.controls, 'modelType',['2-1','2-0.75','2-0.5','1-1','1-0.75','1-0.5','1-0.25']).name(`模型`).onChange((value) => {
                this.createModel();
            });
            this.gui.close();
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
                this.model = await mobilenet.load(this.modelTypeArr[this.controls.modelType]);
                toast.clear();
                this.modelLoad = false;
                resolve(this.model);
            })
        },
        //获取分类
        getClassify(img,topk=1){
            return new Promise(async resolve => {
                const predictions = await this.model.classify(img,topk);
                resolve(predictions);
            })
        },
        //开始识别
       async recognition(files){
            const toast = this.$toast.loading({
                duration: 0, // 持续展示 toast
                forbidClick: true,
                message: '识别中',
            });
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                toast.message = `识别中${index+1}/${files.length}`;
                if (file.type.includes('image/')) {
                    const startTime = Date.now();
                    const Img = await this.fileToImage(file);
                    const predictions = await this.getClassify(Img);
                    const endTime = Date.now();
                    this.result.unshift({
                        src:Img.src,
                        className:predictions[0].className,
                        probability:predictions[0].probability.toFixed(2),
                        time:((endTime - startTime)/1000).toFixed(2)+'s'
                    })
                }
            };
            toast.clear();
        },
    },
};
</script>
<style lang="less" scoped>
.imgClassify {
    max-width:800px;
    margin:0 auto;
    padding:15px;
    .uploader {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 15px;
        background-color: #fbfdff;
        border: 1px dashed #c0ccda;
        border-radius: 6px;
        box-sizing: border-box;
        margin: 25px 15px 15px 15px;
        min-height: 220px;
        cursor: pointer;
        box-shadow: transparent 0px 0px 0px 0px;
        transition: 0.25s;
    }

    .uploader:hover {
        border-color: #409eff;
    }

    .uploader .uploader__text {
        color: #606266;
        font-size: 14px;
        text-align: center;
    }
    .resultTable{
        width:100%;
        margin: 1em 0;
        text-align: left;
        .van-image{
            background-color: #f7f8fa;
        }
        .van-panel{
            display: inline-block;
            width:150px;
            margin:5px;
            .van-image{
                display: block;
                width:100%;
            }
        }
    }
    .resultTable, .resultTable th , .resultTable td  {
        border: 1px solid grey;
        border-collapse: collapse;
        padding: 5px;
        vertical-align: middle;
    }
}
</style>

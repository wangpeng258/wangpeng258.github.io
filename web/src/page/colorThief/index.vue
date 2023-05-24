<template>
    <div class="colorThief">
        <label for="inputFileColorThief" class="uploader" ref="uploader">
            <div class="uploader__text">将文件拖到此处，或<span>点击上传</span></div>
        </label>
        <div style="text-align:center;font-size: 12px;"><i>支持粘贴上传</i></div>
        <div class="image-wrap">
            <div class="swatches">
                <div class="swatch" v-for="(item,index) in colorsList" :key="index" :style="{'background-color':`rgb(${item[0]}, ${item[1]}, ${item[2]})`}">
                    <span :style="{'color':`rgb(${item[0]}, ${item[1]}, ${item[2]})`}" v-text="index+1"></span>
                </div>
            </div>
            <div class="previewImg" :style="{'background-color':isEmpty(colorsList)?`transparent`:`rgb(${colorsList[0][0]}, ${colorsList[0][1]}, ${colorsList[0][2]})`}">
                <img :src="ImgSrc" v-if="ImgSrc">
            </div>
        </div>
        <input id="inputFileColorThief" type="file" @change="fileChange($event)" accept="image/*">
    </div>
</template>

<script>
import { isObjEmpty } from '@/libs/utils';
import ColorThief from 'colorthief';
export default {
    data() {
        return {
            ImgSrc:null,
            colorsList:[],
        };
    },
    mounted() {
        // 剪切板上传
        document.addEventListener('paste', this.upPaste);
        this.$refs.uploader.addEventListener("dragenter", this.funPreventDefault, false);
        this.$refs.uploader.addEventListener("dragover", this.funDragover, false);
        this.$refs.uploader.addEventListener("dragleave", this.funDragleave, false);
        this.$refs.uploader.addEventListener("drop", this.funDrop, false);
    },
    beforeDestroy() {
        document.removeEventListener('paste', this.upPaste);
        this.$refs.uploader.removeEventListener("dragenter", this.funPreventDefault, false);
        this.$refs.uploader.removeEventListener("dragover", this.funDragover, false);
        this.$refs.uploader.removeEventListener("dragleave", this.funDragleave, false);
        this.$refs.uploader.removeEventListener("drop", this.funDrop, false);
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
        funDrop(event) {
            event.preventDefault();
            event.target.style.borderColor = '#c0ccda';
            event.target.style.boxShadow = '0 0 0 0 transparent';
            const file = event.dataTransfer.files[0];
            this.getColor(file)
        },
        //剪切板上传
        upPaste(event) {
            let items = event.clipboardData && event.clipboardData.items;
            let file = null;
            if (items && items.length) {
                // 检索剪切板items
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        file = items[i].getAsFile();
                        break;
                    }
                }
            };
            this.getColor(file)
        },
        //input上传
        fileChange(event) {
            const file = event.target.files[0];
            this.getColor(file)
        },
        async getColor(file) {
            if (file.type.includes('image/')) {
                const toast = this.$toast.loading({
                    duration: 0, // 持续展示 toast
                    forbidClick: true,
                    message: 'loading',
                });
                const colorThief = new ColorThief();
                const Img = await this.fileToImage(file);
                this.ImgSrc=Img.src;
                try {
                    const colors = await colorThief.getPalette(Img);
                    this.colorsList = this.removeDuplicate(colors || []);
                    toast.clear();
                } catch (error) {
                    toast.clear();
                    this.$toast(`${error}`)
                }
            } else {
                this.$toast(`格式错误-${file.type}`)
            }
        },
        //file => Image
        fileToImage(file) {
            return new Promise(async resolve => {
                const img = new Image();
                img.src = window.URL && window.URL.createObjectURL(file);
                img.onload = () => {
                    resolve(img);
                };
                img.onerror = () => {
                    resolve(img);
                };
            })
        },
        //数组去重
        removeDuplicate(arr) {
            let len = arr.length
            for (let i = 0; i < len; i++) {
                for (let j = i + 1; j < len; j++) {
                    if (arr[i].join(',') === arr[j].join(',')) {
                        arr.splice(j, 1)
                        len--
                        j--
                    }
                }
            }
            return arr
        }
    },
};
</script>
<style lang="less" scoped>
.colorThief {
    margin: 0 auto;
    width: 100%;
    max-width: 500px;

    .uploader {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 15px;
        background-color: #fbfdff;
        border: 1px dashed #c0ccda;
        border-radius: 6px;
        box-sizing: border-box;
        margin: 15px;
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

    .image-wrap {
        margin: 15px;
    }

    .previewImg {
        padding: 20px 0;
        border-radius: 10px;
        overflow: hidden;
    }

    .image-wrap img {
        width: 50%;
        display: block;
        margin: 0 auto;
    }

    .image-wrap img[src=""],
    .image-wrap img:not([src]) {
        display: none;
    }

    input[type="file"] {
        display: none;
    }

    .swatches {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        margin: 0 5px 20px 5px;
    }

    .swatches>.swatch {
        display: flex;
        width: 3rem;
        height: 3rem;
        border-radius: 100px;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        margin: 3px;
    }

    .swatches>.swatch>span {
        filter: invert(100%);
    }
}
</style>

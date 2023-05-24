/**
 * @ 日期格式化
 * @ fmt  YYYY-mm-dd HH:MM:SS
*/
function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
};

/**
 * @ 占比计算
 * @ num 当前数
 * @ total 总数
*/
function GetPercent(num, total) {
    num = parseFloat(num);
    total = parseFloat(total);
    if (isNaN(num) || isNaN(total)) {
        return "-";
    }
    return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00);
};

/**
 * @ 获取地址栏参数
 */
 function getQuery() {
    var url = location.search;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1),
            strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(decodeURIComponent(strs[i].split("=")[1]));
        }
    };
    return theRequest
};

/**
 * 获取时分秒
 * @param {Number} seconds 总秒数
 * @param {String} dateFormat 返回的日期格式，默认为'H:i:s'
 */
 function getSFM(seconds, dateFormat = 'H:i:s') {
    var obj = {};
    obj.H = Number.parseInt(seconds / 3600);
    obj.i = Number.parseInt((seconds - obj.H * 3600) / 60);
    obj.s = Number.parseInt(seconds - obj.H * 3600 - obj.i * 60);
    if (obj.H < 10) {
      obj.H = '0' + obj.H;
    }
    if (obj.i < 10) {
      obj.i = '0' + obj.i;
    }
    if (obj.s < 10) {
      obj.s = '0' + obj.s;
    }

    // 3.解析
    var rs = dateFormat.replace('H', obj.H).replace('i', obj.i).replace('s', obj.s);
    return rs;
  }

// 获取URL地址参数
function getQueryString(name, url) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    if (!url || url == ""){
	    url = window.location.search;
    }else{
    	url = url.substring(url.indexOf("?"));
    }
    r = url.substr(1).match(reg)
    if (r != null) return unescape(decodeURIComponent(r[2])); return null;
}

/**
 * 判断数据是否为空
 * @param {*} obj
 * @returns
 */
 function isObjEmpty(obj) {
    return (
        obj === undefined ||
        obj === "undefined" ||
        obj == null ||
        obj === "" ||
        obj.length === 0 ||
        (typeof obj === "object" && Object.keys(obj).length === 0)
    );
};


var speakTimer,
    stopTimer;
    isSpeakerState = '0'; // 0未朗读  1开始朗读 2结束朗读
var speaker = new window.SpeechSynthesisUtterance();
    speaker.addEventListener('start',_=>{
        isSpeakerState = '1';
        // console.log('[start]',_);
    })
    speaker.addEventListener('end',_=>{
        isSpeakerState = '2';
        // console.log('[end]',_);
        isSpeakerEnd = true;
    })
    // speaker.addEventListener('resume',_=>{
    //     console.log('[resume]',_);
    // })
    // speaker.addEventListener('pause',_=>{
    //     console.log('[pause]',_);
    // })
    // speaker.addEventListener('error',_=>{
    //     console.log('[error]',_);
    // })
    // 开始朗读
    function speakText(text,rate=1.5,name) {
        if(!isObjEmpty(name) && isSpeakerState=="1"){
            return;
        };
        speaker.rate =  rate;
        clearTimeout(speakTimer);
        window.speechSynthesis.cancel();
        speakTimer = setTimeout(function () {
            speaker.text = text;
            window.speechSynthesis.speak(speaker);
        }, 200);
    }

    // 停止朗读
    function stopSpeak() {
        clearTimeout(stopTimer);
        clearTimeout(speakTimer);
        stopTimer = setTimeout(function () {
            window.speechSynthesis.cancel();
        }, 20);
    };


    class Notify {
            constructor() {
                this.prompt();
            }
            prompt() {
                const permission = Notification.permission;
                if (permission === "default") {
                    console.log('%c用户还未被询问是否授权[Notification]', 'color:#ff8080');
                    this.requestPermission();
                } else if (permission === "denied") {
                    console.log('%c用户已经明确的拒绝了显示通知的权限[Notification]', 'color:#ff8080');
                } else if (permission === "granted") {
                    console.log('%c用户已同意[Notification]', 'color:#1989fa');
                }
            };
            //获得权限
            requestPermission() {
                Notification.requestPermission(status => {
                    this.prompt();
                })
            }
            send(info) {
                info = Object.assign({
                    // icon:`https://picsum.photos/200/200`,
                    // image:`https://picsum.photos/300/200`,
                    vibrate: [200, 100, 200],
                    renotify: true //重复通知
                }, info)
                const notification = new Notification(info.title, info);
                notification.onshow = _ => {
                    console.log(`${new Date().toLocaleString()} onshow`, notification);
                }
                notification.onclick = _ => {
                    console.log(`${new Date().toLocaleString()} 点击`, notification);
                    window.focus();
                    notification.close();
                }
            }
        };

    function sendNotify(title,content){
        const NotifyObj = new Notify();
        NotifyObj.send({
            title:title,
            body: content,
            tag: "notificationForm"
        })
    };

/* <template v-if="!isObjEmpty(deviceId)">
    <el-button v-if="!status" type="primary"  @click="openMedia" :loading="loading" native-type="button">打开摄像头</el-button>
    <el-button v-else type="danger" @click="closeMedia" :loading="loading" native-type="button">关闭摄像头</el-button>
</template> */
Vue.component('videoMonitor', {
    template: `<div class="pictureView" v-loading="loading">
                    <div class="pictureView-video">
                       <video :controls="controls" ref="video" autoplay webkit-playsinline="true" playsinline="true"></video>
                       <transition name="el-fade-in-linear">
                            <div v-if="qrcode&&isDiscern" class="scanningLine"></div>
                       </transition>
                    </div>
                    <div style="text-align: center;margin: 15px;">
                       <el-select :disabled="isDiscern||isRecord" v-model="deviceId" @change="deviceChange" size="small" placeholder="请选择设备">
                            <el-option
                            v-for="item in deviceList"
                            :key="item.deviceId"
                            :label="item.label"
                            :value="item.deviceId">
                            </el-option>
                        </el-select>
                        <transition name="el-fade-in-linear">
                            <template v-if="qrcode">
                                <div class="record" v-if="isDiscern" style="background:#409eff;">识别中</div>
                                <div class="record" v-else>未开始</div>
                            </template>
                            <template v-if="record">
                                <div class="record" v-if="isRecord" style="background:#409eff;"><i class="el-icon-loading"></i> 录制中 [{{getSFM(timely)}}]</div>
                                <div class="record" v-else>未录制</div>
                            </template>
                        </transition>
                    </div>
               </div>`,
    props: {
        controls: {
            type: Boolean,
            default: false
        },
        width: {
            type: Number,
            default: 1920
        },
        height: {
            type: Number,
            default: 1080
        },
        //显示类型
        picturetype: {
            type: String,
            required: true,
        },
        //是否识别二维码
        qrcode: {
            type: Boolean,
            default: false
        },
        //是否录制
        record: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            id: '',
            loading:true,
            isRecord:false, //是否录制
            isDiscern:false,//是否识别二维码
            mediaDevices: null, //MediaDevices对象
            mediaRecorder: null, //录制器
            mediaStreamTrack: null, //音频或视频流
            blob: null, //录制的视频
            deviceList: [],//设备列表
            deviceId: '',//设备id
            status: false,//录制状态
            qrcodeQrCode: '',//二维码
            imgBase64: "",
            qrcodeResult:"",
            timely:0,
            timelyTimer:null,
        }
    },
    mounted() {
        const deviceId = window.localStorage.getItem(`${this.picturetype}_deviceId`);
        if(!this.isObjEmpty(deviceId)){
            this.deviceId = deviceId;
        }
        this.compatible();
        this.openMedia();
        this.devicesInit();
    },
    methods: {
        isObjEmpty(obj) {
            return isObjEmpty(obj)
        },
        getSFM(seconds, dateFormat = 'H:i:s') {
            return  getSFM(seconds, dateFormat = 'H:i:s')
        },
        dateFormat(fmt, date) {
            return dateFormat(fmt, date)
        },
        // 一堆兼容代码
        compatible() {
            window.URL = (window.URL || window.webkitURL || window.mozURL || window.msURL);
            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
            }
            if (navigator.mediaDevices.getUserMedia === undefined) {
                navigator.mediaDevices.getUserMedia = (constraints) => {
                    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                    if (!getUserMedia) {
                        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                    }
                    return new Promise((resolve, reject) => {
                        getUserMedia.call(navigator, constraints, resolve, reject);
                    });
                }
            }
        },
        //打开摄像头
        openMedia(record,id){
            if(!this.isObjEmpty(record) && !this.isObjEmpty(id)){
                this.id = id;
                console.log('[id]',this.id);
            };
            if(!this.isObjEmpty(record) && this.isObjEmpty(id)){
                speakText(`打开摄像头ID不能为空`); //语音提示
                this.$notify.error({
                    title: '错误',
                    duration:0,
                    message: `[打开摄像头]ID不能为空`,
                });
            };

            this.loading = true;
            this.status = true;
            const deviceId = this.deviceId;
            //摄像头调用配置
            let mediaOpts = {
                audio: false,
                video: true,
                video: {
                    deviceId,
                    facingMode: "environment",
                    width: this.width,
                    height: this.height,
                    frameRate: { ideal: 100, max: 150 } //最佳帧率
                }
            };
            if (this.isObjEmpty(typeof navigator.mediaDevices)){
                speakText(`当前浏览器不支持`); //语音提示
                this.$notify.error({
                    title: '错误',
                    duration:0,
                    message: `navigator.mediaDevices is undefined`,
                });
                return false;
            }
            navigator.mediaDevices.getUserMedia(mediaOpts).then(stream => {
                this.mediaStreamTrack = stream;
                let video = this.$refs['video'];
                if ("srcObject" in video) {
                    video.srcObject = stream
                } else {
                    video.src = window.URL && window.URL.createObjectURL(stream) || stream
                }
                video.play();
                if(this.deviceList.length===0){
                    this.devicesInit();
                };
                if(record){
                    this.startRecord();
                };
                this.loading = false;
                this.$emit('ready',stream);
            }).catch(err => {
                let message = err.message || err,
                    response = {
                        'permission denied': '浏览器禁止本页面使用摄像头，请开启相关的权限',
                        'requested device not found': '未检测到摄像头',
                        'could not start video source': '无法访问到摄像头，请重新插拔后重试'
                    };

                this.loading = false;
                console.log(err);
                console.error(err);
                this.$notify.error({
                    title: '错误',
                    duration:0,
                    message: `${response[ message.toLowerCase() ]} || 摄像头打开失败：${err}`
                });
                this.status = false;
            });
        },
        //开始识别二维码
        startDiscern(id){
            if(!this.isObjEmpty(id)){
                this.id = id;
            }
            this.isDiscern = true;
            this.discern(); //识别二维码
        },
        //停止识别二维码
        endDiscern(){
            this.isDiscern = false;
            if(this.qrcodeQrCode){
                clearInterval(this.qrcodeQrCode)
                this.qrcodeQrCode = null;
            }
        },
        //开始录像
        startRecord(){
            this.timely = 0;
            this.isRecord = false;
            var videoBitsPerSecond = +(window.localStorage.getItem(`videoBitsPerSecond`)||2);

            this.mediaRecorder = new MediaRecorder(this.mediaStreamTrack, {
                audioBitsPerSecond: 0, //音频码率
                videoBitsPerSecond: videoBitsPerSecond * 1000000, //视频码率 (数值越大视频越清晰) 8500000
                mimeType: 'video/webm;codecs=h264' //视频编码格式 video/webm;codecs=h264
            });
            this.mediaRecorder.start();
            this.mediaRecorder.ondataavailable = e => {
                console.log('[ondataavailable]',e);
                this.blob = new Blob([e.data], {
                    'type': e.currentTarget.mimeType
                });
            }
            this.mediaRecorder.onerror = e => {
                speakText(`视频录制失败！`); //语音提示
                console.error(e)
                this.$notify.error({
                    title: '错误',
                    duration:0,
                    message: `视频录制失败！${e}`
                });
            }
            this.mediaRecorder.onstart = e => {
                this.isRecord = true;
                console.log('开始', e);
                this.timely = 0;
                if(this.timelyTimer){
                    clearInterval(this.timelyTimer);
                    this.timelyTimer = null;
                }
                this.timelyTimer =  setInterval(() => {
                    this.timely++;
                }, 1000);
            }
            this.mediaRecorder.onstop = e => {
                if(this.timelyTimer){
                    clearInterval(this.timelyTimer);
                    this.timelyTimer = null;
                }
                // console.log('结束', e);
                // const url = window.URL && window.URL.createObjectURL(this.blob);
                this.$emit('result',{
                    type:"viedo",
                    blob: this.blob,
                    picturetype:this.picturetype,
                    id: this.id
                });
            };
        },
        //停止录像
        endRecord(){
            this.isRecord = false;
            if(this.mediaRecorder){
                this.mediaRecorder.stop();
            }
            if(this.timelyTimer){
                clearInterval(this.timelyTimer);
                this.timelyTimer = null;
            };
        },
        //获取设备信息
        devicesInit(){
            navigator.mediaDevices.enumerateDevices().then(devicesList => {
                const arr = [];
                devicesList.forEach(e => {
                    if (e.deviceId && e.kind === 'videoinput') {
                        arr.push(e)
                    }
                });
                this.deviceList = arr;
                // console.log(`[设备]`,arr);
            }).catch(err => {
                speakText(`获取设备信息失败`); //语音提示
                this.$notify.error({
                    title: '错误',
                    duration:0,
                    message: `获取设备信息失败：${err}`
                });
            });
        },
        deviceChange(){
            window.localStorage.setItem(`${this.picturetype}_deviceId`,this.deviceId)
            this.openMedia();
        },
        //关闭摄像头
        closeMedia() {
            this.loading = true;
            if (this.mediaStreamTrack) {
                this.mediaStreamTrack.getVideoTracks().forEach(track => {
                    track.stop();
                })
            };
            this.loading = false;
            this.status = false;
        },
        //识别
        discern(){
            if(this.qrcodeQrCode){
                clearInterval(this.qrcodeQrCode)
                this.qrcodeQrCode = null;
            }else{
                this.imgBase64 = '';
                this.qrcodeResult = '';
                var qrcodeTime = +(window.localStorage.getItem(`qrcodeTime`)||0.5);

                this.qrcodeQrCode = setInterval(() => {
                    this.discernQrCode();
                }, qrcodeTime*1000);
            }
        },
         //识别二维码
         async discernQrCode() {
            // console.count('识别二维码');
            this.isDiscern = true;
            this.imgBase64 = '';
            this.qrcodeIn = true;
            let video = this.$refs['video'];
            let canvas = document.createElement("canvas");
            var w = video.videoWidth,
                h = video.videoHeight;
            var width = 800,
                height = (width/w)*h;
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, width, height);
            let imageData = ctx.getImageData(0, 0, width, height);
            const code = jsQR(imageData.data, width, height, {
                // inversionAttempts: "invertFirst", //反转优先
                inversionAttempts: "dontInvert", //不要反转
                // inversionAttempts: "onlyInvert", //只反转
                // inversionAttempts: "attemptBoth", //尝试两者
            });
            if(!this.isObjEmpty(code) && !this.isObjEmpty(code.data)){
              const id = getQueryString('id',code.data);
              if(this.isObjEmpty(id)){
                    speakText(`二维码中的参数id为空`); //语音提示
                    this.$notify.error({
                        title: '错误',
                        duration:2000,
                        message: `二维码中的参数id为空${code.data}`
                    });
              }else{
                const picturetype = this.picturetype;
                if(picturetype=="结束" && this.isObjEmpty(this.id)){
                    speakText(`无法获取采集摄像头中的ID`); //语音提示
                    this.$notify.error({
                        title: '错误',
                        duration:0,
                        message: `无法获取采集摄像头中的ID`
                    });
                    return false
                };
                if(picturetype=="结束" && this.id!=id){
                    speakText(`和开始采集的ID ${this.id}！不一致！ 请重新扫描`,1.5,'cj'); //语音提示
                    this.$notify.error({
                        title: '错误',
                        duration:2000,
                        message: `和开始采集的ID（${this.id}）不一致，请重新扫描`
                    });
                    return false
                };
                // if(picturetype=="开始"){
                //     const is = await this.isValid(id);
                //     if(!is){
                //         return false
                //     }
                // };

                var proportion = GetPercent(this.GetQrcodeArea(code.location),width*height);
                console.log('二维码面积占比',proportion);

                var IdentifyTheScale = +(window.localStorage.getItem(`IdentifyTheScale`)||60);
                var lineWidth = 3;
                if(proportion>0 && proportion<5){
                    lineWidth = 1;
                }else if(proportion>5 && proportion<20){
                    lineWidth = 2;
                }else if(proportion>20 && proportion<40){
                    lineWidth = 3;
                }else{
                    lineWidth = 4;
                };

                if(proportion>IdentifyTheScale){
                    speakText(`距离太近`,1.5,'cj'); //语音提示
                    this.$notify.error({
                        title: '提示',
                        duration:2000,
                        message: `距离二维码太近，可能无法拍到商品！请重新扫描`
                    });
                    return false
                }

                //绘制二维码区域
                function drawLine(begin, end,lineWidth=2) {
                    ctx.beginPath();
                    ctx.moveTo(begin.x, begin.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                    ctx.lineWidth = lineWidth;
                    ctx.strokeStyle = "red";
                    ctx.stroke();
                };

                if(window.localStorage.getItem(`showQrcodeLine`)==='open'){
                    drawLine(code.location.topLeftCorner, code.location.topRightCorner,lineWidth);
                    drawLine(code.location.topRightCorner, code.location.bottomRightCorner,lineWidth);
                    drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner,lineWidth);
                    drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner,lineWidth);
                };

                if(window.localStorage.getItem(`watermarkShow`)==='open'){
                    //水印
                    var tiem = this.dateFormat('YYYY-mm-dd HH:MM:SS',new Date());
                    ctx.fillStyle = "rgba(0,0,0,0.3)";
                    //绘制矩形
                    ctx.fillRect(width-290, 0, 500, 35);
                    ctx.font="15px Arial";
                    ctx.textAlign = "start";
                    ctx.textBaseline = "bottom";
                    ctx.fillStyle = "#fff";  //<======= here
                    ctx.fillText('优品联盟-优鲜卡 '+tiem,width-270,27);
                };


                this.id = id;
                this.endRecord(); //停止录像
                this.qrcodeResult = code.data;
                this.imgBase64 = canvas.toDataURL("image/png");
                this.$emit('result', {
                    type:"img",
                    blob: this.convertBase64UrlToBlob(this.imgBase64),
                    picturetype:picturetype,
                    id:id,
                });
                this.endDiscern();
              }
            }

        },
        //计算长方形面积
        GetQrcodeArea(location) {
            var width = location.bottomRightCorner.x - location.topLeftCorner.x;
            var height = location.bottomRightCorner.y - location.topLeftCorner.y;
            return Math.abs(width * height);
        },
        isValid(id){
            return new Promise((resolve, reject)=>{
                    const loading = this.$loading({
                        lock: true,
                        text: '验证是否有效...',
                        spinner: 'el-icon-loading',
                        background: 'rgba(0, 0, 0, 0.7)'
                    });
                    this.$http.post('/upload', {
                        id:id
                    }, {
                        emulateJSON: true
                    }).then(xml => {
                        const res = xml.body;
                        if (res.code == 200) {
                            resolve(true);
                        }
                    }).catch(err => {
                        speakText(`验证是否有效失败，请重新扫描`,1.5,'cj'); //语音提示
                        this.$notify.error({
                            title: '错误',
                            duration:3000,
                            message: `验证是否有效失败，请重新扫描`
                        });
                    }).finally(_=>{
                        loading.close();
                    })
            })
        },
        convertBase64UrlToBlob(base64){
            let urlData = base64
            let type = base64.type
            let bytes=null
            if(urlData.split(',').length>1){//是否带前缀
            bytes = window.atob(urlData.split(',')[1]) // 去掉url的头，并转换为byte
            }else{
            bytes = window.atob(urlData)
            }
                // 处理异常,将ascii码小于0的转换为大于0
            let ab = new ArrayBuffer(bytes.length)
            let ia = new Uint8Array(ab)
            for (let i = 0; i < bytes.length; i++) {
                ia[i] = bytes.charCodeAt(i)
            }
            return new Blob([ab], { type: type })
        }
    }
});
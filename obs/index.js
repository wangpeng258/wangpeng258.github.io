const nodeMediaServer = require("node-media-server")
const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 60,
        ping_timeout: 30
    },
    http: {
        port: 8099,
        allow_origin: '*'
    }
}
var nms = new nodeMediaServer(config)
nms.run();
// obs
// 服务：自定义
// 服务器：rtmp://localhost:1935/live/
// 秘钥：123
// http://192.168.3.16:8099/live/1234.flv
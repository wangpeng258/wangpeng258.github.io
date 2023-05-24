const sha1 = require("sha1");
module.exports = async function (event) {
    const token = 'admin_token';
    const { echostr, nonce, signature, timestamp } = event.queryStringParameters || {};
    // 将三个参数字符串拼接成一个字符串进行sha1加密
    const sha1Str = sha1([timestamp, nonce, token].sort().join(""));
    if (sha1Str === signature) {
        console.log("验证成功")
        return echostr
    } else {
        console.log("验证失败")
        return echostr
    }
}
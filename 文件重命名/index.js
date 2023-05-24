/*
 * @Author: 文件夹重命名
 * @Date: 2021-09-14 14:52:29
 * @LastEditTime: 2021-09-16 16:44:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \工厂购e:\wangpeng1478.github.io\文件重命名\index.js
 */
const fs = require("fs");

const path = `C:\\Users\\Administrator\\Desktop\\魔米学院\\img`;

//返回文件数组列表
const fileList = fs.readdirSync(path);


console.log(__dirname);




fileList.forEach(element => {
    const stats = fs.statSync(`${path}\\${element}`);
    // stats.isDirectory() 目录
    if (stats.isFile()) {
        const fileName = getFilename(element);
        const fileSuffix = getExt(element);

        const oldPath = `${path}\\${element}`;
        const newPath = `${path}\\${fileName}-min.${fileSuffix}`;
        
        fs.rename(oldPath, newPath, _=>{
            console.log(fileName + '---重命名成功!');
        })
    }
});





/**
 * 获取文件后缀名
 * @param {String} filename
 */
function getExt(filename) {
    if (typeof filename == 'string') {
        return filename
            .split('.')
            .pop()
            .toLowerCase()
    } else {
        throw new Error('filename must be a string type')
    }
}

/**
 * 获取文件名字
 * @param {String} filename
 */
function getFilename(path, isExt) {
    if (typeof path == 'string') {
        const arr = path.split('\\');
        const last = arr[arr.length - 1];
        if (isExt) {
            return last
        } else {
            return last.split('.')[0]
        }
    } else {
        throw new Error('path must be a string type')
    }
}
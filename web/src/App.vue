<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  overflow-x: auto;
  color: #2c3e50;
  font-size: 13px;
  background-color: #f7f8fa;
  -webkit-font-smoothing: antialiased;
}
html,
body,
#app{
  width: 100%;
  height: 100%;
}
#nprogress .bar {
  background: #1989fa !important;
}
.preline {
  white-space: pre-line !important;
}

.el-scrollbar-x {
  overflow: auto hidden;
}

.el-scrollbar-y {
  overflow: hidden auto;
}

.el-scrollview {
  overflow: auto;
}

.el-scrollbar-x,
.el-scrollbar-y,
.el-scrollview {
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.van-overlay {
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
}

.viewDialog .van-dialog__message {
    line-height: 1;
    white-space: unset;
}
select.van-field__control {
    -webkit-appearance: none;
    border: 0;
    outline: 0;
    vertical-align: bottom;
    box-sizing: border-box;
    font-size: 12px;
}
</style>

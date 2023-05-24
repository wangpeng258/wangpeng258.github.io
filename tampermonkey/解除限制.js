setInterval(() => {
    // 解除切屏限制
    window.onblur = null;
    window.onblur = function() {console.debug(1);}

    // 解除快捷键操作屏蔽
    window.onkeyup = null;
    window.onkeydown = null;
    window.onkeyPress = null;
    document.onkeyup = null;
    document.onkeydown = null;
    document.onkeyPress = null;
    document.body.onkeyup = null;
    document.body.onkeydown = null;
    document.body.onkeyPress = null;
    // onkeyup = null;
    // onkeydown = null;
    // onkeyPress = null;

    // 解除复制粘贴限制
    window.oncopy = null;
    window.onpaste = null;
    document.oncopy  = null;
    document.onpaste  = null;
    document.body.oncopy  = null;
    document.body.onpaste  = null;
    // oncopy  =
    // onpaste = null;
}, 500);
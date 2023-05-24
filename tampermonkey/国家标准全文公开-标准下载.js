'use strict';
// ==UserScript==
// @name         国家标准全文公开-标准下载，金融标准全文公开-标准下载
// @description  标准全文公开-标准下载
// @namespace    http://tampermonkey.net/
// @version      0.3
// @author       wpp
// @include      *://c.gb688.cn/bzgk/gb/showGb?type=online&hcno=*
// @include      *://www.cfstc.org/bzgk/gk/view/pdfJs/web/viewer.html?*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABAVJREFUWEe1lluIG2UUx//nG7PZzM4kLCaTIrWCuypbqFUsKCK0KoioqAhdqFKQNQuKD4oXlKpoqVraBdEK1bq7KIpVq754wweltRYFEbRCVywWC4o0mdpkM5dYt5kjM2ayySaZS7bO2+Q75/x/37llCDEfVc7fxuDLCLSKwasIUJlxTBD/5oD+MO3SDIAzUcNSVMN0MjfKgiZBuDHQh3EYzNPG3/rXUWJHAlAGsxtIiG0A0lGC/mdDLxt20c1G4BMKkJGzVzgQuwAofiQmngPTz2D+BcwnIMSYANYycHWrGjM/a9b094MIAgG8tEviJYBX+kGIaUe1VtzbLagia/cScF/rGRE/VrX0z3tBBAIsDchM281a8d2gGw0PD2fOnE4cbMnWftPSH+wLQJXzswCv8yoK/rhq60+G1dQ9T8vZmxni+YatUYczbtsn/+zm2zMDinLuGDniTYAGPMe6s9E4ffJoFADXRpXznwB8fqMhnzLs4kcRAEaTaqp6ExPWEnApgBHPifkvo6ZfF1XcAxjSXgDjei97DN0hmiPgJ9TrB1sv0sxAOpm7iCXxuJ/ytkYCDlXt0v1xALo1pH8ZEtjpN6YH0Jjz7QDkDhHmMgOvmDX9vTgAajJ7CSSaAuiCbn5eTLv0qgegytprAK5sGjJ9Jqj+ofeeWDg2Pz9fjiO+aDuazMiVNe67Q7SGme4kQGucVyVHbCYlpd1BhKd9J2beZtb0D/oTDPbKJLURR8KU31sM2kdpWdvKwO2Nbv3UsItb/g9xP6Ys5y6XQG809H4nZSj3DjGtDhuXswWVyWSGnYXkAT8eqbJ22H9xiB6yrOKXYWJcKDRL1jYtMzNbw3wbPdfUJEXO7yLwevfA78ygIFwobACwv4fNMxQCoSgrcuQ4XzT8a5Qe0jYz4xH3B29hSGKTaZ7Qe0EsG0DOP0Hgce/CRAfIXblwpLcISDREf3CIX7Qs/ceu87uMDKgpbQqEG5r1h7PF2wPpVP4BJp5oqydwiIm/g0NHjVrp2+aYxgDIyNl1zNLFIGeMQe6f2nlNDeK9hqXvaK7i1t3dCuJ+fJiWvqkfAFXO3wqw+yXV/jCfMmr6tV7ZW0+Uwex6EtKji/9insn3hl28p0+AWwB+rk2d8LZhlXYulqEDb2VKURZGyMGF7tE5yX++KpfL8/0AeCM3mLuGCStY4NdEYuF4pVKpLCl10NB1ni13CpZGDP0o7ShfjCaMcrX4ABMTd0OI17sGZ3Z3/MM0O3sqinhHE4Y5caHgbkB3E/Z+mI9DiLtoevqbsHjxASYn94F5Y0jgIxgYuIp27zbPOoAbkIMhjkCSxmnPnrko4rEz0BzF7hCxxfsG6JKJvsSXBdACsTpu2lvL8y/P8KgxE8qePAAAAABJRU5ErkJggg==
// @license      AGPL License
// @antifeature  none
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    //http://openstd.samr.gov.cn/bzgk/gb/index 国家标准全文公开
    //https://www.cfstc.org/bzgk/gk 金融标准全文公开

    document.body.insertAdjacentHTML('beforeEnd', '<button onclick="downloadPDF(this)" type="button" style="-webkit-appearance: none;position: fixed;bottom: 100px;left: 50%;transform: translateX(-50%);z-index:999;padding: 5px 20px;border: 1px solid #AAA;background-image: linear-gradient(to bottom,#fff 0,#F8F8F8 100%);background-repeat: repeat-x;border-radius: 2px;">下载</button>');
    window.downloadPDF = async function (obj) {
        if (document.querySelectorAll('#viewer>.page').length > 0) {
            obj.disabled = true;
            obj.innerText = '下载中';
            var _this = window.PDFViewerApplication;
            var url = _this.baseUrl,
                filename = document.title.replace('在线预览|', '') + '.pdf';
            try {
                var data = await _this.pdfDocument.getData();
                var blob = new Blob([data], { type: "application/pdf" });
                var blobUrl = window.URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.style = "display: none";
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                obj.disabled = false;
                obj.innerText = '下载';
            } catch (reason) {
                _this.download();
                obj.disabled = false;
                obj.innerText = '下载';
            }
        } else {
            alert('没有加载完成');
        }
    };
})();
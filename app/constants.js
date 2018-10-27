var config = {
    projectName: "project name",
    statisticsApi: "", // statistics API
    shareTitle: "分享标题",
    shareDesc: "分享明细描述",
    shareLink: "#", // relative
    codeToOpenidAPI: "", // code to openid API
    jssdkConfigAPI: "", // jssdk config API
    jsAPIList: [
        "onMenuShareTimeline",
        "onMenuShareAppMessage",
        "chooseImage",
        "uploadImage"
    ],
    qiniu: {
        accessKey: "", // your access key
        secretKey: "", // your secret key
        bucket: "", // your bucket
        origin: "" // your origin
    },
    server: {
        host: "", // your server host
        username: "", // your server username
        privateKeyFile: "" // your private key local path
    }
};

module.exports = config;

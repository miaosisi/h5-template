"use strict";

var React = require("react");
var Router = require("react-router");
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var DefaultRoute = Router.DefaultRoute;
var $ = require("jquery");

React.initializeTouchEvents(true);

var Loading = require("./component/loading.jsx");

var WechatHandler = require("react-wechat").handler;
var wechatActions = require("react-wechat").actions;
var Button = require("./component/button.jsx");

var Start = require("./view/start.jsx");
var reflux = require("reflux");
var LoadAssets = require("./view/LoadAssets.jsx");
var weChat = require("react-wechat");
var wechatStores = weChat.stores;
var routerContainer = require("./component/routerContainer.js");
var config = require("./constants");

var App = React.createClass({
    mixins: [
        reflux.connect(
            wechatStores.OpenIdStore,
            "openid"
        )
    ],

    childContextTypes: {
        setHeight: React.PropTypes.func.isRequired
    },

    getChildContext: function() {
        return {
            setHeight: this.setHeight
        };
    },

    getInitialState: function() {
        return {
            pageHeight: "1217px",
            device: "ios",
            bgState: "bg-on"
        };
    },

    setHeight: function(h) {
        this.setState({ pageHeight: h + "px" });
    },

    componentDidMount: function() {
        var height = $(window).height();
        var domHeight = $(this.getDOMNode()).height();

        if (domHeight < height) {
            this.setState({
                pageHeight: height + "px"
            });
        }
        if (/Android (\d+\.\d+)/.test(navigator.userAgent)) {
            this.setState({
                device: "android"
            });
        }

        var player = React.findDOMNode(this.player);
        player.play();
    },

    reference: function(ref) {
        this.player = ref;
    },

    toggleMusic: function() {
        var player = React.findDOMNode(this.player);
        if (player.paused) {
            player.play();
            this.setState({
                bgState: "bg-on"
            });
        } else {
            player.pause();
            this.setState({
                bgState: "bg-off"
            });
        }
    },

    render: function() {
        return (
            <div
                className={"app-wrapper " + this.state.device}
                style={{
                    height: this.state.pageHeight
                }}
            >
                <audio className="bg-audio" loop ref={this.reference}>
                    <source src="img/bg.mp3" type="audio/mpeg" />
                </audio>
                <Button onClick={this.toggleMusic}>
                    <div className={"bg-music " + this.state.bgState} />
                </Button>
                <LoadAssets
                    assets={
                        [
                            // {
                            //     uri: "img/example.jpg"
                            // }
                        ]
                    }
                >
                    <RouteHandler />
                </LoadAssets>
                <Loading />
            </div>
        );
    }
});

// 微信分享组件
var ConfigedWechatHandler = React.createClass({
    render: function() {
        return (
            <WechatHandler
                codeToOpenidAPI={config.codeToOpenidAPI}
                jssdkConfigAPI={config.jssdkConfigAPI}
                jsAPIList={config.jsAPIList}
                {...this.props}
            />
        );
    }
});

wechatActions.initJSSDKSettings.completed.listen(function() {
    wechatActions.setShareContent({
        title: config.shareTitle,
        link: config.shareLink,
        imgUrl: "img/share.jpg",
        desc: config.shareDesc
    });
});

// 设置路由
var routes = (
    <Route handler={App}>
        <Route handler={Start} path="" />
        <Route handler={ConfigedWechatHandler}>
            <DefaultRoute handler={Start} />
            <Route handler={Start} path="start" />
        </Route>
    </Route>
);

// 统计数据
$.ajax({ url: config.statisticsApi, type: "get" });

// 挂载router
routerContainer.set(Router.create(routes));

Router.run(routes, Router.HashLocation, function(Root) {
    React.render(<Root />, document.getElementById("app"));
});

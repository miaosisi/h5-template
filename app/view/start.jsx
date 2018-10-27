"use strict";
var reflux = require("reflux");
var React = require("react");
var Navigation = require("react-router").Navigation;
var $ = require("jquery");
var Button = require("../component/button.jsx");
var weChat = require("react-wechat");
var wechatStores = weChat.stores;

var Start = React.createClass({
    mixins: [
        Navigation,
        reflux.connect(
            wechatStores.OpenIdStore,
            "openid"
        )
    ],

    navToNext: function() {
        // this.transitionTo("/question");
    },

    componentDidMount: function() {},

    render: function() {
        return (
            <div className="start-bg">
                {/* <Button
                    id="start-btn"
                    className="start-btn"
                    onClick={this.navToNext}
                >
                    <img src="img/btn_start.png" />
                </Button> */}
                start
            </div>
        );
    }
});

module.exports = Start;

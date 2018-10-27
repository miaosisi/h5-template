var React = require('react');
var LoadAssets = React.createClass({
    getInitialState: function () {
      // 'loaded' state by default is false
      return {
          loaded: false,
          progress: 0,
          allLoaded: false,
        };
    },

    componentDidMount: function () {
      var
        _self = this,
        totalAssets = this.props.assets.length,
        loadedAssets = 0
      ;

      // Start loading all the assets
      Array.prototype.forEach.call(this.props.assets, function(asset) {
        _self.loadAsset(asset.uri, function(e) {
          loadedAssets++;
          var percentage = Math.ceil(loadedAssets*100/totalAssets);
          _self.setState({progress: percentage});
          if (loadedAssets == totalAssets) {
            // when all the assets are loaded set state 'loaded' to true
            _self.setState({loaded: true});

            // when all the assets are loaded call the callback function if any
            if (typeof(_self.props.onLoad) === "function") _self.props.onLoad();
          }
        });
      });

    },

    loadAsset: function(uri, callback) {
      // preload if asset is image
      if (uri.toLowerCase().match("jpg|jpeg|gif|png|webp") !== null) {
        var image = new Image();
        image.src = uri;
        image.onload = callback;
      }

      // preload if asset is video
      if (uri.toLowerCase().match("mp4|webm|ogv") !== null) {
        var videoRequest = new XMLHttpRequest;
        videoRequest.open("GET", uri, !0);
        videoRequest.responseType = "blob";
        videoRequest.onload = function(){
            if (this.status === 200 && this.response.type === "video/mp4") {
                callback();
            }
        };
        videoRequest.onerror = function(e){
            console.log(e);
        };
        videoRequest.send();
      }
    },

    render: function() {
      var output = [];

      if (!this.state.loaded) {
        // asset not loaded yet - loading UI
        output.push(
            <div className="loading">
                <div className="suntory-logo"></div>
                <div>
                    <div className="loading-progress">{this.state.progress}%</div>
                </div>
            </div>
        );
        return (<div className="wrapper">{output}</div>);
      } else {
        return (<div className="wrapper">{this.props.children}</div>);
      }
    }
  });

  module.exports = LoadAssets;
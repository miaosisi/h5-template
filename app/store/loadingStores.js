var reflux = require('reflux');
var loadingActions = require('../action/loadingActions.js');

var loadingStateStore = reflux.createStore({
    init: function(){
        this.listenTo(loadingActions.showLoading, this.onShowLoading);
        this.listenTo(loadingActions.hideLoading, this.onHideLoading);
    },

    onShowLoading: function(){
        this.trigger(true);
    },

    onHideLoading: function(){
        this.trigger(false);
    },
});


module.exports = {
    loadingStateStore: loadingStateStore
}

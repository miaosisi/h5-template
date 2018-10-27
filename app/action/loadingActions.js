'use strict';

var reflux = require('reflux');
var networkActions = require('./networkActions.js');
var loadingActions = reflux.createActions({
    showLoading: {},
    hideLoading: {},
});


networkActions.request.listen( loadingActions.showLoading );
networkActions.request.completed.listen( loadingActions.hideLoading );
networkActions.request.failed.listen( function(data){
    loadingActions.hideLoading();
    var rText = '网络错误，请稍后再试';
    if (data && data.indexOf('uwsgi')<0 ) {
        try{
            rText = JSON.parse(data).error;
        }catch(e){
            rText = data;
        }
    }
    console.log(rText);
});


module.exports = loadingActions;

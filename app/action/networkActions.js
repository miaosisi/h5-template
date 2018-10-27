'use strict';

var Reflux = require('reflux');
var Actions = Reflux.createActions({
    request: { asyncResult: true },
    get: {  },
    post: {  },
    put: {  },
    patch: {  },
    delete: {  }
});
var $ = require('jquery');
var store = require('store2');


var BASE_URL = 'http://121.40.119.29:9100/';
//var BASE_URL = 'http://192.168.0.106:8000/';


var getToken = function(){
    var s = store.get('session', null);
    if (s){
        return { token: s };
    } else{
        return {};
    }
};

Reflux.ActionMethods.getToken = getToken;

var retryTimes = 0;

Actions.request.listen( function(uri, data, method, callback, fallback){
    var options = {
        url: BASE_URL+uri,
        type: method,
        headers: getToken(),
        dataType: 'json',
        success: function(_data){
            var msg = '';
            var error = false;
            if (_data.errcode){
                msg = _data.errmsg || _data.errmessage;
                error = true;
            }
            if (_data.errorCode){
                msg = _data.errorMsg;
                error = true;
            }
            console.log(_data);
            if (error){
                if(fallback==null || !fallback(msg)){
                    Actions.request.failed(msg);
                }
            }else{
                callback && callback(_data);
                Actions.request.completed(_data);
            }
        },
        error: function(xhr){
            var msg = xhr.responseText;
            if(fallback===null || !fallback(msg)){
                Actions.request.failed(msg);
            }
        },
    };

    if(data){
        options.data = data;
    };

    $.ajax(options);
});

Actions.get.listen ( function(url, data, callback, fallback){
    if (data){
        var _d = $.param(data);
        Actions.request(url+'?'+_d, '', 'get', callback, fallback);
    }else{
        Actions.request(url, null, 'get', callback, fallback);
    }
});

Actions.post.listen( function(url, data, callback, fallback){
    Actions.request(url, data, 'post', callback, fallback);
});

Actions.put.listen( function(url, data, callback, fallback){
    Actions.request(url, data, 'put', callback, fallback);
});

Actions.patch.listen( function(url, data, callback, fallback){
    Actions.request(url, data, 'patch', callback, fallback);
});

Actions.delete.listen( function(url, data, callback, fallback){
    Actions.request(url, data, 'delete', callback, fallback);
});


module.exports = Actions;

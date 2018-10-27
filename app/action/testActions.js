'use strict';

var reflux = require('reflux');
var testActions = reflux.createActions({
    changeText: {},
});

testActions.changeText.listen(function(){console.log('triggered')});

module.exports = testActions;

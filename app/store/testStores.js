var reflux = require('reflux');
var testActions = require('../action/testActions.js');

var testStateStore = reflux.createStore({
    init: function(){

        this.listenTo(testActions.changeText, this.changeText);


    },

    changeText: function(vcd){
        console.log('321');
        this.trigger('balabala');
    },


});


module.exports = {
    testStateStore: testStateStore
}

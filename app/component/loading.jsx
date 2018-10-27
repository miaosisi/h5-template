'use strict';

var React = require('react');
var reflux = require('reflux');
var loadingStateStore = require('../store/loadingStores.js').loadingStateStore;

var Loading = React.createClass({
    mixins: [
        reflux.connect(loadingStateStore, 'showLoading'),
    ],

    getInitialState: function(){
        return {
            showLoading: false,
        };
    },

    render: function(){
        return <div className='loading-wrapper' style={{
            display: this.state.showLoading? 'block': 'none'
        }}>
            <div className='loading'>
                <div className='loading-gif'/>
                <p>载入中</p>
            </div>
        </div>;
    }
});


module.exports = Loading;

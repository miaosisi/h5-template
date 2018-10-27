'use strict';

var React = require('react');
var classnames = require('classnames');

var Button = React.createClass({
    getDefaultProps: function(){
        return {
            onClick: null,
            disabled: false
        };
    },

    render: function(){
        return <div className={classnames('btn-wrapper ' + this.props.className, {
            'disabled': this.props.disabled
        })} style={this.props.style}>
            <a className='btn' href='javascript:void(0)' onClick={this.props.onClick}>
                {this.props.children}
            </a>
        </div>;
    }
});


module.exports = Button;

/**
 * @jsx React.DOM
 */

var React = require('react');
var mapper = require('../../../lib/mapper');

var map; 
module.exports = React.createClass({displayName: 'exports',
    componentDidMount: function(){
        map = mapper('map');
        var query = queryBuilder.makeIDBQuery(this.props.search);
        map.query(query)
    },
    shouldComponentUpdate: function(){
        return false;
    },
    componentWillReceiveProps: function(nextProps){
        var query = queryBuilder.makeIDBQuery(nextProps.search);
        map.query(query)
    },
    render: function(){
        return (
            React.DOM.div({id: "map"}

            )
        )
    }
})
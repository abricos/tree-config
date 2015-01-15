/**
 * @author Alexander Kuzmin <roosit@abricos.org>
 * @module Config
 * @requires ConfigNode
 * @requires Container
 */

'use strict';

var ConfigNode = require('./lib/ConfigNode');
var Container = require('./lib/Container');
var Default = require('./lib/Default');

module.exports = {

    /**
     * @private
     */
    _container: null,

    /**
     *
     * @param [key] {String}
     * @param [options] {Object}
     * @returns {ConfigNode}
     */
    instance: function(key, options){
        if (!this._container){
            this._container = new Container();
        }
        return this._container.instance(key, options);
    },

    /**
     * @returns {Container}
     */
    clear: function(){
        this._container = new Container();
    },

    /**
     * @type {ConfigNode}
     */
    ConfigNode: ConfigNode,

    /**
     * Default options
     * @type {Default}
     */
    Default: Default
};


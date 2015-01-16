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
var utils = require('./lib/utils');

module.exports = {

    /**
     * @private
     */
    _container: new Container(),

    /**
     *
     * @param [key] {String}
     * @param [options] {Object}
     * @returns {ConfigNode}
     */
    instance: function(key, options){
        return this._container.instance(key, options);
    },

    /**
     * @returns {Container}
     */
    clean: function(){
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
    Default: Default,

    /**
     * @type {utils}
     */
    utils: utils
};


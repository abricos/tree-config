/**
 * @author Alexander Kuzmin <roosit@abricos.org>
 * @module Config
 * @requires ConfigNode
 * @requires Container
 */

'use strict';

var merge = require('merge');

var ConfigNode = require('./lib/ConfigNode');
var Container = require('./lib/Container');
var utils = require('./lib/utils');

/**
 *
 * @type {{CONFIG_FILE: string, OVERRIDE_CONFIG_FILE: string, IMPORTS: Array}}
 * @private
 */
var _APP_CONFIG = {

    /**
     * @type {string}
     */
    CONFIG_FILE: '',

    /**
     * @type {string}
     */
    OVERRIDE_CONFIG_FILE: '',

    /**
     * @type {Array}
     */
    IMPORTS: [],

    /**
     * @type {Object}
     */
    ROOT_OPTIONS: {}
};

module.exports = {

    /**
     * @private
     */
    _appConfig: _APP_CONFIG,

    /**
     * @private
     */
    _container: null,

    /**
     *
     * @param appConfig {Object}
     */
    configure: function(appConfig){
        this._appConfig = merge.recursive(true, _APP_CONFIG, appConfig)
        this.clean();
    },

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
        this._container = new Container(this._appConfig);
    },

    /**
     * @type {ConfigNode}
     */
    ConfigNode: ConfigNode,

    /**
     * @type {utils}
     */
    utils: utils
};


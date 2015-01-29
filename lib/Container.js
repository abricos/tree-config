/**
 * @author Alexander Kuzmin <roosit@abricos.org>
 * @module Container
 */

'use strict';

var ConfigNode = require('./ConfigNode');
var utils = require('./utils');

var merge = require('merge');

var util = require('util');

/**
 *
 * @constructor
 */
var Container = function(appConfig){

    /**
     * @type {Object}
     * @private
     */
    this._appConfig = appConfig;

    /**
     *
     * @type {Config}
     * @private
     */
    this._rootConfig = null;
};

/**
 *
 * @param [key] {string}
 * @param [options] {Object|Array}
 * @returns {ConfigNode}
 */
Container.prototype.instance = function(key, options){
    if (key && (typeof key !== 'string') && !options){
        options = key;
        key = null;
    }

    if (util.isArray(options)){
        var newOptions = {};
        for (var i = 0; i < options.length; i++){
            newOptions = merge.recursive(true, newOptions, options[i] || {});
        }
        options = newOptions;
    }

    if (!key && options){
        key = options.id || utils.genid();
        if (typeof options.parentId === 'string'){
            key = [options.parentId, key].join('.');
        }
    }

    if (!this._rootConfig){
        this._rootConfig = {
            instance: new ConfigNode('_root_', null, {}, this._appConfig),
            childs: {}
        }
    }
    var rootConfig = this._rootConfig;

    if (!key){
        return rootConfig.instance;
    }

    var aKey = key.split('.'), iKey,
        current = rootConfig, parent;

    for (var i = 0; i < aKey.length; i++){
        iKey = aKey[i];
        if (iKey === '_root_'){
            current = rootConfig;
            continue;
        }
        parent = current;
        current = parent.childs[iKey];

        if (!current){
            if (i < (aKey.length - 1)){
                throw new Error('Defective structure configs: ' + key);
            } else {
                parent.childs[iKey] = current = {
                    instance: new ConfigNode(key, parent.instance, options, this._appConfig),
                    childs: {}
                };
            }
        }
    }
    return current.instance;
};

module.exports = Container;
/**
 * @author Alexander Kuzmin <roosit@abricos.org>
 * @module Container
 */

'use strict';

var ConfigNode = require('./ConfigNode');
var utils = require('./utils');

/**
 *
 * @constructor
 */
var Container = function(){

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
 * @param [options] {object}
 * @returns {ConfigNode}
 */
Container.prototype.instance = function(key, options){
    if (typeof key === 'object' && !options){
        options = key;
        key = options.id || utils.genid();
        if (typeof options.parentId === 'string'){
            key = [options.parentId, key].join('.');
        }
    }
    if (!this._rootConfig){
        this._rootConfig = {
            instance: new ConfigNode(),
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
        parent = current;
        current = parent.childs[iKey];

        if (!current){
            if (i < (aKey.length - 1)){
                throw new Error('Defective structure configs: ' + key);
            } else {
                parent.childs[iKey] = current = {
                    instance: new Config(key, parent.instance, options),
                    childs: {}
                };
            }
        }
    }
    return current.instance;
};

module.exports = Container;
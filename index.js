/**
 * @author Alexander Kuzmin <roosit@abricos.org>
 * @module TreeConfig
 */

'use strict';

var ConfigNode = require('./lib/ConfigNode');
var SourceManager = require('./lib/SourceManager');

var TreeConfig = module.exports = new ConfigNode('_root_', null);



return; // TODO: ********************* remove ****************

var merge = require('merge');
var util = require('util');

var utils = require('./lib/utils');
var keyManager = require('./lib/keyManager');


/**
 * @private
 */
TreeConfig._rootNode = null;

TreeConfig._rootNodeSettings = null;

/**
 *
 * @param appConfig {Object}
 * @returns {ConfigNode}
 */
TreeConfig.configure = function(settings){
    this._rootNodeSettings = settings;
    return this.clean();
};

/**
 * @returns {ConfigNode}
 */
TreeConfig.clean = function(){
    this._rootNode = new ConfigNode('_root_', null, {}, this._rootNodeSettings);

    return this._rootNode;
};

/**
 *
 * @param {String} [key]
 * @param {Object|[]} [options]
 */
TreeConfig.createNode = function(key, options, appConfig){
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

    if (!this._rootNode){
        this.clean();
    }

    var childConfig = this._rootNode.getChildConfig(key);
    if (childConfig){
        throw new Error('Config Node is created (' + key + ')');
    }

    var parentNode = this._rootNode;

    var pKey = keyManager.parent(key);
    if (pKey){
        parentNode = this._rootNode.getChildConfig(pKey);
    }

    var id = keyManager.last(key);

    childConfig = new ConfigNode(id, parentNode, options, appConfig || this._appConfig);

    parentNode.addChildConfig(childConfig);

    return childConfig;
};

/**
 *
 * @param key
 * @returns {*}
 */
TreeConfig.getNode = function(key){
    if (!key){
        return this._rootNode;
    }
    return this._rootNode.getChildConfig(key);
};

/**
 *
 * @param key
 * @param options
 * @returns {*}
 */
TreeConfig.get = function(key, options){
    options = options || {};
    var configNode = this._rootNode;
    if (options.id){
        configNode = this.getNode(options.id);
        if (!configNode){
            throw new Error('Config node `' + options.id + '` not found');
        }
    }
    return configNode.get(key, options);
};


/**
 * @type {ConfigNode}
 */
TreeConfig.ConfigNode = ConfigNode;

/**
 * @type {utils}
 */
TreeConfig.utils = utils;

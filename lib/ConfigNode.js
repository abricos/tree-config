/**
 * @module ConfigNode
 */

'use strict';

var merge = require('merge');

var PluginManager = require('./PluginManager');
var SourceManager = require('./SourceManager');
var ConfigNodeList = require('./ConfigNodeList');
var keyManager = require('./keyManager');

var ConfigNode = function(id, parent, settings){

    this.id = id;
    this.parent = parent;

    this.children = new ConfigNodeList(this);
    this.plugins = new PluginManager(this);
    this.sourceManager = new SourceManager();

    this.clean();

    if (settings){
        this.configure(settings);
    }
};

ConfigNode.prototype.clean = function(){
    this._sourceData = {};
    this._compileData = {};
    this.sourceManager.clean();
    this.children.clean();
};

ConfigNode.prototype.configure = function(options){
    options = options || {};

    var sourceManager = this.sourceManager;

    if (options.sources){
        sourceManager.add(options.sources);
    }
    if (options.orderSources){
        sourceManager.sort(options.orderSources);
    }
};

ConfigNode.prototype.setDefaults = function(options){
    this.sourceManager.add({
        id: 'defaults',
        type: 'object',
        data: options
    });
};

ConfigNode.prototype.init = function(options){
    this.sourceManager.add({
        id: 'init',
        type: 'object',
        data: options
    });
};

ConfigNode.prototype.set = function(key, value){
    this.sourceManager.add({
        id: 'setter',
        type: 'setter',
        key: key,
        value: value
    });
};

ConfigNode.prototype.compile = function(){
    if (this.sourceManager.isLoaded()){
        return;
    }

    this._sourceData = this.sourceManager.load();
    this._compileData = this._sourceData;
    this._compileData = this._compile(this._sourceData);
};

ConfigNode.prototype._compile = function(ret){
    if (typeof ret === 'object'){
        for (var n in ret){
            ret[n] = this._compile(ret[n]);
        }
        return ret;
    }

    if (typeof ret !== 'string'){
        return ret;
    }

    var regexp = /\<\%=(.*?)\%\>/,
        a, val;

    do {
        a = regexp.exec(ret);
        if (!a){
            break;
        }
        val = a[1];
        val = this.get(val) || '';
        ret = ret.replace(regexp, val);
    } while (a);

    return ret;
};

ConfigNode.prototype.getFrom = function(key, nodeKey, options){
    options = options || {};
    delete options.from;

    var childNode = this.children.get(nodeKey);
    if (!childNode){
        return options.default;
    }
    return childNode.get(key, options);
};

ConfigNode.prototype.getFromParent = function(key, options){
    if (!this.parent){
        this.plugins.get('logger').error('can`t get value for a higher level: ' + key);
        return;
    }

    return this.parent.get(key, options);
};

ConfigNode.prototype.getFromRoot = function(key, options){
    var rootNode = this.getRootNode();

    return rootNode.get(key, options);
};

ConfigNode.prototype.getRecursive = function(key, options){
    options = options||{};
    delete options.recursive;

    var config = this, arr = [];
    while (config){
        arr[arr.length] = config;
        config = config.parent;
    }

    var ret = {}, value;
    while (arr.length > 0){
        config = arr.pop();
        value = config.get(key, {
            onlyThis: true
        }) || {};
        ret = merge.recursive(true, ret, value)
    }

    return ret;
};

ConfigNode.prototype.get = function(key, options){
    this.compile();

    options = options || {};
    options.onlyThis = options.onlyThis || false;
    options.recursive = options.recursive || false;

    if (options.from){
        return this.getFrom(key, options.from, options);
    }

    if (options.recursive){
        return this.getRecursive(key, options);
    }

    var aKey = keyManager.split(key),
        ret,
        iKey;

    if (aKey[0] === ''){
        return;
    } else if (aKey[0] === '^^'){
        var pKey = keyManager.shift(key);
        return this.getFromRoot(pKey, options);
    } else if (aKey[0] === '^'){
        var pKey = keyManager.shift(key);
        return this.getFromParent(pKey, options);
    }

    for (var i = 0; i < aKey.length; i++){
        iKey = aKey[i];
        if (i === 0){
            ret = this._compileData;
        }
        if (!ret[iKey]){
            if (this.parent){
                if (options.onlyThis){
                    return options.default;
                }
                return this.parent.get(key, options);
            }
            if (typeof options.default === 'undefined'){
                this.plugins.get('logger').warn('value not set in config, key %s, id %s', key, this.id);
            }
            return options.default;
        } else {
            ret = ret[iKey];
        }
    }

    return ret;
};

ConfigNode.prototype.getNode = function(key){
    return this.children.get(key);
};

ConfigNode.prototype.getRootNode = function(){
    var config = this;
    while (config.parent){
        config = config.parent;
    }
    return config;
};

module.exports = ConfigNode;
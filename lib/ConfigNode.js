/**
 * @author Alexander Kuzmin <roosit@abricos.org>
 * @module ConfigNode
 */

'use strict';

var SourceManager = require('./SourceManager');
var keyManager = require('./keyManager');

var ConfigNode = function(id, parent){

    this.id = id;
    this.parent = parent;

    this._sourceManager = new SourceManager();

    this.clean();
};

ConfigNode.prototype.clean = function(){
    this._sourceData = {};
    this._compileData = {};
    this._sourceManager.clean();
};

ConfigNode.prototype.configure = function(options){
    options = options || {};

    var sourceManager = this._sourceManager;

    if (options.sources){
        sourceManager.add(options.sources);
    }
    if (options.orderSources){
        sourceManager.sort(options.orderSources);
    }
};

ConfigNode.prototype.setDefaults = function(options){
    this._sourceManager.add({
        id: 'defaults',
        type: 'object',
        data: options
    });
};

ConfigNode.prototype.init = function(options){
    this._sourceManager.add({
        id: 'init',
        type: 'object',
        data: options
    });
};

ConfigNode.prototype.set = function(key, value){
    this._sourceManager.add({
        id: 'setter',
        type: 'setter',
        key: key,
        value: value
    });
};

ConfigNode.prototype.compile = function(){
    if (this._sourceManager.isLoaded()){
        return;
    }

    this._sourceData = this._sourceManager.load();
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

ConfigNode.prototype.get = function(key, options){
    this.compile();

    options = options || {};
    options.onlyThis = options.onlyThis || false;

    var aKey = keyManager.split(key),
        ret,
        iKey;

    if (aKey[0] === ''){
        return;
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
                //this.logger().warn('value not set in config, key %s, id %s', helper.string(key), helper.string(this.id));
            }
            return options.default;
        } else {
            ret = ret[iKey];
        }
    }

    return ret;
};

module.exports = ConfigNode;
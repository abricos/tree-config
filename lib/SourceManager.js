/**
 * @module SourceManager
 */

'use strict';

var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var util = require("util");
var merge = require('merge');

var keyManager = require('./keyManager');

var SourceManager = module.exports = function(){
    this.clean();
};

SourceManager.prototype.clean = function(){
    this._orders = {
        defaults: -1000,
        init: -100,
        setter: 1000
    };
    this._isLoaded = false;
    this._sources = [];
    this._loadedData = {};
};

SourceManager.prototype.isLoaded = function(){
    return this._isLoaded;
};

SourceManager.prototype.get = function(id){
    var sources = this._sources;

    for (var i = 0; i < sources.length; i++){
        if (sources[i].id === id){
            return sources[i];
        }
    }
};

SourceManager.prototype.sort = function(options){
    this._isLoaded = false;
    if (options){
        for (var n in options){
            this._orders[n] = options[n];
        }
    }

    var orders = this._orders,
        sources = this._sources;

    var id;
    for (var i = 0; i < sources.length; i++){
        id = sources[i].id;
        sources[i].order = typeof orders[id] !== 'undefined' ? orders[id] : 0;
    }

    this._sources = sources.sort(function(item1, item2){
        if (item1.order > item2.order){
            return 1;
        } else if (item1.order < item2.order){
            return -1;
        }
        return 0;
    });
};

SourceManager.prototype.add = function(sourceData){
    this._isLoaded = false;

    if (Array.isArray(sourceData)){
        for (var i = 0; i < sourceData.length; i++){
            this.add(sourceData[i]);
        }
        return;
    }

    if (typeof sourceData !== 'object'){
        throw new Error('Config sourceData must be Object');
    }

    if (!sourceData.type
        || typeof sourceData.type !== 'string'){
        throw new Error('Config sourceData `type` field must be String');
    }

    var sourceClass = SourceManager._sourceClasses[sourceData.type];
    if (!sourceClass){
        throw new Error('SourceData class `' + sourceData.type + '` must be registered');
    }

    if (typeof sourceClass.normalizeOptions === 'function'){
        sourceData = sourceClass.normalizeOptions(sourceData);
    }

    if (!sourceData.id
        || typeof sourceData.id !== 'string'){
        throw new Error('Config sourceData `id` field must be String');
    }

    var source = this.get(sourceData.id);
    if (!source){
        source = new sourceClass(sourceData);
        this._sources.push(source);
        this.sort();
    } else {
        source.setOptions(sourceData);
    }
    return source;
};

SourceManager.prototype.load = function(){
    if (this._isLoaded){
        return this._loadedData;
    }
    this._isLoaded = true;

    var sources = this._sources,
        sourceData,
        data = {};

    for (var i = 0; i < sources.length; i++){
        sourceData = sources[i].load();
        data = merge.recursive(true, data, sourceData);
    }

    keyManager.extractDotFields(data);

    return this._loadedData = data;
};

SourceManager._sourceClasses = {};

SourceManager.register = function(type, sourceClass){
    SourceManager._sourceClasses[type] = sourceClass;
};

var Source = function(options){
    options = options || {};
    this.id = options.id;
    this.order = 0;
    this.setOptions(options);
};

SourceManager.Source = Source;

Source.prototype.setOptions = function(options){
};

Source.prototype.load = function(){
    return {};
};

var ObjectSource = function(options){
    Source.call(this, options);
};

util.inherits(ObjectSource, Source);

ObjectSource.prototype.setOptions = function(options){
    this._data = options.data || {};
};

ObjectSource.prototype.load = function(){
    return this._data;
};

var JSONSource = function(options){
    options = options || {};
    if (options)
        Source.call(this, options);
};

util.inherits(JSONSource, Source);

JSONSource.normalizeOptions = function(options){
    options = options || {};

    if (!options.id){
        options.id = path.basename(options.src);
    }

    return options;
};

JSONSource.prototype.setOptions = function(options){
    this.cwd = options.cwd || process.cwd();
    this.src = options.src;
    this.key = options.key;
};

JSONSource.prototype.load = function(){
    var data = {};

    var file = path.resolve(this.cwd, this.src);

    if (!fs.existsSync(file)
        || fs.lstatSync(file).isDirectory()){
        return data;
    }

    var json = {};
    try {
        json = fse.readJSONSync(file);
    } catch (e) {
        throw new Error('Read JSON `' + file + '`: ' + e.message);
    }

    if (this.key){
        var aKey = keyManager.split(this.key);
        if (aKey.length > 0){
            var current = data;
            for (var i = 0; i < aKey.length; i++){
                if (i === (aKey.length - 1)){
                    current[aKey[i]] = json;
                } else {
                    current = current[aKey[i]] = {};
                }
            }
        } else {
            data = json;
        }
    } else {
        data = json;
    }

    return data;
};

var SetterSource = function(options){
    this._data = {};
    Source.call(this, options);
};

util.inherits(SetterSource, Source);

SetterSource.prototype.setOptions = function(options){
    var key = options.key,
        value = options.value;

    var aKey = keyManager.split(key),
        data = this._data,
        iKey;

    for (var i = 0; i < aKey.length; i++){
        iKey = aKey[i];
        if (i === (aKey.length - 1)){
            data[iKey] = value;
            break;
        }
        if (!data[iKey]){
            data[iKey] = {};
        }
        data = data[iKey];
    }

};

SetterSource.prototype.load = function(){
    return this._data;
};

SourceManager.register('object', ObjectSource);
SourceManager.register('json', JSONSource);
SourceManager.register('setter', SetterSource);

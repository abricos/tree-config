/*
 * Copyright (c) 2014 Alexander Kuzmin <roosit@abricos.org>
 * Licensed under the MIT license.
 * https://github.com/abricos/tree-config/blob/master/LICENSE
 */

'use strict';

var merge = require('merge');
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var winston = require('winston');
var dateFormat = require('dateformat');
var chalk = require('chalk');

var logHelper = require('./loghelper');

var UTF8 = 'utf-8';

var _dotFields = {},
    _dotRegExp = /\./g,
    _DOTR = '__DOT__';

var _findDotFields = function(options){
    if (typeof options !== 'object'){
        return options;
    }
    for (var n in options){
        if (_dotRegExp.test(n)){
            _dotFields[n] = n.replace(_dotRegExp, _DOTR);
        }
        _findDotFields(options[n]);
    }
};

if (!module.exports._cacheConfigSplitKey){
    module.exports._cacheConfigSplitKey = {};
}
var _cacheSplitKey = module.exports._cacheConfigSplitKey;
var _splitKey = function(key){
    if (typeof key !== 'string'){
        throw new Error('Key in config must be String type');
    }

    if (_cacheSplitKey[key]){
        return _cacheSplitKey[key];
    }

    key = key.replace(/^\s+|\s+$/g, '');

    var keyOrig = key;
    var tKey;
    for (var n in _dotFields){
        do {
            tKey = key.replace(n, _dotFields[n]);
            if (tKey !== key){
                key = tKey;
            } else {
                break;
            }
        } while (true);
    }
    var a = key.split('.'), ret = [], ai;
    for (var i = 0; i < a.length; i++){
        ai = a[i];
        for (var n in _dotFields){
            if (ai === _dotFields[n]){
                ai = n;
                break;
            }
        }
        ret[ret.length] = ai;
    }
    _cacheSplitKey[keyOrig] = ret;
    return ret;
};

var Config = function(id, parent, options){
    this.id = id || "_root_";
    this.parent = parent;
    this._options = {};

    this.init(options);
};

Config.MY_CONFIG_FILE = "myconfig.json";

Config.ROOT_DEFAULT_OPTIONS = {
    directory: process.cwd(),
    log: {
        console: {
            level: 'info',
            colorize: 'true',
            timestamp: 'HH:MM:ss'
        }
    }
};

Config.prototype = {

    instance: function(key, config){
        return module.exports.instance(key, config);
    },

    merge: function(obj1, obj2){
        return merge.recursive(true, obj1, obj2);
    },

    init: function(options){
        options = options || {};

        _findDotFields(options);

        var root = this;
        while (root.parent){
            root = root.parent;
        }
        this.root = root === this ? null : root;

        var defOptions = !this.parent ? Config.ROOT_DEFAULT_OPTIONS : {};

        var directory = options.directory;
        if (!directory){
            directory = this.parent ?
                this.parent.get('directory') :
                Config.ROOT_DEFAULT_OPTIONS.directory;
        }

        var disableImport = this.get('disableImportFilesForChild', {
            default: false
        });
        if (directory && !disableImport){
            var imports = Config.IMPORTS,
                importItem,
                importFile, json, a, tObj;
            for (var i = 0; i < imports.length; i++){
                importItem = imports[i];
                importFile = path.join(directory, importItem.file);
                if (!fs.existsSync(importFile)){
                    continue;
                }
                try {
                    json = fse.readJSONFileSync(importFile, UTF8);
                } catch (e) {
                    var msg = 'Access denied or JSON syntax error in `' + importFile + '`';
                    throw new Error(msg);
                }
                _findDotFields(json);

                a = _splitKey(importItem.key);
                tObj = defOptions;
                for (var ii = 0; ii < a.length; ii++){
                    tObj[a[ii]] = tObj[a[ii]] || {};

                    if (ii === (a.length - 1)){
                        tObj[a[ii]] = json;
                    }
                }

            }
        }
        options = merge.recursive(true, defOptions, options);

        var configFileJSON = {};

        if (!disableImport
            && typeof Config.MY_CONFIG_FILE === 'string'
            && Config.MY_CONFIG_FILE.length > 0){

            var configFile = path.join(directory, Config.MY_CONFIG_FILE);

            if (fs.existsSync(configFile)){
                try {
                    configFileJSON = fse.readJSONFileSync(configFile);
                } catch (e) {
                    var msg = 'Access denied or JSON syntax error in `' + configFile + '`';
                    throw new Error(msg);
                }
                _findDotFields(configFileJSON);
            }
        }

        this._options = merge.recursive(true, options, configFileJSON);
        this._options = this.compile(this._options);

        this.logger().debug('initializing config');
    },
    compile: function(ret){
        if (typeof ret === 'object'){

            for (var n in ret){
                ret[n] = this.compile(ret[n]);
            }
            return ret;
        }

        if (typeof ret !== 'string'){
            return ret;
        }

        var regexp = /\<\%=(.*?)\%\>/,
            a,
            val;
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
    },
    get: function(key, options){
        options = options || {};
        options.onlyThis = options.onlyThis || false;

        var aKey = _splitKey(key),
            ret,
            iKey;

        if (aKey[0] === ''){
            return;
        } else if (aKey[0] === '^^'){
            if (!this.root){
                this.logger().error('can`t get value config for a root level: ' + key);
                return;
            }
            aKey.shift();
            return this.root.get(aKey.join('.'), options)
        } else if (aKey[0] === '^'){
            if (!this.parent){
                this.logger().error('can`t get value config for a higher level: ' + key);
                return;
            }
            aKey.shift();
            return this.parent.get(aKey.join('.'), options)
        }

        for (var i = 0; i < aKey.length; i++){
            iKey = aKey[i];
            if (i === 0){
                ret = this._options;
            }
            if (!ret[iKey]){
                if (this.parent){
                    if (options.onlyThis){
                        return options.default;
                    }
                    return this.parent.get(key, options);
                }
                if (typeof options.default === 'undefined'){
                    this.logger().warn('value not set in config, key %s, id %s', logHelper.string(key), logHelper.string(this.id));
                }
                return options.default;
            } else {
                ret = ret[iKey];
            }
        }

        return ret;
    },
    set: function(key, value){
        var aKey = _splitKey(key),
            config = this._options,
            iKey;

        for (var i = 0; i < aKey.length; i++){
            iKey = aKey[i];
            if (i === (aKey.length - 1)){
                config[iKey] = value;
            } else if (!config[iKey]){
                config[iKey] = {};
            } else {
                config = config[iKey];
            }
        }
    },

    getRecursive: function(key){
        var config = this, arr = [];
        while (config){
            arr[arr.length] = config;
            config = config.parent;
        }
        var ret = {};
        while (arr.length > 0){
            config = arr.pop();
            ret = merge.recursive(true, ret, config.get(key, {
                onlyThis: true
            }) || {})
        }

        return ret;
    },
    logger: function(){
        if (this._logger){
            return this._logger;
        }
        var logOptions = this.getRecursive('log');

        for (var n in logOptions){
            (function(transport){
                var format = transport.timestamp;
                if (typeof format !== 'string'){
                    return;
                }
                transport.timestamp = function(){
                    var str = dateFormat(new Date(), format);
                    if (transport.colorize === 'true'){
                        str = chalk.gray(str);
                        return str;
                    }
                    return str;
                };
            })(logOptions[n]);
        }

        winston.loggers.add(this.id, logOptions);

        return this._logger = winston.loggers.get(this.id);
    }
};

var ConfigManager = function(){
};
ConfigManager.prototype = {
    instance: function(key, options){
        if (typeof key === 'object' && !options){
            options = key;
            key = options.id || Config.genid();
            if (typeof options.parentId === 'string'){
                key = [options.parentId, key].join('.');
            }
        }
        if (!this._rootConfig){
            this._rootConfig = {
                instance: new Config(),
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
    }
};

var me = module.exports;

me.logHelper = logHelper;

me.instance = function(key, config){
    if (!this._manager){
        this._manager = new this.ConfigManager();
    }
    return this._manager.instance(key, config);
};
me.clear = function(){
    this._manager = new this.ConfigManager();
};
me.genid = function(prefix){
    if (!this._uniqueCounter){
        this._uniqueCounter = 0;
    }
    prefix = prefix || '';

    return prefix + (this._uniqueCounter++);
};
me.Config = Config;
me.ConfigManager = ConfigManager;

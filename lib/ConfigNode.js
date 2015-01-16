/**
 * @author Alexander Kuzmin <roosit@abricos.org>
 * @requires helper
 * @requires Default
 * @module ConfigNode
 */

'use strict';

var merge = require('merge');
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var winston = require('winston');
var dateFormat = require('dateformat');
var chalk = require('chalk');

var helper = require('./utils/helper');
var KeyManager = require('./KeyManager');

var UTF8 = 'utf-8';

var ROOT_OPTIONS = {
    directory: process.cwd(),
    log: {
        console: {
            level: 'info',
            colorize: 'true',
            timestamp: 'HH:MM:ss'
        }
    },
    disableImportFilesForChild: false
};

/**
 * @class
 * @param id
 * @param parent {ConfigNode}
 * @param options {Object}
 * @param appConfig {Object}
 * @constructor
 */
var ConfigNode = function(id, parent, options, appConfig){

    /**
     * Id by which an config is identified
     * @type {*|string}
     */
    this.id = id || "_root_";

    this._appConfig = appConfig;

    /**
     *
     * @type {Object}
     * @private
     */
    this._options = {};

    /**
     * @type {ConfigNode}
     */
    this.root = null;

    /**
     *
     * @type {ConfigNode}
     */
    this.parent = parent;

    /**
     *
     * @type {KeyManager}
     */
    this.keyManager = new KeyManager();

    /**
     *
     * @type {Config}
     */
    this.treeConfig = require('../index');

    this.init(options);
};

ConfigNode.prototype = {

    /**
     *
     * @param key
     * @param config
     * @returns {ConfigNode}
     */
    instance: function(key, config){
        return this.treeConfig.instance(key, config);
    },

    /**
     *
     * @private
     */
    _setRoot: function(){
        var root = this;
        while (root.parent){
            root = root.parent;
        }
        this.root = root === this ? null : root;
    },

    /**
     * This Config Node is root
     * @returns {boolean}
     */
    isRoot: function(){
        return this.parent === null;
    },

    /**
     *
     * @param cwd {string}
     * @param fileName {string}
     * @returns {Object|undefined}
     * @private
     */
    _configImport: function(cwd, fileName){
        var fileName = fileName || '';

        if (typeof fileName !== 'string'
            || fileName.length === 0){
            return;
        }

        var json = {};
        var configFile = path.join(cwd, fileName);

        if (fs.existsSync(configFile)){
            try {
                json = fse.readJSONFileSync(configFile);
            } catch (e) {
                var msg = 'Access denied or JSON syntax error in `' + configFile + '`';
                throw new Error(msg);
            }
            this.keyManager.extractDotFields(json);
        }

        return json;
    },

    /**
     *
     * @param cwd {string}
     * @private
     */
    _imports: function(cwd){

        // get value from parent config node
        var disableImport = this.get('disableImportFilesForChild', {
            default: false
        });

        if (!cwd || disableImport){
            return;
        }

        var imports = this._appConfig.IMPORTS || [],
            importItem,
            json, a,
            tObj = {};

        for (var i = 0; i < imports.length; i++){
            importItem = imports[i];
            json = this._configImport(cwd, importItem.file)

            a = this.keyManager.split(importItem.key);
            for (var ii = 0; ii < a.length; ii++){
                tObj[a[ii]] = tObj[a[ii]] || {};

                if (ii === (a.length - 1)){
                    tObj[a[ii]] = json;
                }
            }
        }
        return tObj;
    },

    /**
     *
     * @param cwd {string}
     * @returns {Object|undefined}
     * @private
     */
    _overrideImport: function(cwd){
        // get value from parent config node
        var disableImport = this.get('disableImportFilesForChild', {
            default: false
        });

        var overrideConfigFile = this._appConfig.OVERRIDE_CONFIG_FILE || '';

        if (disableImport
            || typeof overrideConfigFile !== 'string'
            || overrideConfigFile.length === 0
        ){
            return;
        }

        return this._configImport(cwd, this._appConfig.OVERRIDE_CONFIG_FILE);
    },

    /**
     *
     * @param [options] {Object}
     */
    init: function(options){
        options = options || {};

        this.keyManager.extractDotFields(options);

        this._setRoot();

        if (this.isRoot()){
            options = merge.recursive(true, ROOT_OPTIONS, this._appConfig.ROOT_OPTIONS, options);
        }
        var cwd = options.directory;

        if (!cwd && !this.isRoot()){
            cwd = this.parent.get('directory');
        }

        var json = this._configImport(cwd, this._appConfig.CONFIG_FILE);
        options = merge.recursive(true, json, options);

        json = this._imports(cwd) || {};
        options = merge.recursive(true, json, options);

        json = this._overrideImport(cwd) || {};
        this._options = merge.recursive(true, options, json);

        this._options = this.compile(this._options);

        this.logger().debug('initializing config');
    },

    /**
     *
     * @param ret
     * @returns {*}
     */
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

    /**
     *
     * @param key {string}
     * @param [options] {Object}
     * @returns {*}
     */
    get: function(key, options){
        options = options || {};
        options.onlyThis = options.onlyThis || false;

        var aKey = this.keyManager.split(key),
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
            return this.root.get(aKey.join('.'), options);
        } else if (aKey[0] === '^'){
            if (!this.parent){
                this.logger().error('can`t get value config for a higher level: ' + key);
                return;
            }
            aKey.shift();
            ret = this.parent.get(aKey.join('.'), options);
            return ret;
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
                    this.logger().warn('value not set in config, key %s, id %s', helper.string(key), helper.string(this.id));
                }
                return options.default;
            } else {
                ret = ret[iKey];
            }
        }

        return ret;
    },

    /**
     *
     * @param key {string}
     * @param value {*}
     */
    set: function(key, value){
        var aKey = this.keyManager.split(key),
            options = this._options,
            iKey;

        if (aKey.length > 0 && aKey[0] === 'log'){
            this._logger = null;
        }

        for (var i = 0; i < aKey.length; i++){
            iKey = aKey[i];
            if (i === (aKey.length - 1)){
                options[iKey] = value;
                break;
            }
            if (!options[iKey]){
                options[iKey] = {};
            }
            options = options[iKey];
        }
    },

    /**
     *
     * @param key {string}
     * @returns {*}
     */
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

    /**
     *
     * @returns {Winston.Logger}
     */
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

        var logId = this.id + (new Date()).getTime();
        this._logger = winston.loggers.add(logId, logOptions);

        return this._logger;
    }
};

module.exports = ConfigNode;
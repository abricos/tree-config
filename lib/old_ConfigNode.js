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
var keyManager = require('./KeyManager');

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
 * @param settings {Object}
 * @constructor
 */
var ConfigNode = function(id, parent, options, settings){

    /**
     * Id by which an config is identified
     * @type {*|string}
     */
    this.id = id || "_root_";

    this._settings = settings;

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
     * @type {Config}
     */
    this.treeConfig = require('../index');

    this.init(options);

    this._childNodes = {};
};

ConfigNode.prototype.addChildConfig = function(childConfig){
    this._childNodes[childConfig.id] = childConfig;
};

ConfigNode.prototype.getChildConfig = function(key){
    var aKey = keyManager.split(key);

    if (!aKey || aKey.length === 0){
        return;
    }

    var node = this._childNodes[aKey[0]];

    if (!node){
        if (aKey.length === 1){
            return;
        }
        throw new Error('Defective structure configs: ' + key);
    }
    if (aKey.length === 1){
        return node;
    }

    aKey = aKey.unshift();

    return node.getChildConfig(aKey.join('.'));
};

/**
 *
 * @private
 */
ConfigNode.prototype._setRoot = function(){
    var root = this;
    while (root.parent){
        root = root.parent;
    }
    this.root = root === this ? null : root;
};

/**
 * This Config Node is root
 * @returns {boolean}
 */
ConfigNode.prototype.isRoot = function(){
    return this.parent === null;
};

/**
 *
 * @param file {string}
 * @returns {Object|undefined}
 * @private
 */
ConfigNode.prototype._configImport = function(file){

    if (!file || typeof file !== 'string'
        || file.length === 0
        || !fs.existsSync(file)
        || fs.lstatSync(file).isDirectory()){
        return;
    }

    var json = {};

    try {
        json = fse.readJSONFileSync(file);
    } catch (e) {
        var msg = 'Read JSON `' + file + '`: ' + e.message;
        throw new Error(msg);
    }
    keyManager.extractDotFields(json);

    return json;
};

/**
 *
 * @param cwd {string}
 * @private
 */
ConfigNode.prototype._imports = function(cwd){

    // get value from parent config node
    var disableImport = this.get('disableImportFilesForChild', {
        default: false
    });

    if (!cwd || disableImport){
        return;
    }

    var imports = this._settings.IMPORTS || [],
        importItem,
        json, a,
        tObj = {},
        jsonFile;


    for (var i = 0; i < imports.length; i++){
        importItem = imports[i];
        jsonFile = path.resolve(cwd, importItem.file);
        json = this._configImport(jsonFile)

        a = keyManager.split(importItem.key);
        for (var ii = 0; ii < a.length; ii++){
            tObj[a[ii]] = tObj[a[ii]] || {};

            if (ii === (a.length - 1)){
                tObj[a[ii]] = json;
            }
        }
    }
    return tObj;
};

/**
 *
 * @param cwd {string}
 * @returns {Object|undefined}
 * @private
 */
ConfigNode.prototype._overrideImport = function(cwd){
    // get value from parent config node
    var disableImport = this.get('disableImportFilesForChild', {
        default: false
    });

    var overrideConfigFile = this._settings.OVERRIDE_CONFIG_FILE || '';

    if (disableImport
        || typeof overrideConfigFile !== 'string'
        || overrideConfigFile.length === 0
    ){
        return;
    }

    var file = path.resolve(cwd, this._settings.OVERRIDE_CONFIG_FILE);

    return this._configImport(file);
};

/**
 *
 * @param [options] {Object}
 */
ConfigNode.prototype.init = function(options){
    options = options || {};

    keyManager.extractDotFields(options);

    this._setRoot();

    if (this.isRoot()){
        options = merge.recursive(true, ROOT_OPTIONS, this._settings.ROOT_OPTIONS, options);
    }
    var cwd = options.directory;

    if (!cwd && !this.isRoot()){
        cwd = this.parent.get('directory');
    }

    var jsonFile = path.resolve(cwd, this._settings.CONFIG_FILE),
        json = this._configImport(jsonFile);

    options = merge.recursive(true, json, options);

    json = this._imports(cwd) || {};
    options = merge.recursive(true, json, options);

    json = this._overrideImport(cwd) || {};
    this._options = merge.recursive(true, options, json);

    this._options = this.compile(this._options);

    this.logger().debug('initializing config');
};

/**
 *
 * @param key {string}
 * @param [options] {Object}
 * @returns {*}
 */
ConfigNode.prototype.get = function(key, options){
    options = options || {};
    options.onlyThis = options.onlyThis || false;

    var aKey = keyManager.split(key),
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
};

/**
 *
 * @param key {string}
 * @param value {*}
 */
ConfigNode.prototype.set = function(key, value){
};

/**
 *
 * @param key {string}
 * @returns {*}
 */
ConfigNode.prototype.getRecursive = function(key){
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
};

/**
 *
 * @returns {Winston.Logger}
 */
ConfigNode.prototype.logger = function(){
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
};

module.exports = ConfigNode;
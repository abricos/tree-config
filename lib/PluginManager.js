/**
 * @module PluginManager
 */

'use strict';

var util = require("util");
var merge = require('merge');

var keyManager = require('./keyManager');

var PluginManager = module.exports = function(config){
    this.config = config;
    this.clean();
};

PluginManager.prototype.clean = function(){
    this._plugins = {};
};

PluginManager.prototype.get = function(name){
    var plugins = this._plugins;

    if (plugins[name]){
        return plugins[name];
    }
    var pluginClass = PluginManager._pluginClasses[name];
    if (!pluginClass){
        throw new Error('Plugin `' + name + '` is not registered');
    }
    var plugin = new pluginClass(this.config);
    return plugin;
};

PluginManager._pluginClasses = {};

PluginManager.register = function(name, pluginClass){
    PluginManager._pluginClasses[name] = pluginClass;
};

PluginManager.get = function(name){
    return PluginManager._pluginClasses[name];
};

var Plugin = function(config){
    this.config = config;
};

PluginManager.Plugin = Plugin;

/*
 Plugin.prototype.load = function(){
 return {};
 };
 /**/

var LoggerPlugin = function(config){
    Plugin.call(this, config);
};

util.inherits(LoggerPlugin, Plugin);

LoggerPlugin.prototype.info = function(){
    console.info.apply(null, arguments);
};

LoggerPlugin.prototype.warn = function(){
    console.warn.apply(null, arguments);
};

LoggerPlugin.prototype.error = function(){
    console.error.apply(null, arguments);
};

PluginManager.LoggerPlugin = LoggerPlugin;

PluginManager.register('logger', LoggerPlugin);

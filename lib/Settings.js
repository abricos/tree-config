/**
 *
 * Order of merger:
 * 1. Default Options
 * 2. Config File
 * 3. Import files
 * 4. Override File
 *
 * @author Alexander Kuzmin
 * @module Settings
 */

'use strict';

/**
 *
 * @constructor
 */
var Settings = function(settings){

    this.cwd = process.cwd();
    this.defaults = {};
    this.file = null;
    this.overrideFile = null;
    this.imports = [];

    settings = settings || {};

    this.setDefaults(settings.defaults);
    this.setConfigFile(settings.file);
    this.setOverrideConfigFile(settings.overrideFile);
    this.setImports(settings.imports);
};

Settings.prototype.setDefaults = function(options){
    this.defaults = options || {};
};

Settings.prototype.setConfigFile = function(file){
    this.file = file;
};

Settings.prototype.setOverrideConfigFile = function(overrideFile){
    this.overrideFile = overrideFile;
};

Settings.prototype.setImports = function(options){
    this.imports = options || [];
};


module.exports = Settings;
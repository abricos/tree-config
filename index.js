/**
 * @module TreeConfig
 */

'use strict';

var ConfigNode = require('./lib/ConfigNode');
var PluginManager = require('./lib/PluginManager');
var SourceManager = require('./lib/SourceManager');

var TreeConfig = new ConfigNode('_root_', null);

TreeConfig.PluginManager = PluginManager;
TreeConfig.SourceManager = SourceManager;
TreeConfig.ConfigNode = ConfigNode;

module.exports = TreeConfig;

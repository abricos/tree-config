/**
 * @author Alexander Kuzmin <roosit@abricos.org>
 * @module TreeConfig
 */

'use strict';

var ConfigNode = require('./lib/ConfigNode');
var SourceManager = require('./lib/SourceManager');

var TreeConfig = new ConfigNode('_root_', null);

TreeConfig.SourceManager = SourceManager;

module.exports = TreeConfig;

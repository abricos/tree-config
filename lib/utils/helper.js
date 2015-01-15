/**
 * @author Alexander Kuzmin
 * @module helper
 */

'use strict';

var path = require('path');
var chalk = require('chalk');

/**
 *
 * @param dir
 * @param from?
 * @returns {string}
 */
module.exports.path = function(dir, from){
    from = from || process.cwd();
    var s = path.relative(from, dir);
    return chalk.underline(s);
};

/**
 *
 * @param file
 * @returns {string}
 */
module.exports.file = function(file){
    var s = path.basename(file);
    return chalk.underline(s);
};

/**
 *
 * @param n {string|int}
 * @returns {string}
 */
module.exports.number = function(n){
    var s = n + '';
    return chalk.cyan(s);
};

/**
 *
 * @param s {string}
 * @returns {string}
 */
module.exports.string = function(s){
    s = '`'+s+'`';
    return chalk.green(s);
};

var path = require('path');
var chalk = require('chalk');

var me = module.exports;

me.path = function(dir, from){
    from = from || process.cwd();
    var s = path.relative(from, dir);
    return chalk.underline(s);
};

me.file = function(file){
    var s = path.basename(file);
    return chalk.underline(s);
};

me.number = function(n){
    var s = n + '';
    return chalk.cyan(s);
};

me.string = function(s){
    s = '`'+s+'`';
    return chalk.green(s);
};

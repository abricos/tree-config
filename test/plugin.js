'use strict';

var should = require('should');
var util = require("util");

var config = require('../index');

var savedLoggerPlugin = config.PluginManager.get('logger');

var LoggerPlugin = function(config){
    config.PluginManager.Plugin.call(this, config);
};

util.inherits(LoggerPlugin, config.PluginManager.Plugin);

LoggerPlugin.prototype.info = function(){
    var level = this.config.get('log.console.level');
    return level === 'info';
};

LoggerPlugin.prototype.warn = function(){
    var level = this.config.get('log.console.level');
    return level === 'warn';
};

LoggerPlugin.prototype.error = function(){
    var level = this.config.get('log.console.level');
    return level === 'error';
};

describe('Plugin', function(){

    before(function(done){
        config.clean();

        config.setDefaults({
            log: {console: {level: 'info'}}
        });

        done();
    });

    after(function(done){
        config.clean();
        config.PluginManager.register('logger', savedLoggerPlugin);

        done();
    });

    it('should register plugin', function(done){
        config.PluginManager.register('logger', LoggerPlugin);
        done();
    });

    it('should plugin function `info`', function(done){
        var logger = config.plugins.get('logger');
        should.exist(logger);

        logger.info().should.be.ok;
        logger.error().should.not.be.ok;

        done();
    });

    it('should plugin function `error`', function(done){
        var logger = config.plugins.get('logger');
        should.exist(logger);

        config.set('log.console.level', 'error');

        logger.info().should.not.be.ok;
        logger.error().should.be.ok;

        done();
    });

});

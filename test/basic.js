'use strict';

var should = require('should');
var config = require('../index');

describe('Basic functions', function(){

    before(function(done){
        config.clean();
        done();
    });

    after(function(done){
        config.clean();
        done();
    });

    it('should set defaults options in root node', function(done){
        config.setDefaults({
            directory: process.cwd(),
            log: {
                console: {
                    level: 'info',
                    colorize: 'true',
                    timestamp: 'HH:MM:ss',
                    label: 'api'
                }
            },
            api: {
                module: {
                    pathTemplate: '<%= directory %>/lib/{v#module}'
                }
            },
            server: {
                port: 90
            }
        });

        var port = config.get('server.port');
        should.equal(port, 90);

        done();
    });

    it('should created child config node', function(done){
        var childConfig = config.children.create('module');

        should.exist(childConfig);

        childConfig.setDefaults({
            log: {
                console: {
                    label: '<%= ^.log.console.label %>.user'
                }
            }
        });

        childConfig.init({
            api: {
                uri: 'http://localhost'
            }
        });

        should.exist(childConfig);

        done();
    });

    it('should created subchild config node', function(done){
        var childConfig = config.children.get('module');
        should.exist(childConfig);

        var subChildConfig = childConfig.children.create('submodule');
        should.exist(subChildConfig);

        subChildConfig.setDefaults({
            server: {
                port: 1000
            }
        });

        should.exist(subChildConfig);

        done();
    });

    it('should set init options in root node', function(done){
        config.init({server: {port: 80}});

        var port = config.get('server.port');
        should.equal(port, 80);

        done();
    });

    it('should set options in root node', function(done){
        config.set('server.port', 8080);

        var value = config.get('server.port');
        should.equal(value, 8080);

        done();
    });

    it('should get value from root node', function(done){
        var label = config.get('log.console.label');
        should.equal(label, 'api');

        done();
    });

    it('should get value from child node', function(done){
        var value = config.get('log.console.label', {
            from: 'module'
        });
        should.equal(value, 'api.user');

        var childConfig = config.children.get('module');
        should.exist(childConfig);

        value = childConfig.get('log.console.label');
        should.equal(value, 'api.user');

        done();
    });

    it('should get value from subchild node', function(done){
        var subChildConfig = config.getNode('module.submodule');
        should.exist(subChildConfig);

        var value = subChildConfig.get('server.port');
        should.equal(value, 1000);

        done();
    });

    /*
    it('should get value from root node in subchild node', function(done){
        var subChildConfig = config.getNode('module.submodule');
        should.exist(subChildConfig);

        var value = subChildConfig.get('^^.server.port');
        should.equal(value, 1000);

        done();
    });
    /**/
    it('should get value from root node in subchild node');

});

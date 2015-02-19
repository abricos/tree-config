'use strict';

var should = require('should');
var config = require('../index');

describe('TreeConfig Node', function(){

    before(function(done){
        config.clean();

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

        done();
    });

    after(function(done){
        config.clean();
        done();
    });

    it('should init with options', function(done){
        var port = config.get('server.port');
        should.equal(port, 90);

        config.init({server: {port: 80}});

        port = config.get('server.port');
        should.equal(port, 80);

        done();
    });

    it('should set options', function(done){
        config.set('server.port', 8080);

        var port = config.get('server.port');
        should.equal(port, 8080);

        done();
    });

    it('should create child config node', function(done){

        var childConfig = config.children.create('module-user');

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

    it('should correct values', function(done){
        var label = config.get('log.console.label');
        should.equal(label, 'api');

        label = config.get('log.console.label', {
            from: 'module-user'
        });
        should.equal(label, 'api.user');

        var userConfig = config.children.get('module-user');
        should.exist(userConfig);

        label = userConfig.get('log.console.label');
        should.equal(label, 'api.user');

        done();
    });


});

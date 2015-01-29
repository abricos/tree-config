'use strict';

var should = require('should');

var treeConfig = require('../index');

describe('TreeConfig Node', function(){

    before(function(done){
        treeConfig.configure({
            ROOT_OPTIONS: {
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
                }
            }
        });
        done();
    });

    after(function(done){
        treeConfig.clean();
        done();
    });

    it('should be child config node', function(done){

        var defOptions = {
            id: 'module-user',
            log: {
                console: {
                    label: '<%= ^.log.console.label %>.user'
                }
            }
        };

        var overOptions = {
            parentId: '_root_'
        };

        var config = treeConfig.instance([defOptions, overOptions]);
        should.exist(config);

        done();
    });

    it('should be correct values', function(done){
        var rootConfig = treeConfig.instance();
        should.exist(rootConfig);

        var label = rootConfig.get('log.console.label');
        should.equal(label, 'api');

        var config = treeConfig.instance('module-user');
        should.exist(config);

        label = config.get('log.console.label');
        should.equal(label, 'api.user');

        done();
    });


});

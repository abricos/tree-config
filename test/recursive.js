'use strict';

var should = require('should');
var path = require('path');
var config = require('../index');

describe('Recursive function', function(){

    before(function(done){
        config.clean();
        done();
    });

    after(function(done){
        config.clean();
        done();
    });

    it('should structure configure', function(done){
        config.setDefaults({
            log: {
                console: {
                    level: 'info',
                    colorize: 'true',
                    timestamp: 'HH:MM:ss'
                }
            }
        });

        var childConfig = config.children.create('child');
        childConfig.setDefaults({
            log: {
                file: {
                    name: 'test'
                }
            }
        });

        var subChildConfig = childConfig.children.create('subchild');
        subChildConfig.setDefaults({
            log: {
                console: {
                    level: 'debug'
                }
            }
        });

        done();
    });

    it('should build recursive value', function(done){
        var subChildConfig = config.getNode('child.subchild');

        should.exist(subChildConfig);
        subChildConfig.should.property('id', 'subchild');

        var log = subChildConfig.get('log', {
            recursive: true
        });

        log.should.containDeepOrdered({
            console: {
                level: 'debug',
                colorize: 'true'
            },
            file: {
                name: 'test'
            }
        });

        done();
    });

    it('should alternative build recursive value', function(done){
        var log = config.get('log', {
            from: 'child.subchild',
            recursive: true
        });

        log.should.containDeepOrdered({
            console: {
                level: 'debug',
                colorize: 'true'
            },
            file: {
                name: 'test'
            }
        });

        done();
    });

});

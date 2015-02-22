'use strict';

var should = require('should');
var path = require('path');
var config = require('../index');

describe('App', function(){

    before(function(done){
        config.clean();
        done();
    });

    after(function(done){
        config.clean();
        done();
    });

    it('should root config node configure', function(done){

        config.configure({
            sourcesOrder: {
                defaults: 0,
                init: 1,
                appjson: 2,
                appjsonoverride: 3,
                setter: 1000
            },
            sources: [{
                id: 'appjson',
                type: 'json',
                cwd: path.join(__dirname, 'test-app'),
                src: '.appconfig.json'
            }, {
                id: 'package',
                type: 'json',
                cwd: path.join(__dirname, 'test-app'),
                src: 'package.json',
                key: 'package'
            }]
        });

        config.setDefaults({
            directory: path.join(__dirname, 'test-app'),
            tester: {
                protocol: 'https',
                host: 'localhost',
                port: 8080,
                address: '<%= tester.protocol%>://<%= tester.host%>:<%= tester.port%>'
            }
        });

        var address = config.get('tester.address');
        should.equal(address, 'https://localhost:8080');

        done();
    });

    it('should imported .appconfig.json', function(done){
        var adminLogin = config.get('users.admin.login');
        should.equal(adminLogin, 'admin');

        done();
    });

    it('should imported package.json', function(done){
        var name = config.get('package.name');
        should.equal(name, 'test-app');

        done();
    });

    it('should created child config `module`', function(done){
        var childConfig = config.children.create('module');
        should.exist(childConfig);
        should.exist(childConfig.parent);

        var modCWD = path.join(__dirname, 'test-app', 'module');

        childConfig.configure({
            sources: [
                {
                    id: 'modconfig',
                    type: 'json',
                    cwd: modCWD,
                    src: '.modconfig.json'
                }, {
                    id: 'modconfigoverride',
                    type: 'json',
                    cwd: modCWD,
                    src: 'mymodconfig.json'
                }, {
                    id: 'package',
                    type: 'json',
                    cwd: modCWD,
                    key: 'package',
                    src: 'package.json'
                }
            ],
            sourcesOrder: {
                defaults: 0,
                init: 1,
                modconfig: 2,
                modconfigoverride: 3,
                setter: 1000
            }
        });

        childConfig.should.property('id', 'module');

        var name = childConfig.get('package.name');
        should.equal(name, 'test-app-module');

        done();
    });

    it('should get a parent config value', function(done){
        var childConfig = config.children.get('module');

        var value = childConfig.get('^.users.admin.password');
        should.equal(value, 'admin');

        done();
    });

    it('should get a override config value from myappconfig.json', function(done){
        var childConfig = config.children.get('module');

        var value = childConfig.get('users.admin.password');
        should.equal(value, 'myadminpass');

        done();
    });

    it('should created two child config `module2`', function(done){
        var childConfig = config.children.create('module2');
        should.exist(childConfig);
        should.exist(childConfig.parent);

        var modCWD = path.join(__dirname, 'test-app', 'module');

        childConfig.configure({
            defaults: {
                users: {
                    user: {
                        password: 'myuserpass'
                    }
                }
            },
            sources: [
                {
                    type: 'json',
                    cwd: path.join(__dirname, 'test-app'),
                    src: '.appconfig.json'
                }, {
                    type: 'json',
                    cwd: modCWD,
                    src: 'mymodconfig.json'
                }
            ],
            sourcesOrder: {
                '.appconfig.json': 1,
                'mymodconfig.json': 2
            }
        });

        childConfig.should.property('id', 'module2');

        done();
    });

    it('should get a override config value from .modconfig.json', function(done){
        var childConfig = config.children.get('module2');

        var value = childConfig.get('users.admin.password');
        should.equal(value, 'myadminpass');

        done();
    });


});

'use strict';

var should = require('should');
var path = require('path');
var treeConfig = require('../index');

var APP_CONFIG = {
    CONFIG_FILE: '.appconfig.json',
    OVERRIDE_CONFIG_FILE: 'myappconfig.json',
    ROOT_OPTIONS: {
        directory: path.join(__dirname, 'test-app'),
        tester: {
            protocol: 'https',
            host: 'localhost',
            port: 8080,
            address: '<%= tester.protocol%>://<%= tester.host%>:<%= tester.port%>'
        }
    },
    IMPORTS: [{
        key: 'package',
        file: 'package.json'
    }]
};

var MODULE_OPTIONS = {
    directory: path.join(__dirname, 'test-app', 'module')
};

describe('App Configure: ', function(){

    before(function(done){
        treeConfig.configure(APP_CONFIG);
        done();
    });

    after(function(done){
        treeConfig.clean();
        done();
    });

    it('should be reconfigured root config', function(done){
        var rootConfig = treeConfig.instance();

        should.exist(rootConfig);
        rootConfig.should.property('id', '_root_');

        var address = rootConfig.get('tester.address');
        should.equal(address, 'https://localhost:8080');

        done();
    });

    it('should be imported .appconfig.json', function(done){
        var rootConfig = treeConfig.instance();
        should.exist(rootConfig);

        var adminLogin = rootConfig.get('users.admin.login');
        should.equal(adminLogin, 'admin');

        done();
    });

    it('should be imported package.json', function(done){
        var rootConfig = treeConfig.instance();

        should.exist(rootConfig);

        var name = rootConfig.get('package.name');
        should.equal(name, 'test-app');

        done();
    });

    it('should be created module config', function(done){
        var config = treeConfig.instance('module', MODULE_OPTIONS);

        should.exist(config);
        should.exist(config.parent);

        config.parent.should.property('id', '_root_');
        config.should.property('id', 'module');

        var name = config.get('package.name');
        should.equal(name, 'test-app-module');

        done();
    });

    it('should be get a parent config value', function(done){
        var config = treeConfig.instance('module');

        should.exist(config);

        var value = config.get('^.users.admin.password');
        should.equal(value, 'admin');

        done();
    });

    it('should be get a override config value from myappconfig.json', function(done){
        var config = treeConfig.instance('module');

        should.exist(config);

        var value = config.get('users.admin.password');
        should.equal(value, 'myadminpass');

        done();
    });

});

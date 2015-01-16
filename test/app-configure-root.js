'use strict';

var should = require('should');
var path = require('path');
var treeConfig = require('../index');

var APP_CONFIG = {
    CONFIG_FILE: '.appconfig.json',
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


});

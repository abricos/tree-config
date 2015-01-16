'use strict';

var should = require('should');
var treeConfig = require('../index');

var ROOT_OPTIONS = {
    tester: {
        protocol: 'https',
        host: 'localhost',
        port: 8080,
        address: '<%= tester.protocol%>://<%= tester.host%>:<%= tester.port%>'
    }
};

describe('Root default options', function(){

    before(function(done){
        treeConfig.configure({
            ROOT_OPTIONS: ROOT_OPTIONS
        });
        done();
    });

    after(function(done){
        treeConfig.clean();
        done();
    });

    it('should be root config instance', function(done){
        var rootConfig = treeConfig.instance();

        should.exist(rootConfig);
        rootConfig.should.property('id', '_root_');

        var address = rootConfig.get('tester.address');
        should.equal(address, 'https://localhost:8080');

        done();
    });


});

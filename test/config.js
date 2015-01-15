'use strict';

var should = require('should');

var treeConfig;

describe('Tree-config', function(){

    it('should tree-config class', function(done){
        treeConfig = require('../index');
        should.exist(treeConfig);

        treeConfig.should.property('ConfigNode');
        treeConfig.should.property('Default');

        done();
    });

    it('clear all instance', function(done){
        treeConfig.clear();
        done();
    });

    it('root config instance', function(done){
        var config = treeConfig.instance();

        should.exist(config);
        config.should.be.an.instanceOf(treeConfig.ConfigNode);

        should.not.exist(config.parent);

        done();
    });

    it('check root default options', function(done){
        // var directory = config.get('directory');
        // should.exist(config);
        done();
    });

});

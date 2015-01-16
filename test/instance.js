'use strict';

var should = require('should');

var treeConfig;

describe('TreeConfig: ', function(){

    it('should be property ConfigNode class', function(done){
        treeConfig = require('../index');
        should.exist(treeConfig);

        treeConfig.should.property('ConfigNode');

        done();
    });

    it('should be property utils class', function(done){
        treeConfig.should.property('utils');
        done();
    });

    it('clean all instance', function(done){
        treeConfig.clean();
        done();
    });

    it('should be root config instance typeof ConfigNode', function(done){
        var config = treeConfig.instance();

        should.exist(config);
        config.should.be.an.instanceOf(treeConfig.ConfigNode);

        should.not.exist(config.parent);

        done();
    });

    it('should be child config', function(done){

        var childOptions = {
            myChildOption: 'This myChildOption value'
        };

        var childConfig = treeConfig.instance('child', childOptions);

        var value = childConfig.get('myChildOption');
        should.exist(value);

        value.should.equal(childOptions.myChildOption);

        done();
    });

    it('should be static function treeConfig in root config instance', function(done){
        var config = treeConfig.instance();

        config = config.instance();

        should.exist(config);
        config.should.be.an.instanceOf(treeConfig.ConfigNode);

        done();
    });

    it('should be static function treeConfig in children config instance', function(done){
        var config = treeConfig.instance();

        config = config.instance('child');

        should.exist(config);
        config.should.be.an.instanceOf(treeConfig.ConfigNode);

        config.should.property('id', 'child');

        done();
    });

});

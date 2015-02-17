'use strict';

var should = require('should');
var config;

describe('TreeConfig instance', function(){

    it('should be property ConfigNode class', function(done){
        config = require('../index');
        should.exist(config);

        config.should.property('ConfigNode');

        done();
    });

    it('should be property utils class', function(done){
        config.should.property('utils');
        done();
    });

    it('clean all instance', function(done){
        config.clean();
        done();
    });

    it('should be root config instance typeof ConfigNode', function(done){
        var config = config.instance();

        should.exist(config);
        config.should.be.an.instanceOf(config.ConfigNode);

        should.not.exist(config.parent);

        done();
    });

    it('should be child config', function(done){

        var childOptions = {
            myChildOption: 'This myChildOption value'
        };

        var childConfig = config.instance('child', childOptions);

        var value = childConfig.get('myChildOption');
        should.exist(value);

        value.should.equal(childOptions.myChildOption);

        done();
    });

    it('should be static function config in root config instance', function(done){
        var config = config.instance();

        config = config.instance();

        should.exist(config);
        config.should.be.an.instanceOf(config.ConfigNode);

        done();
    });

    it('should be static function config in children config instance', function(done){
        var config = config.instance();

        config = config.instance('child');

        should.exist(config);
        config.should.be.an.instanceOf(config.ConfigNode);

        config.should.property('id', 'child');

        done();
    });

});

'use strict';

var should = require('should');

var Config = require('../lib/Config');

describe('Tree-config', function(){

    it('root config instance', function(done){
        var config = Config.instance();

        should.exist(config);
        done();
    });

});

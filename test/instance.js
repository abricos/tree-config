'use strict';

var should = require('should');
var config = require('../index');

describe('Instance', function(){
    it('should property ConfigNode class', function(done){
        config.should.property('ConfigNode');
        done();
    });

    it('should property PluginManager class', function(done){
        config.should.property('PluginManager');
        done();
    });

    it('should property SourceManager class', function(done){
        config.should.property('SourceManager');
        done();
    });
});

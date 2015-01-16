'use strict';

var should = require('should');

describe('TreeConfig', function(){

    var rootConfig,
        childConfig,
        subChildConfig;

    var rootOptions = {
        source: {
            dir: '<%= directory %>/src'
        }
    };

    it('should be TreeConfig instance', function(done){
        var treeConfig = require('../index');
        should.exist(treeConfig);

        treeConfig.clean();
        rootConfig = treeConfig.instance(rootOptions);

        var id = rootConfig.id;
        should.exist(id);

        // id.should.equal('_root_');

        // rootConfig.should.property('id', '_root_');

        done();
    });


});

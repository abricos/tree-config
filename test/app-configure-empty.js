'use strict';

var should = require('should');

var treeConfig = require('../index');

describe('TreeConfig Empty', function(){

    it('should be empty configure', function(done){
        treeConfig.configure({});

        done();
    });

    it('should be empty configure in over CWD', function(done){
        treeConfig.configure({
            ROOT_OPTIONS: {
                directory: __dirname
            }
        });

        done();
    });


});

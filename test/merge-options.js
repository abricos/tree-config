'use strict';

var should = require('should');

var treeConfig = require('../index');

describe('TreeConfig Merge options: ', function(){

    before(function(done){
        treeConfig.clean();
        done();
    });

    after(function(done){
        treeConfig.clean();
        done();
    });

    it('should be merged options', function(done){

        var defOptions = {
            user: {
                name: 'user',
                pass: 'pass'
            }
        };

        var options = {
            user: {
                pass: 'mypass'
            }
        };

        var config = treeConfig.instance([defOptions, options]);
        should.exist(config);

        var value = config.get('user.pass');
        should.equal(value, 'mypass');

        done();
    });


});

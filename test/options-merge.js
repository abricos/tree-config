'use strict';

var should = require('should');

var config = require('../index');

describe('TreeConfig Merge options: ', function(){

    before(function(done){
        config.clean();
        done();
    });

    after(function(done){
        config.clean();
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

        var config = config.instance([defOptions, options]);
        should.exist(config);

        var value = config.get('user.pass');
        should.equal(value, 'mypass');

        done();
    });


});

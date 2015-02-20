'use strict';

var should = require('should');
var config = require('../index');

describe.only('KeyManager functions', function(){

    before(function(done){
        config.clean();
        done();
    });

    after(function(done){
        config.clean();
        done();
    });

    it('should fields with dot', function(done){
        config.setDefaults({
            'root.server': {
                port: 8080
            }
        });

        var port = config.get('root.server.port');
        should.equal(port, 8080);

        done();
    });

});

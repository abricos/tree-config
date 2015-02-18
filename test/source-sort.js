'use strict';

var should = require('should');
var config = require('../index');

describe('TreeConfig Source functions', function(){

    before(function(done){
        config.clean();

        done();
    });

    after(function(done){
        config.clean();
        done();
    });

    it('should default options', function(done){
        config.setDefaults({server: {port: 10}});

        var port = config.get('server.port');
        should.equal(port, 10);

        done();
    });

    it('should init options', function(done){
        config.init({server: {port: 20}});

        var port = config.get('server.port');
        should.equal(port, 20);

        done();
    });

    it('should set options', function(done){
        config.set('server.port', 30);

        var port = config.get('server.port');
        should.equal(port, 30);

        done();
    });

    it('should configure order', function(done){
        config.configure({
            orderSources: {
                setter: 0,
                defaults: 1,
                init: 2
            }
        });

        var port = config.get('server.port');
        should.equal(port, 20);

        done();
    });

});

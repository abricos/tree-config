/**
 * @author Alexander Kuzmin
 * @module KeyManager
 */

'use strict';

/**
 *
 * @type {RegExp}
 * @private
 */
var _dotRegExp = /\./g;

/**
 *
 * @type {string}
 * @private
 */
var _DOTR = '__DOT__';

/**
 *
 * @type {Object}
 * @private
 */
var _cacheSplitKey = {};

/**
 *
 * @constructor
 */
var KeyManager = function(){
    /**
     *
     * @type {Object}
     * @private
     */
    this._dotFields = {};
};

/**
 *
 * @param options
 * @returns {Object}
 */
KeyManager.prototype.extractDotFields = function(options){
    if (typeof options !== 'object'){
        return options;
    }
    for (var n in options){
        if (_dotRegExp.test(n)){
            this._dotFields[n] = n.replace(_dotRegExp, _DOTR);
        }
        this.extractDotFields(options[n]);
    }
};

/**
 *
 * @param key
 */
KeyManager.prototype.split = function(key){
    if (typeof key !== 'string'){
        throw new Error('Key in config must be String type');
    }

    if (_cacheSplitKey[key]){
        return _cacheSplitKey[key];
    }

    key = key.replace(/^\s+|\s+$/g, '');

    var keyOrig = key;
    var tKey;
    for (var n in this._dotFields){
        do {
            tKey = key.replace(n, this._dotFields[n]);
            if (tKey !== key){
                key = tKey;
            } else {
                break;
            }
        } while (true);
    }
    var a = key.split('.'), ret = [], ai;
    for (var i = 0; i < a.length; i++){
        ai = a[i];
        for (var n in this._dotFields){
            if (ai === this._dotFields[n]){
                ai = n;
                break;
            }
        }
        ret[ret.length] = ai;
    }
    _cacheSplitKey[keyOrig] = ret;
    return ret;
};

module.exports = KeyManager;
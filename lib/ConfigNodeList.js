/**
 * @module ConfigNodeList
 */

'use strict';

var keyManager = require('./keyManager');

var ConfigNodeList = function(owner){

    this.owner = owner;

    this.clean();
};

ConfigNodeList.prototype.clean = function(){
    this._list = [];
};

ConfigNodeList.prototype.each = function(fn, context){
    if (typeof fn !== 'function'){
        return;
    }
    var list = this._list;
    for (var i = 0; i < list.length; i++){
        if (fn.call(context || this, list[i], i)){
            break;
        }
    }
};

ConfigNodeList.prototype.get = function(key){
    var aKey = keyManager.split(key);
    if (aKey.length === 0){
        return;
    }

    var id = aKey[0], findNode;
    this.each(function(node){
        if (node.id === id){
            findNode = node;
            return true;
        }
    }, this);

    if (!findNode || aKey.length === 1){
        return findNode;
    }

    var childKey = keyManager.shift(key);

    return findNode.children.get(childKey);
};


ConfigNodeList.prototype.create = function(id, settings){
    var temp = {};
    temp[id] = '';
    keyManager.extractDotFields(temp);

    var node = this.get(id);
    if (node){
        throw new Error('Node already exists in list, ID `' + id + '`');
    }

    var ConfigNode = require('./ConfigNode');

    node = new ConfigNode(id, this.owner, settings);

    var list = this._list;
    list[list.length] = node;

    return node;
};


module.exports = ConfigNodeList;
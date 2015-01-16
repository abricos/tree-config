/**
 * @author Alexander Kuzmin
 * @module utils
 */

'use strict';

module.exports = {

    /**
     * @type {int}
     * @private
     */
    _uniqueCounter: 1,

    /**
     * Generate unique ID for configNode.Id
     * @param [prefix] {string}
     * @returns {string}
     */
    genid: function(prefix){
        prefix = prefix || 'unique';

        return prefix + (this._uniqueCounter++);
    },

    /**
     * Merge two or more objects recursively
     *
     * @param obj1 {Object}
     * @param obj2 {Object}
     * @returns {Object}
     */
    merge: function(obj1, obj2){
        return merge.recursive(true, obj1, obj2);
    }

};

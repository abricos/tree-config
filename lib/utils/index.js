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
    _uniqueCounter: 0,

    /**
     * Generate unique ID for configNode.Id
     * @param [prefix] {string}
     * @returns {string}
     */
    genid: function(prefix){
        prefix = prefix || '';

        return prefix + (this._uniqueCounter++);
    }
};

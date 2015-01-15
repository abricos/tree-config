/**
 * @author Alexander Kuzmin <roosit@abricos.org>
 * @module Default
 */

'use strict';

module.exports = {

    /**
     * @type {string}
     */
    MY_CONFIG_FILE: "myconfig.json",

    /**
     * @type {Object}
     */
    ROOT_OPTIONS: {
        directory: process.cwd(),
        log: {
            console: {
                level: 'info',
                colorize: 'true',
                timestamp: 'HH:MM:ss'
            }
        },
        disableImportFilesForChild: false
    },

    /**
     * @type {Array}
     */
    IMPORTS: []
};
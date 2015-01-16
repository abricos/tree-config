# tree-config

Tree-config organizes hierarchical configurations for your app deployments.

It lets you define a set of default parameters, and extend them
for different deployment environments (development, qa, staging, production, etc.).

Configurations are stored in configuration files within your application,
and can be overridden and extended.

## Installation

Installation is fairly straightforward, just install the npm module:

    $ npm install -g smtpeshka

## Quick Start

Create a configuration file for your application, JSON format.

#### Example

*config.json*

    {
        "db": {
            "mysql": {
                "server": "localhost",
                "port": 3306,
                "database": "myapp",
                "user": "root",
                "password": ""
            }
        }
    }

Use the config in your code:

    var treeConfig = require('tree-config');
    var config = treeConfig.instance({
        // the main configuration file
        CONFIG_FILE: 'config.json'
    });

    // Get config value `db.mysql.server`
    // `server` variable will have value `localhost`
    var server = config.get('db.mysql.server');


### Override values

To override the defaults, create a configuration file with
with the desired values.

#### Example

*myconfig.json*

    {
        "db": {
            "mysql": {
                "database": "mydbapp",
                "user": "dbuser",
                "password": "dbpass"
            }
        }
    }

In your code:

    var treeConfig = require('tree-config');
    var config = treeConfig.instance({
        // the main configuration file
        CONFIG_FILE: 'config.json',

        // configuration file to override the main settings
        OVERRIDE_CONFIG_FILE: 'myconfig.json'
    });

    // Get config value `db.mysql.database`
    // `database` variable will have value `mydbapp`
    var database = config.get('db.mysql.database');


### Default config values in app

You can set default values in the application.

#### Example

In your code:

    var treeConfig = require('tree-config');
    var config = treeConfig.instance({
        ...
        ROOT_OPTIONS: {
            db: {
                mysql: {
                    server: 'localhost',
                    port: 3306,
                    ...
                }
            }
        },
        ...
    });


### Import additional config files

#### Example

In your code:

    var treeConfig = require('tree-config');
    var config = treeConfig.instance({
        ...
        IMPORTS: [{
            key: 'package',
            file: 'package.json'
        }]
        ...
    });

    var appName = config.get('package.name');


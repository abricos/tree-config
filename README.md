# tree-config

[![NPM](https://nodei.co/npm/tree-config.svg?downloads=true&downloadRank=true)](https://nodei.co/npm/tree-config/)&nbsp;&nbsp;
[![Build Status](https://travis-ci.org/abricos/tree-config.svg?branch=master)](https://travis-ci.org/abricos/tree-config)&nbsp;&nbsp;


Tree-config organizes hierarchical configurations for your app deployments.

It lets you define a set of default parameters, and extend them
for different deployment environments (development, qa, staging, production, etc.).

Configurations are stored in configuration files within your application,
and can be overridden and extended.

## Installation

Installation is fairly straightforward, just install the npm module:

    $ npm install tree-config

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

    var config = require('tree-config');
    config.configure({
        sources: [
            {
                type: 'json',
                src: 'config.json'
            }
        ]
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

    var config = require('tree-config');
    config.configure({
        sources: [
            {
                type: 'json',
                src: 'config.json'
            },{
                type: 'json',
                src: 'myconfig.json'
            }
        ]
    });

    // Get config value `db.mysql.database`
    // `database` variable will have value `mydbapp`
    var database = config.get('db.mysql.database');


### Default config values in app

You can set default values in the application.

#### Example

In your code:

    config.setDefaults({
        db: {
            mysql: {
                server: 'localhost',
                port: 3306,
                ...
            }
        }
    });


### Import additional config files

In your code:

    config.configure({
        sources: [
            {
                cwd: process.cwd(),
                key: 'mypackage',
                type: 'json',
                src: 'package.json'
            }
        ]
    });

    var appName = config.get('mypackage.name');


### Tree configuration

Create a configuration file for your application module.


#### Example

Application structure:

    /
     config.json
     package.json
     ...
     modules/
        user/
            config.json
            package.json
            ...

In your code:

    var config = require('tree-config');
    config.configure({
        sources: [
            {
                type: 'json',
                src: 'config.json'
            },{
                type: 'json',
                key: 'package',
                src: 'myconfig.json'
            }
        ]
    });
    config.setDefaults({
       db: {
           mysql: {
               server: 'localhost',
               port: 3306,
               ...
           }
       }
    });

    var cwdChildConfig =  path.join(process.cwd(), 'modules', 'user');
    var childConfig = config.children.create('user-module);
    childConfig.configure({
        sources: [
            {
                type: 'json',
                cwd: cwdChildConfig,
                src: 'config.json'
            },{
                type: 'json',
                key: 'package',
                cwd: cwdChildConfig,
                src: 'myconfig.json'
            }
        ]
    });
    childConfig.setDefaults({
        db: {
            mysql: {
                database: 'userdb'
            }
        }
    });

    // `database` variable will have value `userdb`
    var database = childConfig.get('db.mysql.database');


### Getting value of the parent configuration

In your code:

    ...
    var database = childConfig.get('^.db.mysql.database');
    ...


### More examples

See more examples in the [test](https://github.com/abricos/tree-config/tree/master/test) folder
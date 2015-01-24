/*
 * Copyright (c) 2013 Narciso Jaramillo. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, node: true */
/*global require */

(function () {
    "use strict";

    var bower       = require("bower"),
        bowerConfig = require("bower-config"),
        log4js      = require("log4js"),
        _           = require("lodash"),
        Cli         = require("./Cli");

    var DOMAIN_NAME = "bower";

    log4js.loadAppender("file");
    log4js.addAppender(log4js.appenders.file("/tmp/BowerDomain.log"), "logfile");
    var log = log4js.getLogger("logfile");

    log.debug("Started parent.");

    function _getPackagesData (data) {
        // For some reason the package list is an array inside an array.
        return _.flatten(data);
    }

    /**
     * Returns a list of all package names from bower. Might take nontrivial time to complete.
     * @param {object} config Key-value object to specify optional configuration.
     * @param {function(?string, ?Array.<{name: string, url: string}>)} cb Callback to receive
     *     the list of package names. First parameter is either an error string or null if no
     *     error; second parameter is either the array of name/url objects or null if there was
     *     an error.
     */
    function _cmdGetPackages(config, cb) {
        bower.commands.search(null, config)
            .on("end", function (data) {
                var packages = _getPackagesData(data);

                log.debug("Packages: " + JSON.stringify(packages));

                cb(null, packages);
            })
            .on("error", function (error) {
                cb(error.message, null);
            });
    }

    /**
     * Returns a list of all packages names from bower cache.
     * @param {object} config Key-value object to specify optional configuration.
     * @param {function(?Array)} cb Callback o receive
     *      the list of packages names that are on the bower cache.
     */
    function _cmdGetPackagesFromCache(config, cb) {
        bower.commands.cache.list(null, null, config)
            .on("end", function (data) {
                var packages = _getPackagesData(data);

                log.debug("Packages: " + JSON.stringify(packages));

                cb(null, packages);
            })
            .on("error", function (error) {
                // returns as a result an empty array
                cb(null, []);
            });
    }

    /**
     * Installs the package with the given name.
     * @param {string} path The path to the folder within which to install the package.
     * @param {string} name Name of package to install.
     * @param {object} config Key-value object to specify optional configuration.
     * @param {function(?string, ?string)} cb Callback for when the installation is finished.
     * First parameter is an error string, or null if no error, and second parameter is either
     * the full installation path or null if there was an error.
     */
    function _cmdInstallPackage(path, name, config, cb) {
        log.debug("Installing " + name + " into " + path);

        if (!config) {
            config = {};
        }

        config.cwd = path;

        bower.commands.install([name], {save: true}, config)
            .on("end", function (installedPackages) {
                var installedPackage = installedPackages[name];

                cb(null, installedPackage.canonicalDir);
            })
            .on("error", function (error) {
                cb(error ? error.message : "Unknown error", null);
            });
    }

    /**
     * Uninstalls the package with the given name.
     * @param {string} path The path to the folder within which to install the package.
     * @param {string} name Name of package to install.
     * @param {object} config Key-value object to specify optional configuration.
     * @param {function(?string, ?string)} cb Callback for when the installation is finished.
     * First parameter is an error string, or null if no error, and second parameter is either
     * the full installation path or null if there was an error.
     */
    function _cmdUnInstallPackage(path, name, config, cb) {
        log.debug("Uninstalling " + name + " from " + path);

        if (!config) {
            config = {};
        }

        config.cwd = path;

        bower.commands.uninstall([name], { save: true }, config)
            .on("end", function (uninstalledPackages) {
                var uninstalledPackage = uninstalledPackages[name];

                cb(null, uninstalledPackage.canonicalDir);
            })
            .on("error", function (error) {
                cb(error ? error.message : "Unknown error", null);
            });
    }

    /**
     * Read and get the configuration from the ".bowerrc" file.
     * @param {string} path The path to the folder to read the configuration.
     * @param {function(?string, ?string)} cb Callback for when the configuration is ready.
     */
    function _cmdGetConfiguration(path, cb) {
        log.debug("Loading configuration");

        var config = bowerConfig.read(path);

        cb(null, config);
    }

    /**
     * Executes a system program with arguments.
     * @param {string} cmd The full path to the program.
     * @param {array} args The arguments for the program to execute.
     * @param {function(?string, ?string)} cb Callback for when the program has executed.
     */
    function _cmdExecCommand(cmd, args, cb) {
        log.debug("Executing command");

        Cli.execCommand(cmd, args, cb);
    }

    /**
     * Initializes the domain with its commands.
     * @param {DomainManager} domainmanager The DomainManager for the server
     */
    function init(domainManager) {
        if (!domainManager.hasDomain(DOMAIN_NAME)) {
            domainManager.registerDomain(DOMAIN_NAME, {major: 0, minor: 1});
        }

        domainManager.registerCommand(
            DOMAIN_NAME,
            "getPackages",
            _cmdGetPackages,
            true,
            "Returns a list of all packages from the bower registry.",
            [{
                name: "config",
                type: "object",
                description: "Configuration object."
            }],
            [{
                name: "packages",
                type: "{Array.<{name: string, url: string}>}",
                description: "List of all packages in the bower registry."
            }]
        );

        domainManager.registerCommand(
            DOMAIN_NAME,
            "getPackagesFromCache",
            _cmdGetPackagesFromCache,
            true,
            "Returns a list of all packages from the bower cache.",
            [{
                name: "config",
                type: "object",
                description: "Configuration object."
            }],
            [{
                name: "packages",
                type: "{Array}",
                description: "List of all packages in the bower cache."
            }]
        );

        domainManager.registerCommand(
            DOMAIN_NAME,
            "installPackage",
            _cmdInstallPackage,
            true,
            "Installs a package into a given folder.",
            [{
                name: "path",
                type: "string",
                description: "Path to folder into which to install the package"
            }, {
                name: "name",
                type: "string",
                description: "Name of package to install"
            }, {
                name: "config",
                type: "object",
                description: "Configuration object."
            }],
            [{
                name: "installationPath",
                type: "string",
                description: "Path to the installed package."
            }]
        );

        domainManager.registerCommand(
            DOMAIN_NAME,
            "uninstallPackage",
            _cmdUnInstallPackage,
            true,
            "Installs a package into a given folder.",
            [{
                name: "path",
                type: "string",
                description: "Path to folder into which to install the package"
            }, {
                name: "name",
                type: "string",
                description: "Name of package to install"
            }, {
                name: "config",
                type: "object",
                description: "Configuration object."
            }],
            [{
                name: "installationPath",
                type: "string",
                description: "Path to the installed package."
            }]
        ); 

       domainManager.registerCommand(
            DOMAIN_NAME,
            "getConfiguration",
            _cmdGetConfiguration,
            true,
            "Get the configuration.",
            [{
                name: "path",
                type: "string",
                description: "Path to folder to read the configuration."
            }],
            [{
                name: "config",
                type: "Object",
                description: "Configuration object."
            }]
        );

        domainManager.registerCommand(
            DOMAIN_NAME,
            "execCommand",
            _cmdExecCommand,
            true,
            "Utility to execute commands",
            [{
                name: "cmd",
                type: "string",
                description: "System command to execute in a child process."
            }],
            [{
                name: "args",
                type: "array",
                description: "Sytem command's arguments."
            }],
            [{
                name: "result",
                type: "string",
                description: "Result of the command execution."
            }]
        );
    }

    exports.init = init;

    // For local unit testing (outside Brackets)
    exports._cmdGetPackages      = _cmdGetPackages;
    exports._cmdInstallPackage   = _cmdInstallPackage;
    exports._cmdUnInstallPackage = _cmdUnInstallPackage;
    exports._cmdGetConfiguration = _cmdGetConfiguration;
}());

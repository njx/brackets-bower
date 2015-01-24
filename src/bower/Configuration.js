/*
 * Copyright (c) 2014 Narciso Jaramillo. All rights reserved.
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
maxerr: 50, browser: true */
/*global define, brackets */

define(function (require, exports) {
    "use strict";

    var PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        ProjectManager     = brackets.getModule("project/ProjectManager"),
        FileBower          = brackets.getModule("file/FileUtils"),
        FileSystem         = brackets.getModule("filesystem/FileSystem"),
        FileUtils          = require("src/utils/FileUtils"),
        Event              = require("src/events/Events"),
        EventEmitter       = require("src/events/EventEmitter"),
        Bower              = require("src/bower/Bower");

    var FILE_NAME = ".bowerrc";

    var cacheConfig = null;

    function _getDefaultDirectory(path) {
        if (!path) {
            path = ProjectManager.getProjectRoot().fullPath;
        }

        return path;
    }

    /**
     * Creates the default configuration based on those settings defined
     * in brackets preferences.
     * @param {object=} config Configuration object.
     */
    function _createDefaultConfiguration(config) {
        var proxy = PreferencesManager.get("proxy");

        cacheConfig = config || {};

        if (proxy) {
            cacheConfig.proxy = proxy;
            cacheConfig.httpsProxy = proxy;
        }
    }

    /**
     * Gets the default configuration. If the configuration is not cached, it
     * creates it and then return it.
     * @returns {Object} Configuration object
     */
    function getDefaultConfiguration() {
        if (!cacheConfig) {
            _createDefaultConfiguration();
        }

        return cacheConfig;
    }

     /**
     * Checks if the bowerrc json file exists in the given directory. If the directory
     * is not set, the root project directory is taken as the default directory.
     * @param {path=} path
     * @return {Promise}
     */
    function exists(path) {
        path = (path || _getDefaultDirectory()) + FILE_NAME;

        return FileUtils.exists(path);
    }

    /**
     * Create the ".bowerrc" file for the given path. If the path is not provided, it will
     * take the current directory path as default.
     * @param {string=} path
     * @return {Promise}
     */
    function create(path) {
        var defaultConfiguration = {
            directory: "bower_components/",
            interactive: false
        };
        var content = JSON.stringify(defaultConfiguration, null, 4);

        path = (path || _getDefaultDirectory()) + FILE_NAME;

        return FileUtils.createFile(path, content);
    }

    /**
     * Delete the ".bowerrc" located at the given path. If the path is not provided, it will
     * delete the ".bowerrc" file from the root project.
     * @param {string=} path
     * @return {Promise}
     */
    function remove(path) {
        path = (path || _getDefaultDirectory()) + FILE_NAME;

        return FileUtils.deleteFile(path);
    }

    /**
     * Open the ".bowerrc" file in the editor.
     * @param {string} configFilePath The absolute path of the configuration file.
     */
    function open(configFilePath) {
        FileUtils.openInEditor(configFilePath);
    }

    /**
     * Reload the configuration.
     * @param {string} configFilePath The absolute path root directory.
     */
    function reload(path) {
        path = path || _getDefaultDirectory();
        // TODO: this function should be replaced by a call to "reload" the default preferences
        // on bower.
        // TODO: expose a reload configuration API from bower module
        Bower.getConfiguration(path).done(function (configuration) {
            cacheConfig = configuration;
        });
    }

    /**
     * Load the content of the configurationfile
     *
     * @param  {string} path [description]
     *
     * @return {object}      Contant of the config file
     */
    function loadBowerJson( path ) {
        path = (path || _getDefaultDirectory()) + FILE_NAME;

        var file = FileSystem.getFileForPath( path );
        var result = FileBower.readAsText( file, 'utf8' );
        return result;
    }

    /**
     * Callback when the default preferences change. If the "proxy" preference has changed,
     * create the default configuration with the new value.
     * @param {Array} preferencesChanged Array of preferences keys that could have changed.
     */
    function _onPreferencesChange(preferencesChanged) {
        if (!cacheConfig) {
            return;
        }

        var indexProxy = preferencesChanged.indexOf("proxy");

        if (indexProxy !== -1) {
            var proxy = PreferencesManager.get("proxy");

            if (cacheConfig.proxy !== proxy) {
                _createDefaultConfiguration(cacheConfig);
            }
        }
    }

    function _init() {

        EventEmitter.on(Event.BOWER_BOWERRC_CHANGE, function () {
            reload();
        });

        EventEmitter.on(Event.BOWER_BOWERRC_DELETE, function () {
            reload();
        });

        PreferencesManager.on("change", function (event, data) {
            _onPreferencesChange(data.ids);
        });
    }

    _init();

    exports.exists                  = exists;
    exports.create                  = create;
    exports.remove                  = remove;
    exports.open                    = open;
    exports.reload                  = reload;
    exports.getDirectory            = _getDefaultDirectory;
    exports.loadBowerJson           = loadBowerJson;
    exports.getDefaultConfiguration = getDefaultConfiguration;
});

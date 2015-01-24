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
maxerr: 50, browser: true */
/*global define, brackets */

define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils    = brackets.getModule("utils/ExtensionUtils"),
        CommandManager    = brackets.getModule("command/CommandManager"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        Menus             = brackets.getModule("command/Menus"),
        AppInit           = brackets.getModule("utils/AppInit"),
        StringUtils       = brackets.getModule("utils/StringUtils");

    // local modules
    var Bower            = require("src/bower/Bower"),
        GitChecker       = require("src/bower/GitChecker"),
        ErrorManager     = require("src/ErrorManager"),
        QuickInstall     = require("src/QuickInstall"),
        PanelView        = require("src/PanelView"),
        FileSystemEvents = require("src/events/FileSystemEvents"),
        Strings          = require("strings");

    var EXTENSION_NAME         = "com.adobe.brackets.extension.bower",
        CMD_INSTALL_FROM_BOWER = "com.adobe.brackets.commands.bower.installFromBower",
        CMD_BOWER_CONFIG       = "com.adobe.brackets.commands.bower.toggleConfigView",
        KEY_INSTALL_FROM_BOWER = "Ctrl-Alt-B";

    function _checkRequirements () {
        GitChecker.findGitOnSystem()
            .fail(function () {
                PanelView.setStatus(PanelView.bowerStatus.WARNING);

                ErrorManager.showWarning(Strings.GIT_NOT_FOUND_TITLE, Strings.GIT_NOT_FOUND_DESCRIPTION);
            });
    }

    function init() {
        ExtensionUtils.loadStyleSheet(module, "assets/styles.css");

        var configCmd = CommandManager.register(Strings.TITLE_BOWER, CMD_BOWER_CONFIG, PanelView.toggle),
            installCmd = CommandManager.register(Strings.TITLE_SHORTCUT, CMD_INSTALL_FROM_BOWER, QuickInstall.quickOpenBower),
            fileMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);

        fileMenu.addMenuDivider();
        fileMenu.addMenuItem(installCmd);
        fileMenu.addMenuItem(configCmd);

        KeyBindingManager.addBinding(CMD_INSTALL_FROM_BOWER, {
            key: KEY_INSTALL_FROM_BOWER
        });

        var bowerDomainPath = ExtensionUtils.getModulePath(module, "node/BowerDomain");

        Bower.init(bowerDomainPath);

        QuickInstall.init();

        PanelView.init(EXTENSION_NAME, CMD_BOWER_CONFIG);

        _checkRequirements();
    }

    init();

    AppInit.appReady(FileSystemEvents.init);
});

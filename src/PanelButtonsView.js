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

define(function (require, exports) {
    "use strict";

    var buttonsTemplate  = require("text!../templates/panel-buttons.html"),
        Strings            = require("../strings"),
        ConfigurationView  = require("./ConfigurationView"),
        InstalledView      = require("./InstalledView"),
        QuickInstall       = require("./QuickInstall");
        // BowerConfiguration = require("src/bower/Configuration");
        // Bower              = require("src/bower/Bower");

    var $panelSection;

    function render($container) {
        $panelSection = $container;

        /**
         * Eventhandling for the deletebutton of the package row.
         *
         * @param  {object} event 
         *
         * @return {void}
         */
        function _onShowConfig (event) {
            InstalledView.hide();
            ConfigurationView.hide();
            ConfigurationView.show();
        }

        /**
         * Eventhandling for the updatebutton of the package row.
         *
         * @param  {object} event 
         *
         * @return {void}
         */
        function _onShowInstalled() {
            ConfigurationView.hide();
            InstalledView.hide();
            InstalledView.show();
        }

        function _onShowInstall() {
            QuickInstall.quickOpenBower();
        }

        $panelSection
            .on("click", "[data-bower-button-action='show-configuration']", _onShowConfig)
            .on("click", "[data-bower-button-action='show-installed']", _onShowInstalled)
            .on("click", "[data-bower-button-action='install-package']", _onShowInstall);

        showButtons();
    }

    function _getViewData () {
        return {
            Strings: Strings
        };
    }


    function showButtons() {
        var data = _getViewData(),
            sectionHtml;

        sectionHtml = Mustache.render(buttonsTemplate, data);

        $panelSection.append(sectionHtml);
    }

    function hide() {
        $panelSection.empty();
    }

    exports.render = render;
    exports.show   = showButtons;
    exports.hide   = hide;
} );

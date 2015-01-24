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

    var installedTemplate  = require("text!../templates/installed.html"),
        Strings            = require("../strings"),
        BowerConfiguration = require("src/bower/Configuration"),
        Bower              = require("src/bower/Bower");

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
        function _onDeleteClick (event) {
            event.stopPropagation();

            /*jshint validthis:true */
            var name = $(this).data("name");
            var row  = $( 'tr[data-bower-dependency=' + name + ']' );

            var path = BowerConfiguration.getDirectory();

            Bower.uninstall(path, name)
                .done(function () {
                    row.remove();
                })
                .fail(function (error) {
                    // TODO warn the user
                    console.log( 'error unistall' );
                    console.log( arguments );
                });
        }

        $panelSection
            .on("click", "[data-bower-installed-action='delete']", _onDeleteClick);
    }

    function _getViewData () {
        return {
            Strings: Strings,
            dependencies: []
        };
    }

    function showInstalled() {
        var data = _getViewData(),
            sectionHtml;

        BowerConfiguration.loadBowerJson()
            .done(function( file ) {
                var tmp = JSON.parse(file);

                _.each( tmp.dependencies, function( val, key) {
                    data.dependencies.push({name: key, version: val});
                    }); 
            })
            .always(function () {
                sectionHtml = Mustache.render(installedTemplate, data);
                $panelSection.append(sectionHtml);
            });
    }

    function hide () {
        $panelSection.empty();
    }

    exports.render = render;
    exports.show   = showInstalled;
    exports.hide   = hide;
});

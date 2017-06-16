/**
 * 焦点处理
 * @author Leo
 */
"use strict";
var $ = require("jquery");


function FocusHandler(options) {
    return this.init(options);
}

FocusHandler.prototype = {
    constructor: FocusHandler,
    init: function(options) {
        options = options || {};
        var root = $(options.root || document);
        this.args = options;
        this.root = root;
        this.ready();
    },
    ready: function() {
        var root = this.root;
        var components = this.components;

        if (!components.length) { //全局只绑定一次
            root.on("click.focus-handler", _focusHandler);
        }

        function _focusHandler(event) {
            var target = event.target;

            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                var callbacks = component.callbacks || {};

                if (!_contain(component.container, target) && !component.input.is(target) && !_contain(component.input, target)) {
                    // if (component.callback) {
                    //     component.callback.call(component, target);
                    // } else {
                    //     component.container.hide();
                    // }
                    component.container.hide();
                    component.callback && component.callback.call(component, target);
                    if (callbacks) {
                        callbacks.blur && callbacks.blur.call(component, target);
                    }
                } else {
                    if (callbacks) {
                        callbacks.focus && callbacks.focus.call(component, target);
                    }
                }
            }
        }

        function _contain(doms, target) {
            var len = doms.length;
            var contain = false;
            for (var i = 0; i < len; i++) {
                if ($.contains(doms[i], target)) {
                    contain = true;
                    break;
                }
            }
            return contain;
        }
    },
    add: function(component) {
        var hash = Math.random().toString(32).substr(2);
        component.__hash = hash;
        this.components.push(component);
    },
    remove: function(id) {
        var coms = this.components;
        for (var i = 0; i < coms.length; i++) {
            var com = coms[i];
            if (id && id === com.id) {
                coms.splice(i, 1);
                break;
            }
        }
    },
    components: [] //公用一个
};


module.exports = FocusHandler;
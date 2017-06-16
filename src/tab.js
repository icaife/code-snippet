/**
 * @description tabs module
 * @author Leon
 */

"use strict";
var $ = require("jquery");

/*tab插件*/
var Tabs = function() {
    this.init.apply(this, arguments);
};

Tabs.prototype = {
    constructor: Tabs,
    /**
     * init
     * @param  {Object} opts options  see defaults
     * @return {Object} return this
     */
    init: function(opts) {
        var args = this.args = $.extend(true, {}, this.defaults, opts);
        var container = $(args.container);

        this.container = container;
        this.tabNavs = container.find(args.tabNav);
        this.tabBodys = container.find(args.tabBody);
        this.bindEvent();
        this.focus(args.curIndex);
        // console.log(opts);
        return this;
    },
    bindEvent: function() {
        var that = this;
        var args = that.args;
        var container = that.container;
        var evtType = args.eventType;
        var timmer = 0;

        /*click tab nav*/
        container.on(evtType, args.tabNav, function(ev) {
            var _this = $(this);
            var index = _this.index();
            that.focus(index, ev);
        }).on("mouseenter", function() {
            args.autoplay && _stop();
        }).on("mouseleave", function() {
            args.autoplay && _play();
        });

        /*auto play*/
        if (args.autoplay) {
            _play();
        }

        function _play() {
            _stop();
            var total = that.tabBodys.length;
            timmer = setInterval(function() {
                if (that.curIndex >= total - 1) {
                    that.curIndex = -1;
                }
                that.focus(that.curIndex + 1);
            }, args.interval);
        }

        function _stop() {
            clearInterval(timmer);
        }
    },
    focus: function(index) {
        var that = this;
        var args = that.args;
        var tabNavs = this.tabNavs;
        var tabBodys = this.tabBodys;
        var curCls = args.curClass;
        var curTab = tabNavs.eq(index);
        var curBody = tabBodys.eq(index);

        this.curIndex = index;
        curTab.addClass(curCls).siblings("." + curCls).removeClass(curCls);
        curBody.addClass(curCls).siblings("." + curCls).removeClass(curCls);
        args.focus.call(this, index, curTab, curBody);
    },
    fetch: function() {

    },
    render: function() {

    },
    destory: function() {
        var container = this.container;
        var args = this.args;

        container.off(args.eventType);
        container.remove();
        args.destory.call(this);
    },
    defaults: {
        container: ".tabs",
        tabNav: ".tab-nav-item",
        tabBody: ".tab-body-item",
        curClass: "tab-item-cur",
        curIndex: 0,
        autoplay: false,
        interval: 5000, //ms
        eventType: "click",
        focus: function() {

        }
    }
};

Tabs.defaults = Tabs.prototype.defaults;

$.fn.tabs = function(o) {
    var args = o || {};
    var dataKey = "tab-instance";
    this.each(function() {
        var _this = $(this);

        if (_this.data(dataKey)) {
            return;
        }

        args.container = _this;

        var tab = new Tabs(args);

        _this.data(dataKey, tab);
    });
    return this;
};
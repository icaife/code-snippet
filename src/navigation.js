/**
 * @description navigation module
 * @author Leon
 */

"use strict";
var $ = require("jquery");

/*navigation*/
var Navs = function() {
    return this.init.apply(this, arguments);
};

Navs.prototype = {
    constructor: Navs,
    init: function(opts) {
        var that = this;
        var args = that.args = $.extend(true, {}, that.defaults, opts);

        /*nav box*/
        that.navBox = $(args.navBox);
        that.navs = that.navBox.find(args.navItem);

        this.calculate();
        that.bindEvent();
    },
    focus: function(id, sibs) {
        var that = this;
        var args = that.args;
        var navCurClass = args.navCur;
        var cache = that._cache;
        var anchor = cache.anchors[id];

        if (!anchor) {
            that.navs.removeClass(navCurClass);

            $.each(cache.anchors, function() {
                this.content.removeClass(contentCurClass);
            });

            return false;
        }

        var contentCurClass = args.contentCur;

        that.navs.removeClass(navCurClass);
        anchor.dom.addClass(navCurClass);

        $.each(cache.anchors, function() {
            this.content.removeClass(contentCurClass);
        });

        anchor.content.addClass(contentCurClass);

        args.focus.call(that, anchor, anchor.content, sibs || []);

        return anchor;
    },
    scroll: function(id) {
        var that = this;
        var args = that.args;
        var threshold = args.threshold;
        var context = $("html,body");
        var anchor = that.focus(id);

        anchor && context.animate({
            scrollTop: anchor.top - threshold
        }, args.speed || "fast", function() {
            args.hash && (window.location.hash = id);
        });
    },
    bindEvent: function() {
        var that = this;
        var args = that.args;
        var threshold = args.threshold;
        var win = $(window);

        that.navBox.on(args.eventType, args.navItem, function(evt) {
            var _this = $(this);
            var id = _this.attr("href");
            that.scroll(id);
            evt.preventDefault();
        }).on("content-changed.navs", function() {
            that.calculate();
        });

        var _timmer = 0;
        win.on("scroll", function() {
            clearTimeout(_timmer);

            _timmer = setTimeout(function() {
                var cache = that._cache;
                var _cacheWin = cache.win;
                var _scrollTop = _cacheWin.dom.scrollTop();
                var _winHeight = _cacheWin.height;
                var _cacheAnchors = cache.anchors;
                var _anchor = null;
                var _middleLine = _scrollTop + _winHeight / 2;
                var _topLine = _middleLine - threshold;
                var _bottomLine = _middleLine + threshold;
                var _available = []; //available in view navs
                var _tmp = [];

                for (var anchorId in _cacheAnchors) {
                    _anchor = _cacheAnchors[anchorId];
                    var _anchorTop = _anchor.top;
                    var _anchorBottom = _anchor.top + _anchor.height;

                    if (
                        (_anchorTop <= _topLine && _anchorBottom >= _bottomLine) ||
                        (_anchorTop <= _topLine && _anchorBottom >= _topLine) ||
                        (_anchorTop >= _topLine && _anchorBottom <= _bottomLine) ||
                        (_anchorTop >= _topLine && _anchorTop <= _bottomLine)
                    ) {
                        _available.push(_anchor);
                    }

                    _tmp.push(_anchor);
                }

                if (_available.length) {
                    $.each(_available.sort(function(a, b) {
                        var ay = Math.abs(_middleLine - a.top);
                        var by = Math.abs(_middleLine - b.top);

                        return by - ay;
                    }).slice(0, 1), function() {
                        that.focus(this.id, _available.slice(1));
                    });
                    args.autoShow && that.navBox.fadeIn("fast");
                } else if (args.autoHide) {
                    _tmp.sort(function(a, b) {
                        return a.index - b.index;
                    });
                    var firstSection = _tmp[0];
                    var lastSection = _tmp[_tmp.length - 1];

                    if (firstSection && lastSection) {
                        var top = firstSection.top;
                        var bottom = lastSection.top + lastSection.height;

                        // less than first section top or more than last section bottom 
                        if (_topLine < top || _bottomLine > bottom) {
                            that.navBox.fadeOut("fast");
                        }
                    }
                }
            }, args.scrollDelay);

        }).on("resize", function() {
            that.calculate();
        }).trigger("scroll");

    },
    update: function() {
        this.calculate();
        $(window).trigger("scroll resize");
    },
    calculate: function() {
        var that = this;
        var win = $(window);
        var result = {
            anchors: {},
            win: {
                width: win.width(),
                height: win.height(),
                dom: win
            }
        };
        var navs = this.navs;

        navs.each(function(index) {
            /*anchor id*/
            var _this = $(this);
            var id = _this.attr("href");

            if (!id) {
                return;
            }

            var content = $(id);

            if (content.length) {
                var offset = content.offset();
                result.anchors[id] = {
                    top: offset.top,
                    left: offset.left,
                    width: +content.css("width").replace(/px$/, ""),
                    height: +content.css("height").replace(/px$/, ""),
                    dom: _this,
                    content: content,
                    id: id,
                    index: index
                };
            }
        });

        that._cache = result;
        return result;
    },
    fetch: function() {

    },
    render: function() {

    },
    destory: function() {

    },
    defaults: {
        eventType: "click touchend",
        navBox: ".nav-box",
        navItem: "a",
        threshold: 0,
        speed: 300,
        scrollDelay: 200,
        hash: true,
        navCur: "nav-item-cur",
        contentCur: "content-item-cur",
        autoHide: true, //auto hide when not in any section
        autoShow: true, //auto show when in any section
        focus: function() {

        }
    }
};

Navs.defaults = Navs.prototype.defaults;
Navs.instanceKey = "nav-instance";

$.fn.navs = function(o) {
    var args = o || {};
    var dataKey = Navs.instanceKey;
    this.each(function() {
        var _this = $(this);

        if (_this.data(dataKey)) {
            return;
        }

        args.navBox = _this;

        var nav = new Navs(args);

        _this.data(dataKey, nav);
    });
    return this;
};
/**
 * @description 第三方js
 * @author Leon.Cai
 */

/**
 * 模块划分:
 *     TFF_THIRD
 *         |-util
 *         |-dom
 *         |-page
 *         |-push
 *         |-event
 */

(function(window, factory) {
    var DEBUG_FLAG = "TFF_THIRD_DEBUG",
        DATA_LAYER = "TFF_THIRD_DATA_LAYER",
        NAME = "TFF_THIRD";

    var instance = window[NAME],
        dataLayer = window[DATA_LAYER] = window[DATA_LAYER] || [];

    if (instance && instance.loaded) { //loaded,just return
        return false;
    }

    instance.debug = window.location.hash === ("#" + DEBUG_FLAG);

    var third = window[NAME] = factory(window, document, instance),
        scripts = getScripts(third.page),
        util = third.util,
        event = third.event;

    //load scripts
    util.loadScript(scripts, function() {
        event.emit("load", "加载成功0");
        event.emit("load", "加载成功1");
    });

    event.once("load", function(data) {
        console.log(data);
    });

    /**
     * @description get scripts
     */
    function getScripts(page) {

        var data = page.data,
            scripts = {
                /**
                 * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/
                 * @see https://developers.google.com/analytics/devguides/collection/upgrade/reference/gajs-analyticsjs
                 */
                "google.analytics": {
                    src: "//www.google-analytics.com/analytics" + (page.debug ?
                        "_debug" : "") + ".js",
                    account: {
                        pc: "UA-31212870-1",
                        mobile: "UA-31212870-2",
                        pinyin: "UA-31212870-6"
                    },
                    scope: {
                        platform: /./, //all platforms
                        page: /./ //all page
                    },
                    before: function() {
                        var gaName = "GA",
                            win = window;

                        win["GoogleAnalyticsObject"] = gaName;
                        var ga = win[gaName] = win[gaName] || function() {
                            (win[gaName].q = win[gaName].q || []).push(arguments)
                        };
                        win[gaName].l = +new Date();

                        //send event
                        ga("create", this.account[page.platform], "auto");
                        ga("send", "pageview");

                        if (/order/.test(page.type)) { //if order ,require ecommerce plugin
                            /**
                             * @see https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce
                             */
                            ga("require", "ecommerce");
                        }
                    }
                },
                /**
                 * @see https://support.google.com/tagmanager/?hl=zh-Hans#topic=3441530
                 */
                "google.tag-manager": {
                    src: "//www.googletagmanager.com/gtm.js?id=GTM-MZNNRG&l=" + DATA_LAYER,
                    scope: {
                        platform: /./, //all platforms
                        page: /./ //all page
                    },
                    before: function() {

                    }
                },
                /**
                 * @see https://developers.google.com/adwords-remarketing-tag/parameters
                 */
                "google.adwords.remarketing": {
                    src: "" /*"//www.googleadservices.com/pagead/conversion.js"*/ ,
                    account: {
                        pc: 939794248
                    },
                    scope: {
                        platform: /./, //all platforms
                        page: /./ //all page
                    },
                    // html: "<noscript>" +
                    //     "<div style=\"display:inline;\">" +
                    //     "<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"//googleads.g.doubleclick.net/pagead/viewthroughconversion/939794248/?guid=ON&amp;script=0\"/>" +
                    //     "</div></noscript>",
                    before: function() {
                        var map = {
                            home: "home",
                            list: "searchresults",
                            detail: "offerdetail",
                            other: "other",
                            order: "conversionintent",
                            payment: "conversion",
                            undefined: "other"
                        };

                        var params = {
                            dynx_itemid: "", //product id
                            dynx_itemid2: "", //product id 2
                            dynx_pagetype: map[page.type], //page type
                            dynx_totalvalue: 0, //total price
                            travel_destid: "", //dest id
                            travel_originid: "", //start id
                            travel_startdate: "", //start date
                            travel_enddate: "", //end date
                            travel_pagetype: map[page.type], //page type
                            travel_totalvalue: 0 //total price
                        }

                        if (page.type === "detail") {
                            var product = page.data.product;

                            if (product) {
                                params.dynx_itemid = product.productId;
                                params.travel_totalvalue = params.travel_totalvalue = product.price;
                            }
                        }

                        util.extend(window, {
                            google_tag_params: params,
                            google_conversion_id: this.account.pc,
                            google_custom_params: params,
                            google_remarketing_only: true
                        });

                        window[DATA_LAYER].push({
                            "google.adwords.remarketing": params
                        });
                    }
                },
                // "google.adwords.conversion": {
                //     src: "//www.googleadservices.com/pagead/conversion.js",
                //     account: {
                //         pc: 939794248
                //     },
                //     scope: {
                //         platform: /./,
                //         page: /./
                //     },
                //     // html: "<noscript>" +
                //     //     "<div style=\"display:inline;\">" +
                //     //     "<img height=\"1\" width=\"1\" style=\"border-style:none;\" alt=\"\" src=\"//www.googleadservices.com/pagead/conversion/939794248/?label=sWS1CLH96mAQyL6QwAM&amp;guid=ON&amp;script=0\"/>" +
                //     //     "</div></noscript>",
                //     before: function() {
                //         var google_conversion_id = window.google_conversion_id = this.account.pc;
                //         var google_conversion_label = window.google_conversion_label = "sWS1CLH96mAQyL6QwAM";
                //         var google_remarketing_only = window.google_remarketing_only = false;
                //     }
                // },
                "criteo": {
                    src: "//static.criteo.net/js/ld/ld.js",
                    account: {
                        pc: 22739
                    },
                    scope: {
                        platform: /./,
                        page: /./
                    },
                    before: function() {
                        var criteo_q = window.criteo_q = window.criteo_q || [];

                        criteo_q.push({
                            event: "setAccount",
                            account: this.account.pc
                        }, {
                            event: "setHashedEmail",
                            email: "test@toursforfun.com"
                        }, {
                            event: "setSiteType",
                            type: page.platform === "pc" ? "d" : "m"
                        });
                    }
                },
                "bi": {
                    src: "https://bi.toursforfun.com/ta.js",
                    scope: {
                        platform: /./,
                        page: /./
                    }
                },
                "baidu.push": {
                    src: page.protocol === "http" ? "http://push.zhanzhang.baidu.com/push.js" : "https://zz.bdstatic.com/linksubmit/push.js",
                    scope: {
                        platform: /./,
                        page: /./
                    }
                },
                "baidu.cpro": {
                    src: "//cpro.baidu.com/cpro/ui/rt.js",
                    before: function() {
                        var bd_cpro_rtid = window.bd_cpro_rtid = window.bd_cpro_rtid || [];

                        bd_cpro_rtid.push({
                            id: "nW0snWnL"
                        });
                    },
                    scope: {
                        platform: /./,
                        page: /./
                    }
                },
                "baidu.hm": {
                    src: "//hm.baidu.com/hm.js?" + (page.platform === "pinyin" ? "748445d6a97b015fc357b115fb3cb13e" : "ed2f1880a0adca8fff9b63d94cd62442"),
                    before: function() {
                        var bd_cpro_rtid = window.bd_cpro_rtid = window.bd_cpro_rtid || [];

                        bd_cpro_rtid.push({
                            id: "nW0snWnL"
                        });
                    },
                    scope: {
                        platform: /./,
                        page: /./
                    }
                },
                "mediav": {
                    src: page.protocol === "http" ? "http://static.mediav.com/mvl.js" : "https://static-ssl.mediav.com/mvl.js",
                    scope: {
                        platform: /./,
                        page: /./
                    }
                },
                "sift-science": {
                    src: "//cdn.siftscience.com/s.js",
                    scope: {
                        platform: /./,
                        page: /./
                    },
                    account: {
                        pc: "cc2794deda"
                    },
                    before: function() {
                        var _sift = window._sift = window._sift || [];

                        _sift.push(["_setAccount", this.account.pc]);
                        _sift.push(["_setUserId", window.CLIENTSTATUS && window.CLIENTSTATUS.uid || ""]); //TODO
                        _sift.push(["_setSessionId", [document.cookie.match(/PHPSESSID=([^;]+)/) || []][0][1] || ""]);
                        _sift.push(["_trackPageview"]);
                    }
                }
            },
            result = [];

        for (var key in scripts) {
            var item = scripts[key],
                scope = item.scope;

            if (scripts.hasOwnProperty(key) && scope.platform.test(page.platform) && scope.page.test(page.type)) {
                result.push(item);
            }
        }

        return result;
    }

}(this, function(window, document, custom) {
    var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement,
        baseElement = head.getElementsByTagName("base")[0];

    /**
     * util module
     * @type {Object}
     */
    var util = {
        /**
         * extend
         * @return {[type]} [description]
         */
        extend: function extend() {
            var args = [].slice.call(arguments);
            var result;

            if (args[0] === true) {
                result = {};
            } else {
                result = args[0] || {};
            }

            for (var i = 1; i < args.length; i++) {
                var attrs = args[i] || {};

                for (var key in attrs) {
                    result[key] = attrs[key];
                }
            }

            return result;
        },
        /**
         * load file
         * @param  {[type]}   src      [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        loadFile: function loadFile(src, callback, error) {
            if (!src) {
                return false;
            }

            var node = document.createElement("script"),
                id = "J-tff-third-write",
                writeContainer = null,
                docWrite = document.write,
                body = document.body;

            if (!(writeContainer = document.getElementById(id))) {
                writeContainer = document.createElement("i");
                writeContainer.id = id;

                body && body.appendChild(writeContainer);
            }

            document.write = function(html) {
                var c = document.createElement("b");

                c.innerHTML = html;
                writeContainer.appendChild(c);
            };

            node.async = true;
            node.onload = node.onerror = onreadystatechange = function() {
                if (/loaded|complete/.test(this.readyState || "loaded" /*firefox*/ )) {
                    util.isFunction(callback) && callback(node);
                }

                node.onload = node.onerror = onreadystatechange = null;
                setTimeout(function() {
                    document.write = docWrite;
                }, 20);
            };

            node.src = src;

            baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);
        },
        /**
         * [loadScript description]
         * @param  {Array|Object|String}   src      [description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        loadScript: function loadScript() {
            var args = [].slice.apply(arguments),
                script = args[0],
                callback = (util.isFunction(args[args.length - 1]) && args.splice(-1, 1)[0]) || util.noop;

            if (!loadScript) {
                return;
            }

            if (args.length > 1) {
                loadScript(args, callback);
            } else {
                if (util.type(script) === "string") {
                    util.loadFile(script, callback);
                } else if (util.type(script) === "object") {
                    util.isFunction(script.before) && script.before();
                    loadScript(script.src, function() {
                        util.isFunction(script.callback) && script.callback();
                        callback();
                    });

                    if (!script.src) {
                        callback();
                    }
                } else if (util.type(script) === "array") {
                    var count = 0;
                    for (var i = 0, len = script.length; i < len; i++) {
                        var item = script[i];

                        loadScript(item, function() {
                            if (++count === len) {
                                callback();
                            }
                        });

                    }
                }
            }
        },
        /**
         * get original type
         * @param  {[type]} o [description]
         * @return {[type]}   [description]
         */
        type: function type(o) {
            return ({}).toString.call(o).match(/\s([^\]]+)/)[1].toLowerCase();
        },

        /**
         * is function
         * @param  {[type]}  f [description]
         * @return {Boolean}   [description]
         */
        isFunction: function isFunction(f) {
            return util.type(f) === "function";
        },
        /**
         * each function
         * @param  {[type]}   o  [description]
         * @param  {Function} cb [description]
         * @return {[type]}      [description]
         */
        each: function each(o, cb) {
            if (util.type(o) === "object") {
                for (var key in o) {
                    var item = o[key];

                    if (o.hasOwnProperty(key)) {
                        var flag = cb.apply(item, [key, item]);

                        if (flag === false) {
                            break;
                        }
                    }
                }
            } else if (util.type(o) === "array") {
                for (var i = 0, len = o.length; i < len; i++) {
                    var item = o[i];

                    var flag = cb.apply(item, [i, item]);

                    if (flag === false) {
                        break;
                    }
                }
            }
        },
        /**
         * noop function
         * @return {[type]} [description]
         */
        noop: function noop() {

        }
    };

    /**
     * dom module
     * @type {Object}
     */
    var dom = {
        /**
         * get element by id
         * @param  {String} id [description]
         * @return {DOM|null}    [description]
         */
        getById: function(id) {
            return document.getElementById(id);
        },
        /**
         * get elements by tag name
         * @param  {String} tag [description]
         * @return {DOM|null}     [description]
         */
        getByTag: function(tag) {
            return document.getElementsByTagName(tag);
        },
        /**
         * bind event for dom
         * @param  {DOM} dom       [description]
         * @param  {String} eventType [description]
         * @param  {String|Function} handler   String:delegate Function:event handler
         * @return {DOM}           [description]
         */
        bind: function(dom, eventType, handler, delegateHandler) {
            if (!dom) {
                return;
            }

            var selector = handler;

            handler = delegateHandler || handler || util.noop;

            if (dom.addEventListener) {
                dom.addEventListener(eventType, handler
                    /*function(event) {
                                        proxyHandler(handler, arguments, event, this);
                                    }*/
                    , false);
            } else if (dom.attachEvent) {
                dom.attachEvent("on" + eventType, handler
                    /*function(event) {
                                        proxyHandler(handler, arguments, event, this);
                                    }*/
                );
            }

            // function proxyHandler(fn, args, event, ctx) {
            //     var target = event.target;

            //     if (util.type(selector) === "string") {
            //         var flag =
            //             (/^\#/.test(selector) && (target.id || "").search(selector.substr(1)) > -1) || //id selector
            //             (/^\./.test(selector) && (target.className || "").search(selector.substr(1)) > -1) || //class selector
            //             (/^[a-zA-Z]/.test(selector) && target.tagName === selector); //tag selector
            //         console.log((/^\#/.test(selector) && (target.id || "").search(selector.substr(1)) > -1), (/^\./.test(selector) && (target.className || "").search(selector.substr(1)) > -1), (/^[a-zA-Z]/.test(selector) && target.tagName === selector));
            //         if (!flag) {
            //             return;
            //         }
            //     }

            //     fn.apply(ctx, [event].concat([].slice.call(args)));
            // }
        },
        fire: function(dom, eventType, handler) {
            if (!dom) {
                return;
            }

            if (dom.removeEventListener) {
                dom.removeEventListener(eventType, handler, false);
            } else if (dom.detachEvent) {
                dom.detachEvent("on" + eventType, handler);
            }
        }
    };

    /**
     * @description get page info
     */
    function page(custom) {
        var pageMap = {
                home: "home",
                list: "list",
                detail: "detail",
                cart: "cart",
                payment: "payment",
                order: "order",
                other: "other"
            },
            custom = page.custom(custom),
            defaults = {
                platform: /tufengwang/.test(window.location.hostname) ? "pinyin" : (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(window.navigator.userAgent) ? "mobile" : "pc",
                protocol: window.location.protocol.replace(/[^\w]/g, ""),
                type: pageMap.other
            },
            pageInfo = util.extend(true, defaults, custom);

        pageInfo.data = pageInfo.data || {};

        return pageInfo;
    }

    /**
     * get custom params in page
     * @param  {[type]} o [description]
     * @return {[type]}   [description]
     */
    page.custom = function custom(custom) {
        if (!custom) {
            return {};
        }

        var oriType = util.type(custom);

        if (oriType === "array") {
            var result = {};

            util.each(custom, function() {
                util.extend(result, this);
            });

            return result;
        } else if (oriType === "object") {
            return custom;
        }

        return {};
    }

    function push() {

    }

    /**
     * event emitter
     * @param  {String} eventType [description]
     * @param  {Function} handler   [description]
     * @param  {String} key   for find handler
     * @return {[type]}           [description]
     */
    function event(eventType, handler, key) {
        // event.on(eventType, handler, key);
    }

    event.events = {};
    event.uuid = 0;
    /**
     * event on
     * @param  {String} eventType [description]
     * @param  {Function} handler   [description]
     * @param  {String} key       [description]
     * @param  {Number} times     [description]
     * @return {[type]}           [description]
     */
    event.on = function(eventType, handler, key, times) {
        if (arguments.length < 2) {
            return;
        }

        var events = this.events,
            items = events[eventType];

        if (!items) {
            items = events[eventType] = [];
        }

        if (key) {
            handler.key = key;
        }

        items.push({
            handler: handler,
            times: times > 0 ? times : -1,
            uuid: key || this.uuid++ //if no key
        });

        return this;
    };
    /**
     * event once
     * @param  {String} eventType [description]
     * @param  {Function} handler   [description]
     * @return {[type]}           [description]
     */
    event.once = function(eventType, handler) {
        this.on(eventType, handler, this.uuid++, 1);
        return this;
    };

    /**
     * @param  {[type]} eventType [description]
     * @param  {[type]} handler   [description]
     * @return {[type]}           [description]
     */
    event.emit = function(eventType) {
        var that = this,
            events = this.get(eventType),
            args = [].slice.call(arguments, 1);

        events && util.each(events, function(index, item) {
            item.handler.apply(item, args);
            item.times > 0 && item.times--;

            if (item.times == 0) {
                that.off(eventType, item.uuid);
            }
        });

        return this;
    };

    /**
     * event get
     * @param  {String} eventType [description]
     * @param  {String|Function} key or handler       [description]
     * @return {[type]}           [description]
     */
    event.get = function(eventType, key) {
        var events = this.events,
            items = events[eventType],
            result = items;

        if (key) {
            util.each(items, function(index, item) {
                if (item.uuid === key || item.handler === key) {
                    result = item;
                    return false;
                }
            });
        }

        return result || null;
    };

    /**
     * event off
     * @param  {String} eventType [description]
     * @param  {Function|String} handler or key
     * @return {[type]}           [description]
     */
    event.off = function(eventType, handler) {
        var that = this;
        if (!arguments.length) { //clear all event
            that.events = {};
        } else if (arguments.length === 1) { //clear all eventEvent
            var items = that.get(eventType);

            items.length = 0;
        } else {
            var items = this.get(eventType);

            if (items) {
                util.each(items, function(index, item) {
                    if (item.uuid === handler || item.handler === handler) {
                        items.splice(index, 1);
                        return false;
                    }
                });
            }
        }

        return this;
    };

    return {
        util: util,
        dom: dom,
        event: event,
        page: page(custom),
        loaded: true,
        push: push
    };
}));

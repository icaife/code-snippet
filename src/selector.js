"use strict";
var $ = require("jquery");

function Selector() {
    return this.init.apply(this, arguments);
}

$.extend(Selector.prototype, {
    init: function(args) {
        var that = this;

        //数组，用于存储已经选择的项目
        that.data = [];
        args = that.args = $.extend(true, {}, that.defaults, args);
        that.options = args.options;

        var select = args.select;
        var except = that.except = args.except;
        var must = that.must = args.must;

        that.select(select);
        that.select(must);
        that.cancel(except);

        that.type = that.args.max > 1 ? "multi" : "single";
    },
    unique: function(arr) {

        if (arr && arr.length) {
            var hash = {};
            var len = arr.length;

            for (var i = 0; i < len; i++) {
                var item = arr[i];
                if (hash[item]) {
                    arr.splice(i, 1);
                    i--;
                    len--;
                    continue;
                }
                hash[item] = 1;
            }
        }

        return arr;
    },
    select: function(id) {
        var that = this;
        var args = that.args;
        var data = that.data;
        var options = that.options;

        if (that.inArray(id, args.except)) {
            return false;
        }

        if (id === void 0) {
            var result = [];

            for (var i = 0, olen = options.length; i < olen; i++) {
                for (var j = 0, dlen = data.length; j < dlen; j++) {
                    var option = options[i];

                    if (option.items) {
                        var items = option.items;
                        for (var k = 0, ilen = items.length; k < ilen; k++) {
                            if (items[k].id + "" === data[j] + "") {
                                result.push(items[k]);
                            }
                        }
                    } else {
                        if (option.id + "" === data[j] + "") {
                            result.push(option);
                        }
                    }
                }
            }


            return result;
        }


        if (that.type === "multi") {
            /*
            var diff = data.length - args.max;
            while (diff--) {
                data.shift();
            }
            */
            //limit max
            if (data.length >= args.max) {
                return false;
            }

        } else if (that.type === "single") {
            data.length = 0;
        }

        [].push.apply(data, that.isArray(id) ? id : [id]);

        /*去重*/
        if (!args.duplcate) {
            that.unique(that.data);
        }

        return that;
    },
    isSelected: function(id) {
        var that = this;
        var data = that.data;

        return that.inArray(id, data);
    },
    /**
     * 输出key value 数组
     * @return {Array} 已经选中的key:map数组
     */
    map: function() {
        return [].concat(this.select());
    },
    get: function(id) {
        var map = this.map();

        for (var i = 0; i < map.length; i++) {
            if ((map[i].id + "") === ("" + id)) {
                return map[i];
            }
        }
    },
    /**
     * 取消
     */
    cancel: function(id) {
        var that = this;
        var args = that.args;
        var data = that.data;

        if (args.max > 1) {
            if (this.isArray(id)) {
                for (var j = 0; j < id.length; j++) {
                    this.cancel(id[j]);
                }
            } else {
                var len = data.length;
                for (var i = 0; i < len; i++) {
                    var item = data[i];

                    //limit min
                    /*
                    if (len <= args.min) {
                        break;
                    }
                    */

                    if (id + "" === item + "") {
                        data.splice(i, 1);
                        i--;
                        len--;
                    }
                }
            }
        } else {
            this.empty();
        }
        return this;
    },
    empty: function() {
        this.data.length = 0;
        return this;
    },
    clear: function() {
        return this.empty();
    },
    isArray: function(a) {
        return a instanceof Array;
    },
    inArray: function(item, arr) {
        if (!arr) {
            return false;
        }

        var len = arr.length;
        for (var i = 0; i < len; i++) {
            if ((item + "") === (arr[i] + "")) {
                return true;
            }
        }
        return false;
    },
    defaults: {
        select: [], //默认选中
        must: [], //必选
        options: [], //选项
        children: [], //二级选项
        except: [], //排除
        min: 0,
        max: 10,
        duplcate: false
    }
});

module.exports = Selector;

/*
    var selector = new Selector({
        select: ["select0", "select1", "select1"],
        except: ["must01"],
        must: ["must0"]
    });

    console.log(selector.data);
    selector.select(1);
    selector.select([2, 3]);
    selector.select([2, 3]);
    console.log(selector.data);
    selector.cancel(2);
    console.log(selector.data);
    selector.cancel([1, 3]);
    console.log(selector.data);
    selector.select([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    console.log(selector.data);
*/
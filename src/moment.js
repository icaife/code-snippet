/**
 * Moment
 *     format:
 *     sub:
 *     add:
 *     get:
 *     isLeap:
 *     isValid:
 *     isSame:
 *     isBetween:
 *     lang:
 *     
 */
"use strict";
var $ = require("jquery");

function Moment() {
    return this.init.apply(this, arguments);
}

$.extend(Moment.prototype, {
    init: function(args) {
        var that = this;
        that.args = $.extend(true, {}, that.defaults, args);
    },
    /**
     * format date
     * @param  {Date|Object}    date  
     * @param  {String} format  format
     */
    format: function(date, format) {
        var that = this;
        var cnst = that.const;
        var item = this._createLocal(date);
        var args = this.args;
        var map = {
            Y: {
                reg: /Y+/g,
                value: item.year
            },
            M: {
                reg: /M+/g,
                value: item.month,
            },
            D: {
                reg: /D+/g,
                value: item.day
            },
            W: {
                reg: /W+/g,
                value: item.weekDay
            }
        };

        format = format || args.format || cnst.FORMAT;

        for (var key in map) {
            var itm = map[key];
            if (map.hasOwnProperty(key) && itm.reg.test(format)) {
                format = format.replace(itm.reg, function(str) {
                    return str.length >= (itm.value + "").length ? ("0000" + itm.value).substr(-str.length) : itm.value;
                });
            }
        }

        return format;
    },
    /**
     * date to str
     * @return {[type]} [description]
     */
    date2str: function(date, format) {
        return this.format(date, format);
    },
    /**
     * str to date
     * @param  {String} str    
     * @param  {String} format 
     * @return {[type]}        [description]
     */
    str2date: function(str, format) {
        return this._createLocal(this.parseFromStr(str, format));
    },
    parseFromStr: function(str, format) {
        var cnst = this.const;
        format = format || cnst.FORMAT;

        var dateObj = {
            year: {
                reg: /Y+/g,
                value: 0
            },
            month: {
                reg: /M+/g,
                value: 0
            },
            day: {
                reg: /D+/g,
                value: 0
            },
            weekDay: {
                reg: /W+/g,
                value: 0
            }
        };

        for (var key in dateObj) {
            if (dateObj.hasOwnProperty(key)) {
                var item = dateObj[key];
                var tmp = item.reg.exec(format);

                if (tmp) {
                    item.value = str.substr(tmp.index, tmp[0].length);
                }
            }
        }

        return {
            year: dateObj.year.value,
            month: dateObj.month.value,
            day: dateObj.day.value
        };
    },
    /**
     * get date
     * @param  {String|Date|Object} date 
     * @param  {String}             unit year month day or year+1 month+1 day+1 year-1 month-1 day-1
     * @param  {String}             format get date froamt 
     * @return {Object}             obj date
     */
    get: function(date, unit, format) {
        var oriDate = null;
        var tmpDate = null;
        var result = null;
        var reg = /^([a-zA-Z]+)(?:([+-])([+-]?\d+))?$/;
        var matchs = null;
        var that = this;

        unit = unit || "";

        if (!arguments.length) {
            date = new Date();
        }

        if (that.isString(date)) { //字符串
            tmpDate = that._createLocal(that.parseFromStr(date, format));
            oriDate = tmpDate.ori;
        } else if (that.isDate(date)) { //原生date
            //TODO
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            oriDate = date;
            tmpDate = that._createLocal(date);
        } else if (typeof date === "object") { //字面量
            tmpDate = that._createLocal(date);
            oriDate = tmpDate.ori;
        } else {
            return date;
        }

        matchs = unit.match(reg);

        if (matchs) {
            var type = matchs[1];

            if (!matchs[3]) {
                result = tmpDate[type];
            } else {
                var op = matchs[2];
                var diff = (matchs[3] | 0);

                tmpDate[type] += op === "+" ? +diff : -diff;

                result = that.get(tmpDate);
            }
        } else {
            result = tmpDate;
        }

        return result;
    },
    set: function(date, num, type) {
        date = this.get(date);

        if (type === this.const.VARS.date) {
            num = this.get(num);
            date.year = num.year;
            date.month = num.month;
            date.day = num.day;
        } else {
            date[type] = num | 0;
        }

        return this.get(date);
    },
    is: function() {
        var args = arguments;

        if (!args[0]) {
            return false;
        }

        return {
            leap: this._bind(this.isLeap, args),
            before: this._bind(this.isBefore, args),
            after: this._bind(this.isAfter, args),
            between: this._bind(this.isBetween, args),
            valid: this._bind(this.isValid, args),
            same: this._bind(this.isSame, args)
        };
    },
    _createLocal: function(year, month, day) {
        var that = this;
        var obj = {};
        var vars = that.const.VARS;
        var ori = null;

        if (arguments.length < 3) {
            if (this.isDate(year)) {
                ori = year; //year as date
            } else if (this.isString(year)) {
                var date = this.parseFromStr(year, month); //year as date,month as format
                ori = this._createLocal(date, month).ori;
            } else { //字面量
                ori = new Date(year.year | 0, (year.month | 0) - 1, void 0 === year.day ? 1 : year.day | 0); //year as date
            }
        } else {
            ori = new Date(year | 0, (month | 0) - 1, void 0 === day ? 1 : day | 0); //year as date
        }

        obj[vars.year] = ori.getFullYear();
        obj[vars.month] = ori.getMonth() + 1;
        obj[vars.day] = ori.getDate();
        obj[vars.weekDay] = ori.getDay();
        obj.ori = ori;
        obj.value = +ori;

        //rewrite format and valueOf
        obj.format = obj.toString = function(fmt) {
            return that.format(obj, fmt);
        };

        obj.valueOf = function() {
            return this.value;
        };

        return obj;
    },
    _bind: function(fn, args) {
        var that = this;
        args = [].slice.call(args);

        if (!fn) {
            return function() {};
        }

        return function() {
            return fn.apply(that, args.concat([].slice.call(arguments)));
        };
    },
    add: function(date, diff, unit) {
        return this.get(date, (unit || "day") + "+" + (diff | 0));
    },
    sub: function(date, diff, unit) {
        return this.get(date, (unit || "day") + "-" + (diff | 0));
    },
    diff: function(start, end /*,unit*/ ) {
        start = this.get(start);
        end = this.get(end);

        return Math.ceil((end.value - start.value) / 86400000);
    },
    daysInYear: function(year) {
        return 365 + this.isLeap(year);
    },
    daysInMonth: function(year, month) {
        var date = this.get({
            year: year,
            month: month || 1,
            day: 1
        });

        year = date.year;
        month = date.month - 1;
        return [31, (this.isLeap(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month > 11 ? (month % 12) : month];
    },
    isLeap: function(year) {
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0); //判断是否是闰年
    },
    isValid: function(dateStr) {
        var reg =
            /((^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([3579][26]00)([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29)$)|(^([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29)$)|(^([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)$))/;

        return reg.test(dateStr);
    },
    /**
     * [isSame description]
     * @param  {[type]}  input [description]
     * @param  {[type]}  format   [description]
     * @return {Boolean}       [description]
     */
    isSame: function(input, value, unit, format) {
        return this._compare(input, value, unit, format, 0);
    },
    isDate: function(date) {
        return date instanceof Date;
    },
    isObj: function(obj) {
        return "[object Object]" === Object.prototype.toString.call(obj);
    },
    isString: function(str) {
        return typeof str === "string";
    },
    isBetween: function(input, start, end, unit, format) {
        input = this.is(input);

        return input.after(start, format) && input.before(end, format);
    },
    isBefore: function(input, value, unit, format) {
        return this._compare(input, value, unit, format, -1);
    },
    isAfter: function(input, value, unit, format) {
        return this._compare(input, value, unit, format, 1);
    },
    _compare: function(input, value, unit, format, type) {
        var vars = this.const.VARS;
        var compareObj = {};
        var result = false;

        input = this.get(input, void 0, format);
        value = this.get(value, void 0, format);
        var inputObj = {
            year: input.year * 10000,
            month: input.month * 100,
            day: input.day * 1
        };
        var valueObj = {
            year: value.year * 10000,
            month: value.month * 100,
            day: value.day * 1
        };

        switch (type) {
            case -1: //before
                compareObj[vars.year] = inputObj.year < valueObj.year;
                compareObj[vars.month] = inputObj.year + inputObj.month < valueObj.year + valueObj.month;
                compareObj[vars.day] = inputObj.year + inputObj.month + inputObj.day < valueObj.year + valueObj.month + valueObj.day;
                result = input.value < value.value;

                break;
            case 0: //same
                compareObj[vars.year] = inputObj.year === valueObj.year;
                compareObj[vars.month] = compareObj[vars.year] && inputObj.month === valueObj.month;
                compareObj[vars.day] = compareObj[vars.month] && inputObj.day === valueObj.day;
                result = input.value === value.value;

                break;
            case 1: //after
                compareObj[vars.year] = inputObj.year > valueObj.year;
                compareObj[vars.month] = inputObj.year + inputObj.month > valueObj.year + valueObj.month;
                compareObj[vars.day] = inputObj.year + inputObj.month + inputObj.day > valueObj.year + valueObj.month + valueObj.day;
                result = input.value > value.value;
                break;
        }

        if (!unit) {
            return result;
        }

        return result = compareObj[unit] || false;
    },
    lang: {},
    const: {
        FORMAT: "YYYY-MM-DD",
        YEAR: "Y",
        MONTH: "M",
        DAY: "D",
        WEEKDAY: "W",
        VARS: {
            year: "year",
            month: "month",
            day: "day",
            weekDay: "weekDay",
            date: "date"
        }
    }
});

module.exports = Moment;
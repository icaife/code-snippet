/**
 * calendar 模块
 * @author  Leon 2016年11月7日
 */

"use strict";

var $ = require("jquery");
var Moment = require("moment"); //时间处理

function Calendar() {
    return this.init.apply(this, arguments);
}

$.extend(Calendar.prototype, {
    init: function(args) {
        var that = this;
        var _args = that.args = $.extend(true, {}, that.defaults, args);
        var moment = that.moment = new Moment({
            format: _args.format
        });

        //base 当前基准时间,date当前选中的日期，通过setDate方法设置的日期
        that.base = moment.get(_args.date || new Date());

        if (_args.date) {
            that.date = that.base;
        }

        that.today = _args.today = moment.get(_args.today);
        that.max = _args.max = moment.get(_args.max);
        that.min = _args.min = moment.get(_args.min);

        //todo add cache,year,month,day
        that._cache = {};
    },
    /**
     * 创建天数
     * @param  {Int} year               year
     * @param  {Month} month            month
     * @param  {Boolean} needNeibour    是否需要相邻月份填充
     * @return {Array}                  一共42天，needNeibour === true,包含了上个月月末和下个月月初
     */
    createDays: function(year, month, needNeibour) {
        var that = this;
        var moment = that.moment;
        var cnst = that.const;
        var days = [];
        var baseDate = that.base;

        year = year || baseDate.year;
        month = month || baseDate.month;

        var daysInMonth = moment.daysInMonth(year, month);
        var date = moment.get({
            year: year,
            month: month
        });
        var weekDay = date.weekDay;

        for (var i = -weekDay; i < cnst.CHECKS_NUM - weekDay; i++) {
            var item = null;

            if ((!needNeibour) && (i < 0 || i >= daysInMonth)) {
                item = false; //表示空的                
            } else {
                item = moment.add(date, i);
            }

            //add ext params
            var ext = that._compare(item);
            if (ext) {
                item.ext = ext;
            }

            days.push(item);
        }

        return days;
    },
    /**
     * create weeks
     * @return {[type]} [description]
     */
    createWeeks: function() {
        var weeks = "日一二三四五六".split("");
        return weeks;
    },
    /**
     * create months
     * @param  {[type]} start [description]
     * @param  {[type]} num   [description]
     * @return {[type]}       [description]
     */
    createMonths: function(start, num) {
        var that = this;
        var minDate = that.min;
        var maxDate = that.max;
        var moment = that.moment;
        var compareBaseDate = moment.is(that.base);

        start = start || 1; //default start from 1
        num = num ? 0 : 11;

        // limit min and max
        if (compareBaseDate.same(minDate, "year")) {
            start = minDate.month;
            num = 12 - start;
        }

        if (compareBaseDate.same(maxDate, "year")) {
            num = maxDate.month - start;
        }

        return that._createArr(start, num);
    },
    /**
     * create years
     * @param  {[type]} start [description]
     * @param  {[type]} num   [description]
     * @return {[type]}       [description]
     */
    createYears: function(start, num) {

        start = this.min.year;
        num = this.max.year - start;

        return this._createArr(start, num !== void 0 ? num : 15);
    },
    /**
     * get date
     * @param  {String|Date|Object} date 
     * @param  {String}             unit "" year month day or year+1 month+1 day+1 year-1 month-1 day-1
     * @param  {String}             format get date format 
     * @return {Object}             obj date
     */
    getDate: function() {
        return this.moment.get.apply(this.moment, arguments);
    },
    /**
     * 只能通过setDate 接口来设置calendar的date时间，其余的翻页、切换年月 只能设置base
     */
    setDate: function() {
        var that = this;

        that.date = that.set.apply(that, [].slice.call(arguments));

        return this;
    },
    /**
     *  limit min and max
     */
    _limit: function(date) {
        var that = this;
        var compareDate = that.moment.is(date);

        //limit max and min
        if (compareDate.before(that.min)) {
            date = that.min;
        }

        if (compareDate.after(that.max)) {
            date = that.max;
        }

        return date;
    },
    /**
     * next year or month or day
     * @param  {[type]}   type [description]
     * @return {Function}      [description]
     */
    next: function(type, num) {
        num = num === void 0 ? 1 : num;

        var that = this;
        var cnst = that.const;
        var base = that.base;
        var moment = that.moment;
        var year = base.year + (type === cnst.KEYS.YEAR ? num : 0);
        var month = base.month + (type === cnst.KEYS.MONTH ? num : 0);
        var daysInMonth = moment.daysInMonth(year, month);
        base.day = Math.min(base.day, daysInMonth);
        var date = moment.get(that.base, type + "+" + num);

        return that.base = this._limit(date);
    },
    /**
     * prev year or month or day
     * @param  {[type]}   type [description]
     * @return {Function}      [description]
     */
    prev: function(type, num) {
        num = num === void 0 ? 1 : num;

        var that = this;
        var cnst = that.const;
        var base = that.base;
        var moment = that.moment;
        var year = base.year - (type === cnst.KEYS.YEAR ? num : 0);
        var month = base.month - (type === cnst.KEYS.MONTH ? num : 0);
        var daysInMonth = moment.daysInMonth(year, month);
        base.day = Math.min(base.day, daysInMonth);
        var date = moment.get(that.base, type + "-" + num);

        return that.base = this._limit(date);
    },
    set: function() {
        var that = this;
        var moment = that.moment;
        var date = moment.set.apply(that.moment, [that.base].concat([].slice.call(arguments)));

        return that.base = this._limit(date);
    },
    _createArr: function(start, offset, val) {
        var arr = [start];

        for (var i = 1; i <= offset; i++) {
            if (void 0 === val) {
                arr.push(start + i);
            } else {
                arr[i] = 0;
            }
        }

        return arr;
    },
    _compare: function(value, type) {
        if (!value) {
            return false;
        }

        var that = this;
        var date = that.date;
        var baseDate = that.base;
        var minDate = that.min;
        var maxDate = that.max;
        var moment = that.moment;
        var compareBaseDate = moment.is(baseDate);
        var compareDate = moment.is(date);
        var compareMinDate = moment.is(minDate);
        var compareMaxDate = moment.is(maxDate);
        var keys = that.const.KEYS;
        var ext = {};

        if (type === keys.YEAR || type === keys.MONTH) {
            ext.same = compareBaseDate.same(value, type);
            ext.before = compareBaseDate.after(value, type);
            ext.after = compareBaseDate.before(value, type);
        } else {
            ext.same = compareBaseDate.same(value);
            ext.selected = compareDate && compareDate.same(value); //当前日期是否选中
            ext.before = compareBaseDate.after(value);
            ext.after = compareBaseDate.before(value);
            ext.inRange = (compareMinDate.before(value) || compareMinDate.same(value)) && (compareMaxDate.after(value) || compareMaxDate.same(value)); //<= or >=
            ext.monthBefore = compareBaseDate.after(value, keys.MONTH); //todo
            ext.monthAfter = compareBaseDate.before(value, keys.MONTH);
        }

        return ext;
    },
    defaults: {
        format: "YYYY-MM-DD", //date format
        date: new Date(), //default date
        today: new Date(),
        min: new Date(), //min date
        max: new Date(2099, 11, 30) //max date
    },
    const: {
        CHECKS_NUM: 42, //checks num
        WEEKDAY_START: 0, //todo : week start
        KEYS: {
            YEAR: "year",
            MONTH: "month",
            DAY: "day"
        }
    }
});

module.exports = Calendar;
/*validator*/
/**
 * validator
 * 默认规则
 *     required
 *     date
 *     number
 *     letters
 *     email
 *     mobile
 *     digits
 *     chinese
 *     zip
 *     range
 *     length
 *
 * 自定义规则
 *
 *
 *
 *
 */

"use strict";
var $ = require("jquery");

function Validator() {
    return this.init.apply(this, arguments);
}

//global config
Validator.config = function(configs) {
    var proto = this.prototype;

    $.extend(proto.defaults.rules, configs);
};

$.extend(Validator.prototype, {
    init: function(obj) {
        var that = this;
        var args = this.args = $.extend(true, {}, that.defaults, obj);

        this.rules = args.rules;
        this.fields = {}; //fields

        that.form = $(args.form);

        that.bindEvent();
    },
    config: function(rules) {
        $.extend(this.rules, rules);
    },
    _parse: function(dom) {
        if (!dom) {
            return [];
        }

        var that = this;
        var fieldName = dom.prop("name");

        if (fieldName in that.fields) {
            // return that.fields[fieldName]; //TODO
        }

        var args = that.args;
        var rules = args.rules;
        var parsed = [];
        var parseStr = dom.data("rules");

        if (!parseStr || !fieldName) {
            return [];
        }

        var arr = parseStr.split(args.ruleSpliter);

        for (var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            var matched = item.match(/^(\w+)(?:\(([^)]*)\))?$/);

            if (!matched) {
                continue;
            }


            var ruleName = matched[1];
            var params = [];
            var paramsStr = "";
            var rule = $.extend({}, rules[ruleName]);
            if (matched[2]) {
                paramsStr = matched[2].replace(/['"](\w+)['"]/g, "$1");
                params = paramsStr /*.replace(/^,|,$/g, "")*/ .split(",");
            }

            if (rule) {
                rule.msg = dom.data(ruleName + "-msg") || rule.msg;
                parsed.push({
                    rule: rule,
                    name: ruleName,
                    params: params || []
                });
            }
        }

        return that.fields[fieldName] = parsed;
    },
    _exec: function(parseds, val) {
        var reasons = [];

        for (var i = 0, len = parseds.length; i < len; i++) {
            var parsed = parseds[i];
            var rule = parsed.rule;
            var params = parsed.params;
            var ruleName = parsed.name;
            var valid = typeof rule.reg === "function" ? rule.reg.apply(rule, [val].concat(params)) /*function*/ : (rule.reg.lastIndex = 0, rule.reg.test(val)) /*regexp*/ ;

            if (!valid) {
                reasons.push({
                    name: ruleName,
                    msg: rule.msg
                });
            }

        }

        return reasons;
    },
    /**
     * validate all elements in container
     * @return {this}
     */
    validateAll: function() {
        var that = this;
        var args = that.args;
        var form = that.form;
        var inputs = form.find(args.elements.join(","));
        var flag = true;
        var callbacks = args.callbacks;
        var result = [];
        var els = [];

        inputs.each(function() {
            var el = $(this);
            var reasons = that.validate(el, $.trim(this.value));

            if (reasons.length) {
                [].push.apply(result, reasons);
                els.push(el);

                if (flag) {
                    flag = false;
                }

                if (args.stopOnError) {
                    return false;
                }
            }
        });

        callbacks.validAll.apply(that.form, [result, els]);

        return flag;
    },
    /**
     * validate input
     * @param  {jQdom} dom      element
     * @param  {Event} event
     * @return {Array} reasons
     */
    validate: function(dom, val) {

        val = val || dom.val();
        var that = this;
        var args = that.args;

        if (!args.validateHidden && !dom.is(":visible")) {
            return [];
        }

        var callbacks = args.callbacks;
        var parseds = that._parse(dom);
        var type = dom.prop("type");
        var form = that.form;
        var name = dom.prop("name");

        //handle radio and checkbox,just valid first element
        if (/radio|checkbox/.test(type) && dom.data("rules")) {
            val = /radio/.test(type) ? "" : [];

            form.find("input:" + type).filter(function() {
                return name === this.name;
            }).each(function() {
                var el = this;
                if (/radio/.test(type)) {
                    if (el.checked) {
                        val = this.value;
                    }
                } else {
                    if (el.checked) {
                        val.push(this.value);
                    }
                }
            });
        }

        var reasons = that._exec(parseds, $.trim(val));

        if (reasons.length) {
            callbacks.invalid.apply(dom, [reasons, val, name]);
        } else {
            callbacks.valid.apply(dom, [reasons, val, name]);
        }

        return reasons;
    },
    bindEvent: function() {
        var that = this;
        var args = that.args;
        var callbacks = args.callbacks;
        var form = that.form;

        form.on(args.events, args.elements.join(","), function(event) {
            var dom = $(this);
            setTimeout(function() {
                var eventType = new RegExp(event.type, "img");
                var name = dom.prop("name");
                var type = dom.prop("type");
                var val = /text|textarea|select/.test(type) ?
                    dom.val() : false;

                if (eventType.test(args.validateEvent)) { //validate event
                    that.validate(dom, val);
                }

                if (eventType.test(args.resetEvent)) { //reset event
                    if (/radio|checkbox/.test(type)) {
                        form.find("input:" + type).filter(function() {
                            return name === this.name;
                        }).each(function() {
                            callbacks.reset.apply($(this), [
                                [], val, name
                            ]);
                        });
                    } else {
                        callbacks.reset.apply(dom, [
                            [], val, name
                        ]);
                    }
                }
            }, args.validateDelay);
        });
    },
    defaults: {
        ruleSpliter: ";", //rules spliter
        elements: ["input", "textarea", "select", "radio", "checkbox"], //elements to be validated
        form: ".J-tff-form", //form container
        validateEvent: "focusout change", //validate when focusout
        validateDelay: 100,
        validateHidden: false, //validate or not when element is hidden
        resetEvent: "focusin",
        events: "focusin focusout keyup",
        stopOnError: false, //stop when some field invalidate
        resetOnFocusIn: true, //reset on focus in
        callbacks: {
            valid: $.noop, //on valid in every element
            invalid: $.noop, //on invalid in every element
            validAll: $.noop, //on valid all,all elements validated
            reset: $.noop //if resetOnFocusIn is true,this callback will be called
        },
        /**
         * default rules
         * @type {Object}
         */
        rules: {
            required: {
                reg: /[^\s]/g,
                msg: "不能为空"
            },
            checked: {
                reg: function(val /**/ ) {
                    if (val instanceof Array) {
                        return !!val.length;
                    } else {
                        return !!val;
                    }
                },
                msg: "请选择"
            },
            date: {
                reg: /((^((1[8-9]\d{2})|([2-9]\d{3}))([-])(10|12|0?[13578])([-])(3[01]|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-])(11|0?[469])([-])(30|[12][0-9]|0?[1-9])$)|(^((1[8-9]\d{2})|([2-9]\d{3}))([-])(0?2)([-])(2[0-8]|1[0-9]|0?[1-9])$)|(^([2468][048]00)([-])(0?2)([-])(29)$)|(^([3579][26]00)([-])(0?2)([-])(29)$)|(^([1][89][0][48])([-])(0?2)([-])(29)$)|(^([2-9][0-9][0][48])([-])(0?2)([-])(29)$)|(^([1][89][2468][048])([-])(0?2)([-])(29)$)|(^([2-9][0-9][2468][048])([-])(0?2)([-])(29)$)|(^([1][89][13579][26])([-])(0?2)([-])(29)$)|(^([2-9][0-9][13579][26])([-])(0?2)([-])(29)$))/,
                msg: "请填写正确的日期，格式：YYYY-MM-DD"
            },
            en: {
                reg: /^[a-z]+(\s*[a-z]+)?$/i,
                msg: "请填写字母"
            },
            email: {
                reg: /^[\w\+\-]+(\.[\w\+\-]+)*@[a-z\d\-]+(\.[a-z\d\-]+)*\.([a-z]{2,4})$/i,
                msg: "请填写正确的邮箱"
            },
            mobile: {
                reg: /^1[3-9]\d{9}$/,
                msg: "请填写正确的手机号"
            },
            digits: {
                reg: /^\d+$/,
                msg: "请填写数字"
            },
            number: {
                reg: /^\d+(\.\d{1,2})$/,
                msg: "至少精确到一位小数"
            },
            chinese: {
                reg: /^[\u0391-\uFFE5]+$/,
                msg: "请填写中文"
            },
            zip: {
                reg: /^\d{6}$/,
                msg: "请填写正确的邮编"
            },
            range: { //todo
                reg: function(num, min, max /*, exp*/ ) {
                    min = +min;
                    max = +max;

                    return true;
                },
                msg: {
                    rg: "请填写{1}到{2}的数",
                    // gte: "请填写不小于{1}的数",
                    // lte: "请填写最大{1}的数",
                    // gtlt: "请填写{1}到{2}之间的数",
                    gt: "请填写大于{1}的数",
                    lt: "请填写小于{1}的数"
                }
            },
            length: { //todo
                reg: function(str, min, max /*, exp*/ ) {
                    if (arguments.length === 1) {
                        return true;
                    } else if (arguments.length === 2) {
                        return str.length > (min | 0);
                    } else {
                        return str.length >= (min | 0) && str.length <= (max | 0);
                    }
                },
                msg: {
                    eq: "请填写{1}个字符",
                    rg: "请填写{1}到{2}个字符",
                    gt: "请至少填写{1}个字符",
                    lt: "请最多填写{1}个字符"
                        // gte: "请至少填写{1}个字符",
                        // lte: "请最多填写{1}个字符",
                }
            }
        }
    }
});


module.exports = Validator;
/**
 * [cookie description]
 * get cookie
 * set cookie
 */
function cookie() {
    //if arguments.length > 1,set cookie
    if (arguments.length > 1) {
        return cookie.set.apply(this, [].slice.call(arguments));
    }

    return cookie.get.apply(this, [].slice.call(arguments));
}

/**
 * [cookie.get description]
 * @param  {String} key [description]
 * @return {String}     [description]
 */
cookie.get = function(key) {
    var result = "";
    //read cookie
    if (!key) { //if no key,return all cookie ,format key : value
        result = {};
    }

    var cookies = doc.cookie ? doc.cookie.split(";") : [];
    var rdecode = /(%[0-9A-Z]{2})+/g;

    try {
        for (var i = 0, len = cookies.length; i < len; i++) {
            var item = cookies[i].split("=");
            var _key = trim(item[0]).replace(rdecode, decodeURIComponent);
            var _val = item[1].replace(rdecode, decodeURIComponent);

            if (/^\"/.test(_val)) {
                _val = _val.slice(1, -1);
            }

            if (this.json) {
                _val = JSON.parse(_val);
            }

            if (key === _key) {
                result = _val;
                break;
            }

            if (!key) {
                result[_key] = _val;
            }
        }
    } catch (e) {
        conosoe.log(e);
    }

    return result;
};

/**
 * [cookie.set description]
 * @param  {String} key   [description]
 * @param  {String|Number|Object|Array} value [description]
 * @param  {Object} attrs
 * @return {String}       [description]
 */
cookie.set = function(key, value, attrs) {
    if (!key) {
        return false;
    }

    attrs = extend(cookie.defaults, attrs);
    //set expires
    if (typeof attrs.expires === "number") {
        var expires = new Date();

        expires.setMilliseconds(expires.getMilliseconds() + attrs.expires * 864e+5);
        attrs.expires = expires;
    }

    //handle value
    try {
        result = JSON.stringify(value);

        //object or array
        if (/^[\{\[]/.test(result)) {
            value = result;
        }
    } catch (e) {}

    value = encodeURIComponent(String(value))
        .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

    //handle key
    key = encodeURIComponent(String(key))
        .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
        .replace(/[\(\)]/g, escape);

    return (doc.cookie = [
        key, "=", value,
        attrs.expires ? "; expires=" + attrs.expires.toUTCString() : "", // use expires attribute, max-age is not supported by IE
        attrs.path ? "; path=" + attrs.path : "",
        attrs.domain ? "; domain=" + attrs.domain : "",
        attrs.secure ? "; secure" : ""
    ].join(""));
}

/**
 * [json description]
 * @return {Object} [description]
 */
cookie.json = function() {
    return cookie.get.apply({
        json: true
    }, [].slice.call(arguments));
};

/**
 * [rm description]
 * @param  {[type]} key   [description]
 * @param  {[type]} attrs [description]
 * @return {[type]}       [description]
 */
cookie.rm = function(key, attrs) {
    return cookie.set(key, "", {
        expires: -1
    });
};

/**
 * [defaults description]
 * @type {Object}
 */
cookie.defaults = {
    // path: "/"
};
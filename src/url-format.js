/**
 * url
 * @return {Object|String}
 */
function url() {
    var value = arguments[0];

    if (typeof value === "string") {
        return url.url2json(value);
    } else if (/object/.test(value)) {
        return url.json2url(value);
    }

    return "";
}

/**
 * json2url
 * @param  {Object}     json
 * @return {String}     parsed url
 */
url.json2url = function(json) {
    var u = url;
    //base type
    if (/string|boolean|number|undefined|null/.test(type(json))) {
        return String(json);
    }

    var arr = [];
    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            var val = json[key];
            var t = type(val);
            var item = key + "=" + encodeURIComponent((/array|object/.test(t) ? JSON.stringify(val) : val));

            arr.push(item);
        }
    }

    return arr.join("&");
};

/**
 * url to json
 * @param  {String|undefined} string,default win.location.href
 * @return {Object}     parsed json
 */
url.url2json = function(url) {
    var a = doc.createElement("a");
    a.href = url = url || win.location.href;

    var json = {
        src: url,
        protocol: a.protocol.replace(":", ""),
        host: a.host,
        hostname: a.hostname,
        domain: a.hostname,
        port: a.port,
        query: a.search,
        params: (function() {
            var params = {};
            var match = null;
            var search = a.search.replace(/^\?/, "");
            var items = search.split("&");

            for (var i = 0, len = items.length; i < len; i++) {
                var segs = items[i].split("=");
                if (!segs[0]) {
                    continue;
                }
                params[segs[0]] = segs[1] || "";
            }

            return params;
        })(),
        file: (a.pathname.match(/\/?([^/?#]+)$/i) || ["", ""])[1],
        hash: a.hash.replace("#", ""),
        path: a.pathname.replace(/^([^/])/, "/$1"),
        relative: (a.href.match(/tps?:\/\/[^/]+(.+)/) || ["", ""])[1],
        segments: a.pathname.replace(/^\//, "").split("/")
    };

    a = null;
    return json;
};
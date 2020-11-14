var numeral = require('numeral');

global.decimals = function (str, cnt) {
    var i = parseFloat(str)
    var n = i.toFixed(cnt).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    return n;
}

global.format_number = function (s, dec_places = 0) {
    var fmt = "0,0";
    if (dec_places != 0) {
        fmt += "." + "0".repeat(dec_places);
    }
    var s2 = numeral(s).format(fmt);
    return (s2);
}

global.format_date = function (s, fmt) {
    var moment = require('moment');
    var formattedDate = moment(s).format(fmt);
    return formattedDate;
}

global.todays_date = function (s, fmt) {
    var d = new Date();
    var s = format_date(d, "D MMMM YYYY");
    return (s);
}

global.get_scope = function (s) {
    if ((s == "ni") || (s == "eu")) {
        var scopeId = "ni";
    } else {
        var scopeId = "gb";
    }
    return (scopeId);
}

global.get_root = function (req, scopeId) {
    var root = req.url;
    root = root.replace(scopeId, "{{ scopeId }}")

    return (root);
}

global.get_title = function (scopeId) {
    if (scopeId == "ni") {
        var title = "The Northern Ireland (EU) Tariff";
    } else {
        var title = "The UK Global Tariff";
    }

    return (title);
}
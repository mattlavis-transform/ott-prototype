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

global.format_commodity_code = function (str, separator = " ") {
    if (typeof str !== 'undefined') {
        s = str.substr(0, 4) + separator;
        s += str.substr(4, 2) + separator;
        s += str.substr(6, 2) + separator;
        s += str.substr(8, 2);
        return s;
    } else {
        return "";
    }
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
        var scopeId = "";
    }
    return (scopeId);
}

global.set_tariff = function (req) {
    var destination = req.session.data["destination"];
    var ireland_option = req.session.data["ireland_option"];
    if ((destination == "Northern Ireland") && (ireland_option == "yes")) {
        req.session.data["tariff"] = "xi/";
    } else {
        req.session.data["tariff"] = "";
    }
    console.log(req.session.data["tariff"]);
}

global.get_domain = function (req) {
    console.log("Getting domain");
    var tariff = req.session.data["tariff"];
    if (typeof tariff === 'undefined') {
        tariff = "";
    }
    var domain = 'https://www.trade-tariff.service.gov.uk/' + tariff + 'api/v2/commodities/';
    return (domain);
}

global.get_root_url = function (req, scopeId) {
    var root_url = req.url;
    root_url = root_url.replace("/ni", "/{{ scopeId }}");
    root_url = root_url.replace("/gb", "/{{ scopeId }}");
    return (root_url);
}

global.get_title = function (scopeId) {
    if (scopeId == "ni") {
        var title = "The Northern Ireland (EU) Tariff";
    } else {
        var title = "The Online Trade Tariff";
    }
    return (title);
}

global.check_heading_commodity = function (goods_nomenclature_item_id) {
    var last_six = goods_nomenclature_item_id.substring(goods_nomenclature_item_id.length - 6, goods_nomenclature_item_id.length);
    var url;
    if (last_six == "000000") {
        url = "headings/" + goods_nomenclature_item_id.substring(0, 4);
    } else {
        url = "commodities/" + goods_nomenclature_item_id;
    }
    return (url);
}
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

global.kill_session_vars = function (req, vars) {
    var i;
    for (i = 0; i < vars.length; i++) {
        delete req.session.data[vars[i]];
    }
    var a = 1;
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
    //console.log(req.session.data["tariff"]);
}

global.get_domain = function (req) {
    //console.log("Getting domain");
    var tariff = req.session.data["tariff"];
    if (typeof tariff === 'undefined') {
        tariff = "";
    }
    var at_risk = req.session.data["at_risk"];
    if (typeof at_risk !== 'undefined') {
        if (at_risk == false) {
            tariff = "";
        } else {
            tariff = "xi/";
        }
    }
    var domain = 'https://www.trade-tariff.service.gov.uk/' + tariff + 'api/v2/commodities/';

    return (domain);
}


global.get_commodity_api = function (req) {
    var url = global.get_domain(req);
    url += req.params["goods_nomenclature_item_id"];;
    var geo = req.session.data["origin"];
    if (geo != "") {
        url += "?filter[geographical_area_id]=" + geo;
    }
    return (url);
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
        var title = "UK Global Online Tariff";
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

global.get_starch_glucose_options = function () {
    var meursing_codes = require('../data/meursing_codes.json');
    var starch_glucose_options = [];

    for (key in meursing_codes) {
        var value = meursing_codes[key].starch;
        if (!starch_glucose_options.includes(value)) {
            starch_glucose_options.push(value);
        }
        var a = 1;
    }
    // starch_glucose_options.sort();
    return (starch_glucose_options);
}

global.get_sucrose_options = function (starch_option) {
    var meursing_codes = require('../data/meursing_codes.json');
    var sucrose_options = [];

    for (key in meursing_codes) {
        var starch_value = meursing_codes[key].starch;
        if (starch_value == starch_option) {
            var sucrose_value = meursing_codes[key].sucrose;
            if (!sucrose_options.includes(sucrose_value)) {
                sucrose_options.push(sucrose_value);
            }
        }
    }
    // sucrose_options.sort();
    return (sucrose_options);
}

global.get_milk_fat_options = function (starch_option, sucrose_option) {
    var meursing_codes = require('../data/meursing_codes.json');
    
    var milk_fat_options = [];

    for (key in meursing_codes) {
        var starch_value = meursing_codes[key].starch;
        var sucrose_value = meursing_codes[key].sucrose;
        if (starch_value == starch_option) {
            if (sucrose_value == sucrose_option) {
                var milk_fat_value = meursing_codes[key].milk_fat;
                if (!milk_fat_options.includes(milk_fat_value)) {
                    milk_fat_options.push(milk_fat_value);
                }
            }
        }
    }
    // milk_fat_options.sort();
    return (milk_fat_options);
}

global.get_milk_protein_options = function (starch_option, sucrose_option, milk_fat_option) {
    var meursing_codes = require('../data/meursing_codes.json');
    var milk_protein_options = [];

    for (key in meursing_codes) {
        var starch_value = meursing_codes[key].starch;
        var sucrose_value = meursing_codes[key].sucrose;
        var milk_fat_value = meursing_codes[key].milk_fat;
        if (starch_value == starch_option) {
            if (sucrose_value == sucrose_option) {
                if (milk_fat_value == milk_fat_option) {
                    var milk_protein_value = meursing_codes[key].milk_protein;
                    if (!milk_protein_options.includes(milk_protein_value)) {
                        milk_protein_options.push(milk_protein_value);
                    }
                }
            }
        }
    }
    // milk_protein_options.sort();
    return (milk_protein_options);
}

global.get_result = function (starch_option, sucrose_option, milk_fat_option, milk_protein_option) {
    var meursing_codes = require('../data/meursing_codes.json');
    var results = [];

    for (key in meursing_codes) {
        var starch_value = meursing_codes[key].starch;
        var sucrose_value = meursing_codes[key].sucrose;
        var milk_fat_value = meursing_codes[key].milk_fat;
        var milk_protein_value = meursing_codes[key].milk_protein;

        if (starch_value == starch_option) {
            if (sucrose_value == sucrose_option) {
                if (milk_fat_value == milk_fat_option) {
                    if (milk_protein_value == milk_protein_option) {
                        var result = key.replace("key_", "");
                        if (!results.includes(result)) {
                            results.push(result);
                        }
                    }
                }
            }
        }
    }
    return (results);
}


/* VALIDATIONS START HERE */
// Validate starch
global.validate_starch = function (req, res) {
    return (true);
}
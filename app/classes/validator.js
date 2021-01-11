const axios = require('axios')
const Error_handler = require('./error_handler.js');
const Commodity = require('./commodity.js');

global.validate_date = function (req, res) {
    // Validate the date form
    e = new Error_handler();
    contains_errors = e.validate_date(req); // Gets data from Date form and validates it
    if (contains_errors) {
        req.session.data["error"] = "date";
        res.redirect("/calculate/date/" + req.params["goods_nomenclature_item_id"]);
    } else {
        req.session.data["error"] = "";
        res.redirect("/calculate/destination/" + req.params["goods_nomenclature_item_id"]);
    }
}

global.validate_destination = function (req, res) {
    // Validate the destination form
    console.log("Validator: Validating destination");
    e = new Error_handler();
    contains_errors = e.validate_destination(req); // Gets data from destination form and validates it
    if (contains_errors) {
        req.session.data["error"] = "destination";
        res.redirect("/calculate/destination/" + req.params["goods_nomenclature_item_id"]);
    } else {
        global.set_tariff(req)
        req.session.data["error"] = "";
        // Check if the MFN is 0.00. If it is, then there is no value in proceeding
        axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
            .then((response) => {
                c = new Commodity();
                c.get_data(response.data);
                if (c.basic_duty_rate == "0.00 %") {
                    res.redirect("/calculate/results/" + req.params["goods_nomenclature_item_id"]);
                } else {
                    res.redirect("/calculate/origin/" + req.params["goods_nomenclature_item_id"]);
                }
            });
    }
}

global.validate_origin = function (req, res) {
    // Validate the origin form
    console.log("Validator: Validating origin");
    e = new Error_handler();
    contains_errors = e.validate_origin(req); // Gets data from origin form and validates it
    if (contains_errors) {
        req.session.data["error"] = "origin";
        res.redirect("/calculate/origin/" + req.params["goods_nomenclature_item_id"]);
    } else {
        req.session.data["error"] = "";
        res.redirect("/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"]);
    }
}

global.validate_monetary_value = function (req, res) {
    // Validate the monetary value form
    console.log("Validator: Validating monetary value");
    e = new Error_handler();
    contains_errors = e.validate_monetary_value(req); // Gets data from monetary value form and validates it
    if (contains_errors) {
        req.session.data["error"] = "monetary_value";
        res.redirect("/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"]);
    } else {
        req.session.data["error"] = "";

        var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
        console.log(url);
        axios.get(url)
            .then((response) => {
                c = new Commodity();
                c.get_data(response.data);
                c.get_measure_data(req.session.data["origin"]);
                req.session.data["country_name"] = c.country_name;
                console.log("Units = " + c.units.length);
                // Where the commodity has units in any measures or there are Meursing codes applicable
                if ((c.units.length > 0) || (c.has_meursing)) {
                    res.redirect("/calculate/unit_value/" + req.params["goods_nomenclature_item_id"]);
                } else if (c.remedies.length > 0) {
                    res.redirect("/calculate/company/" + req.params["goods_nomenclature_item_id"]);
                } else {
                    res.redirect("/calculate/confirm/" + req.params["goods_nomenclature_item_id"]);
                }
            });
    }
}
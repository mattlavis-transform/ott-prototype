const axios = require('axios')
const Error_handler = require('./error_handler.js');
const Commodity = require('./commodity.js');

global.validate_date = function (req, res) {
    axios.get('https://api.exchangeratesapi.io/latest')
        .then((response) => {
            var data = response.data;
            var exchange_rate = parseFloat(data["rates"]["GBP"]);
            req.session.data["exchange_rate"] = exchange_rate;
            console.log("Getting exchange rate " + req.session.data["exchange_rate"]);
        });

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
    //console.log("Validator: Validating destination");
    e = new Error_handler();
    contains_errors = e.validate_destination(req); // Gets data from destination form and validates it

    /* RULES

    - If the form contains errors, then send back to the destination (self) form
    - If the destination is Northern Ireland, then show GB as an option, rather than just in the list
        - Omit GB from the list
    - Else, just show in the list
        - Omit N. Ireland from the list

    END RULES */

    if (contains_errors) {
        req.session.data["error"] = "destination";
        res.redirect("/calculate/destination/" + req.params["goods_nomenclature_item_id"]);
    } else {
        global.set_tariff(req)
        req.session.data["error"] = "";
        var destination = req.session.data["destination"];
        var url;

        if (destination == "Northern Ireland") {
            req.session.data["origin_options"] = {
                "show_gb": true
            };
        }
        else {
            req.session.data["origin_options"] = {
                "show_gb": false
            };
        }
        url = "/calculate/origin/" + req.params["goods_nomenclature_item_id"];
        res.redirect(url);


        // Check if the MFN is 0.00. If it is, then there is no value in proceeding
        // axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        //     .then((response) => {
        //         c = new Commodity();
        //         c.get_data(response.data);
        //         if (c.basic_duty_rate == "0.00 %") {
        //             res.redirect("/calculate/results/" + req.params["goods_nomenclature_item_id"]);
        //         } else {
        //             res.redirect("/calculate/origin/" + req.params["goods_nomenclature_item_id"]);
        //         }
        //     });
    }
}

global.validate_origin = function (req, res) {
    // Validate the origin form
    //console.log("Validator: Validating origin");
    e = new Error_handler();
    if (req.session.data["origin_gb"] == "GB") {
        req.session.data["origin"] = "GB";
    } else if (req.session.data["origin_gb"] == "EU") {
        req.session.data["origin"] = "EU";
    }
    contains_errors = e.validate_origin(req); // Gets data from origin form and validates it

    /* RULES

    - If the form contains errors, then send back to the origin (self) form
    - If the destination is Northern Ireland and the origin is European Union states, then go to message page
    - If the destination is Northern Ireland and the origin is GB, then go to ...
    - If the destination is Northern Ireland and the origin is RoW, then go to ...
    - If the destination is England, Scotland or Wales, then go to ...

    END RULES */

    var url;
    var origin = req.session.data["origin"] + "";
    var destination = req.session.data["destination"] + "";
    var eu = ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "EU", "FI", "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"];

    if (contains_errors) {
        req.session.data["error"] = "origin";
        res.redirect("/calculate/origin/" + req.params["goods_nomenclature_item_id"]);
    } else {
        /*
        GB to NI
        
        If the EU MFN duty is 0% then there is no point in going any further:
        - The trade is not at risk, therefore there are no duties - check this first
        */


        req.session.data["error"] = "";
        if (destination == "Northern Ireland") {
            if (origin == "GB") {
                var suffix = global.check_heading_commodity(req.params["goods_nomenclature_item_id"]);
                var axios_url = "https://www.trade-tariff.service.gov.uk/xi/api/v2/" + suffix;

                axios.get(axios_url)
                    .then((response) => {
                        c = new Commodity();
                        c.pass_request(req);
                        c.get_data(response.data);
                        c.get_measure_data(req, "basic");
                        var basic_duty_rate = c.basic_duty_rate;
                        basic_duty_rate = basic_duty_rate.replace(/%/g, "");
                        basic_duty_rate = basic_duty_rate.replace(/<span>/g, "");
                        basic_duty_rate = basic_duty_rate.trim();
                        basic_duty_rate = parseInt(basic_duty_rate);

                        var content = require('./message_content.json');
                        if (c.has_remedies == true) {
                            var retrieved_content = content["data"]["trade_remedies"];
                            retrieved_content["next_url"] = retrieved_content["next_url"].replace("{{ commodity }}", req.params["goods_nomenclature_item_id"]);
                            req.session.data["message"] = retrieved_content;
                            url = "/calculate/message/" + req.params["goods_nomenclature_item_id"];
                            res.redirect(url);
                        } else {
                            if (basic_duty_rate == 0) {
                                var retrieved_content = content["data"]["eu_third_country_duty_zero"];
                                retrieved_content["next_url"] = retrieved_content["next_url"].replace("{{ commodity }}", req.params["goods_nomenclature_item_id"]);
                                req.session.data["message"] = retrieved_content;
                                url = "/calculate/message/" + req.params["goods_nomenclature_item_id"];
                                res.redirect(url);
                            } else {
                                req.session.data["message"] = null;
                                url = "/calculate/uk_trader/" + req.params["goods_nomenclature_item_id"];
                                res.redirect(url);
                            }
                        }
                    });

            } else if (eu.includes(origin)) {
                // To NI from an EU member state
                var content = require('./message_content.json');
                var retrieved_content = content["data"]["trade_remedies"];
                req.session.data["message"] = retrieved_content;
                url = "/calculate/message/" + req.params["goods_nomenclature_item_id"];
                res.redirect(url);
            } else {
                // To NI from Rest of World
                url = "/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"]
                res.redirect(url);
            }
        } else {
            if (req.session.data["origin"] == "XI") {
                url = "/calculate/ni_to_gb/" + req.params["goods_nomenclature_item_id"]
            } else {
                url = "/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"]
            }
            res.redirect(url);
        }

    }
}

global.validate_uk_trader = function (req, res) {
    var a = 1;
    var uk_trader_scheme = req.session.data["uktrader_scheme"];
    var origin = req.session.data["origin"];
    var origin_gb = req.session.data["origin_gb"];
    var destination = req.session.data["destination"];
    var url;
    /* RULES

    - If the destination is Northern Ireland (which it will always be)
        - If the origin is GB
            - If the user is a member of the UK Trader Scheme
                - Go to the processing page
            - else
                - Go to the UK origin page

        - Else, if the origin is Rest of World
            - If the user is a member of the UK Trader Scheme
                - Go to the processing page
            - else
                - Go to the results page

    END RULES */

    delete req.session.data['final_use_string'];
    delete req.session.data['processing_string'];
    delete req.session.data['certificate_string'];

    if (destination == "Northern Ireland") {
        if (origin == "GB") {
            if (uk_trader_scheme == "yes") {
                req.session.data["uk_trader_string"] = "Authorised";

                req.session.data["message"] = null;
                url = "/calculate/final_use/" + req.params["goods_nomenclature_item_id"];
            } else {
                req.session.data["uk_trader_string"] = "Not authorised";
                url = "/calculate/certificate_of_origin/" + req.params["goods_nomenclature_item_id"];
            }
        } else if (origin_gb == "other") {
            if (uk_trader_scheme == "yes") {
                req.session.data["uk_trader_string"] = "Authorised";
                url = "/calculate/final_use/" + req.params["goods_nomenclature_item_id"];
            } else {
                req.session.data["uk_trader_string"] = "Not authorised";
                url = "/calculate/confirm/" + req.params["goods_nomenclature_item_id"];
            }
        }
    }
    res.redirect(url);

}

global.validate_final_use = function (req, res) {
    var a = 1;
    // var uk_trader_scheme = req.session.data["uktrader_scheme"];
    var final_use = req.session.data["final_use"];
    var origin = req.session.data["origin"];
    var origin_gb = req.session.data["origin_gb"];
    var destination = req.session.data["destination"];
    var url;
    /* RULES

    - If the destination is Northern Ireland (which it will always be)
        - If the origin is GB
            - If the user intends final use
                - Go to the processing page
            - else
                - Go to the UK origin page

        - Else, if the origin is Rest of World
            - If the user intends final use
                - Go to the processing page
            - else
                - Go to the results page

    END RULES */
    delete req.session.data['processing_string'];
    delete req.session.data['certificate_string'];

    if (destination == "Northern Ireland") {
        if (origin == "GB") {
            if (final_use == "yes") {
                req.session.data["final_use_string"] = "For sale to, or final use by, end-consumers located in the Northern Ireland";
                req.session.data["message"] = null;
                url = "/calculate/processing/" + req.params["goods_nomenclature_item_id"];
            } else {
                req.session.data["final_use_string"] = "Not for sale to, or final use by, end-consumers located in the Northern Ireland";
                url = "/calculate/certificate_of_origin/" + req.params["goods_nomenclature_item_id"];
            }
        } else if (origin_gb == "other") {
            if (final_use == "yes") {
                req.session.data["final_use_string"] = "For sale to, or final use by, end-consumers located in the Northern Ireland";
                url = "/calculate/processing/" + req.params["goods_nomenclature_item_id"];
            } else {
                req.session.data["final_use_string"] = "Not for sale to, or final use by, end-consumers located in the Northern Ireland";
                url = "/calculate/confirm/" + req.params["goods_nomenclature_item_id"];
            }
        }
    }
    res.redirect(url);

}

global.validate_processing = function (req, res) {
    var a = 1;
    var processing = req.session.data["processing"];
    var origin = req.session.data["origin"];
    var destination = req.session.data["destination"];
    var url;
    /* RULES

    - If the destination is Northern Ireland (which it will always be)
        - If the origin is GB
            - If no processing
                - Show message page (no duties)
            - If permitted processing
                - Show message page (no duties)
            - If prohibited processing
                - Get monetary value

        - Else, if the origin is Rest of World
            - If no processing
                - Show message page (uk duties)
            - If permitted processing
                - Show results page (uk duties)
            - If prohibited processing
                - Show results page (eu duties)

    END RULES */

    var wrapper = "There is <strong>no import duty to pay</strong> because:</p><ul class='govuk-list govuk-list--bullet'>{{ placeholder }}</ul><p class='govuk-body'>You may be called upon to provide proof of your membership of the UK Trader Scheme and that your goods are not going to be subject to further processing.</p>";

    var txt_origin_gb = "<li>You are transporting goods from <b>England, Scotland or Wales</b> to Northern Ireland</li>";
    var txt_ukts = "<li>You are a member of the UK Trader Scheme</li>";
    var txt_final_use = "<li>Your import is <b>for sale to, or final use by</b>, end-consumers located in Northern Ireland</li>";
    var txt_no_processing = "<li>You <b>do not intend to further process</b> the goods on arrival in Northern Ireland</li>";
    var txt_non_commercial_processing = "<li>The importer had a total <b>annual turnover</b> of less than <b>£500,000</b> in its most recent complete financial year</li>";
    var txt_permitted_commercial_processing = "<li>You will be undertaking <b>permitted commercial processing</b> on the goods on arrival in Northern Ireland</li>";

    var content = "";

    delete req.session.data['certificate_string'];

    req.session.data["processing_string"] = "";

    if (destination == "Northern Ireland") {
        if (origin == "GB") {
            if (processing == "prohibited_commercial_processing") {
                req.session.data["processing_string"] = "Commercial processing, other than those exempted";
                url = "/calculate/certificate_of_origin/" + req.params["goods_nomenclature_item_id"];
                //url = "https://www.google.com";
            } else {
                content = txt_origin_gb;
                content += txt_ukts;
                content += txt_final_use;
                if (processing == "no_processing") {
                    req.session.data["processing_string"] = "No processing";
                    content += txt_no_processing;

                } else if (processing == "non_commercial_processing") {
                    req.session.data["processing_string"] = "Non-commercial processing";
                    content += txt_non_commercial_processing;

                } else if (processing == "permitted_commercial_processing") {
                    req.session.data["processing_string"] = "Permitted commercial processing";
                    content += txt_permitted_commercial_processing;
                }

                content = wrapper.replace("{{ placeholder }}", content)
                req.session.data["message"] = {
                    "title": "There is no import duty to pay",
                    "message": content,
                    "next_url": "/calculate/date/" + req.params["goods_nomenclature_item_id"],
                    "button_face": "Start again"
                };
                url = "/calculate/message/" + req.params["goods_nomenclature_item_id"];

            }


        } else {
            if (processing == "no_processing") {
                req.session.data["processing_string"] = "No processing";

            } else if (processing == "non_commercial_processing") {
                req.session.data["processing_string"] = "Non-commercial processing";

            } else if (processing == "permitted_commercial_processing") {
                req.session.data["processing_string"] = "Permitted commercial processing";

            } else if (processing == "prohibited_commercial_processing") {
                req.session.data["processing_string"] = "Commercial processing, other than those exempted";
            }

            url = "/calculate/confirm/" + req.params["goods_nomenclature_item_id"];
        }
    }
    res.redirect(url);

}

global.validate_certificate_of_origin = function (req, res) {
    var a = 1;
    var origin_certificate = req.session.data["origin_certificate"];
    var origin = req.session.data["origin"];
    var destination = req.session.data["destination"];
    var url;
    /* RULES

    - If the destination is Northern Ireland (which it will always be)
        - If the origin is GB (which it will always be)
            - If the user has a certificate of origin
                - Show message page (no duties)
            - Else
                - Show monetary value page

    END RULES */

    if (destination == "Northern Ireland") {
        if (origin == "GB") {
            if (origin_certificate == "yes") {
                req.session.data["certificate_string"] = "Valid certificate of origin";
                var content = require('./message_content.json');
                var retrieved_content = content["data"]["certificate_of_origin"];
                req.session.data["message"] = retrieved_content;
                url = "/calculate/message/" + req.params["goods_nomenclature_item_id"];
                req.session.data["at_risk"] = false;
            } else {
                req.session.data["certificate_string"] = "No valid certificate of origin";
                req.session.data["at_risk"] = true;
                var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];

                // var url2 = "/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"];
                // res.redirect(url2);

                axios.get(url)
                    .then((response) => {
                        var url2;
                        c = new Commodity();
                        c.get_data(response.data);
                        c.get_measure_data(req, req.session.data["origin"]);

                        if (c.has_meursing) {
                            url2 = "/calculate/meursing/" + req.params["goods_nomenclature_item_id"];
                        } else {
                            url2 = "/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"];
                        }
                        res.redirect(url2);
                    });
            }
        }
    }
    //res.redirect(url);

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
        var total_cost = parseFloat(req.session.data["monetary_value"]);
        if (req.session.data["insurance_cost"] != "") {
            total_cost += parseFloat(req.session.data["insurance_cost"]);
        } else {
            req.session.data["insurance_cost"] = 0;
        }

        if (req.session.data["shipping_cost"] != "") {
            total_cost += parseFloat(req.session.data["shipping_cost"]);
        } else {
            req.session.data["shipping_cost"] = 0;
        }
        req.session.data["total_cost"] = total_cost;
        req.session.data["error"] = "";

        var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
        axios.get(url)
            .then((response) => {
                c = new Commodity();
                c.get_data(response.data);
                c.get_measure_data(req, req.session.data["origin"]);
                req.session.data["country_name"] = c.country_name;
                var a = 1
                //console.log("Units = " + c.units.length);

                /* RULES
                If there are units relevant to import duties
                    - then always show the units screen
                Otherwise:
                    - If destination is Northern Ireland
                        - if origin is rest of world
                            - show the UK Trader screen
                        - otherwise
                            - show the confirm screen
                    - Otherwise
                        - show the confirm screen

                END RULES */


                // Where the commodity has units in any measures or there are Meursing codes applicable
                if ((c.units.length > 0) || (c.has_meursing)) {
                    res.redirect("/calculate/unit_value/" + req.params["goods_nomenclature_item_id"]);
                } else {
                    if (req.session.data["destination"] == "Northern Ireland") {
                        if (req.session.data["origin_gb"] == "other") {
                            req.session.data["message"] = null;
                            url = "/calculate/uk_trader/" + req.params["goods_nomenclature_item_id"];
                        } else {
                            url = "/calculate/confirm/" + req.params["goods_nomenclature_item_id"];
                        }
                    } else {
                        url = "/calculate/confirm/" + req.params["goods_nomenclature_item_id"];
                    }
                }
                res.redirect(url);
            });
    }
}

global.validate_unit_value = function (req, res) {
    // Validate the unit value form
    //console.log("Checking unit value");
    e = new Error_handler();
    contains_errors = e.validate_unit_value(req); // Gets data from unit value form and validates it
    if (contains_errors) {
        req.session.data["error"] = "unit_value";
        res.redirect("/calculate/unit_value/" + req.params["goods_nomenclature_item_id"]);
    } else {
        req.session.data["error"] = "";
        var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
        // console.log(url);
        axios.get(url)
            .then((response) => {
                c = new Commodity();
                c.get_data(response.data);
                c.get_measure_data(req, req.session.data["origin"]);
                req.session.data["country_name"] = c.country_name;
                if (req.session.data["destination"] == "Northern Ireland") {
                    if (req.session.data["origin_gb"] == "GB") {
                        // GB to Northern Ireland
                        res.redirect("/calculate/confirm/" + req.params["goods_nomenclature_item_id"]);
                    } else {
                        // ROW to Northern Ireland (for now) -- this is where the complex calcs would get done
                        res.redirect("/calculate/uk_trader/" + req.params["goods_nomenclature_item_id"]);
                    }

                } else {
                    res.redirect("/calculate/confirm/" + req.params["goods_nomenclature_item_id"]);
                }
                // if (c.has_meursing) {
                //     res.redirect("/calculate/meursing/" + req.params["goods_nomenclature_item_id"]);
                // } else if (c.remedies.length > 0) {
                //     res.redirect("/calculate/company/" + req.params["goods_nomenclature_item_id"]);
                // } else {
                //     res.redirect("/calculate/confirm/" + req.params["goods_nomenclature_item_id"]);
                // }
            });
    }
}
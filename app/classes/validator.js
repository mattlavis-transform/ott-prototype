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
                        c.get_measure_data("basic");
                        var basic_duty_rate = c.basic_duty_rate;
                        basic_duty_rate = basic_duty_rate.replace(/%/g, "");
                        basic_duty_rate = basic_duty_rate.replace(/<span>/g, "");
                        basic_duty_rate = basic_duty_rate.trim();
                        basic_duty_rate = parseInt(basic_duty_rate);
                        // console.log(basic_duty_rate);

                        if (c.has_remedies == true) {
                            req.session.data["message"] = {
                                "title": "EU duties apply to this import",
                                "message": "Because trade defence measures are applied to this commodity code on the European Union's tariff, imports of this commodity are treated as 'at risk' under all circumstances. The EU's import duties will be payable on this import to Northern Ireland.</p><p>Click on the 'Continue' button to enter the monetary value of your import, to help to calculate the applicable import duties.",
                                "next_url": "/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"],
                                "button_face": "Continue"
                            };
                            url = "/calculate/message/" + req.params["goods_nomenclature_item_id"];
                            res.redirect(url);

                            // Go direct to asking the monetary value
                            // url = "/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"];
                            // res.redirect(url);
                        } else {
                            if (basic_duty_rate == 0) {
                                req.session.data["message"] = {
                                    "title": "There is no import duty to pay",
                                    "message": "There is no import duty to pay when importing goods into Northern Ireland from GB when the EU's Third country duty is 0.00%."
                                };
                                url = "/calculate/message/" + req.params["goods_nomenclature_item_id"];
                                res.redirect(url);
                            } else {
                                req.session.data["message"] = {
                                    "title": "System checks",
                                    "message": "</p><ul class='govuk-list govuk-list--bullet'><li>The system will check first if there are any EU trade defence measures.</li><li>If there are trade defence measures (anti-dumping, anti-subsidy, safeguards, including provisionally applied), then the trade is definitely at risk, and this screen will not be shown.</li><li>If there are no Trade Defence measures, then check if the EU MFN duty is 0%.</li><li>If the MFN duty is 0%, then there is no import duty.</li></ul>"
                                };
                                req.session.data["message"] = null;
                                url = "/calculate/uk_trader/" + req.params["goods_nomenclature_item_id"];
                                res.redirect(url);
                            }
                        }
                    });

            } else if (eu.includes(origin)) {
                // To NI from an EU member state
                req.session.data["message"] = {
                    "title": "There is no import duty to pay",
                    "message": "There is no import duty to pay when importing goods into Northern Ireland from a European Union member state."
                };
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

                req.session.data["message"] = {
                    "title": "Questions on this page",
                    "message": "<ul class='govuk-list govuk-list--bullet'><li>In the intro blurb, is it sufficient to refer to the status 'at risk'? Will people know what it means?</li><li>What verifications and validations are likely to be required, where and by whom?</li><li>Is the list of permitted processing activitites below exhaustive?</li><li>In your sentence: <b>End-use products can only be de-risked if the goods will stay in NI</b>, how does that fit into the process?</li><li>Should we work out that the product is an end use product? If so, is it the case that, if a good as a 103 measure, then it is not end-use, if it has a 105 measure, then it is end use?</li></ul>"
                };
                req.session.data["message"] = null;
                url = "/calculate/final_use/" + req.params["goods_nomenclature_item_id"];
            } else {
                req.session.data["uk_trader_string"] = "Not authorised";
                url = "/calculate/certificate_of_origin/" + req.params["goods_nomenclature_item_id"];
            }
        } else if (origin_gb == "other") {
            if (uk_trader_scheme == "yes") {
                req.session.data["uk_trader_string"] = "Authorised";
                req.session.data["message"] = {
                    "title": "System checks",
                    "message": "Rules around end use</p><ul class='govuk-list govuk-list--bullet'><li></li></ul>"
                };
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
                req.session.data["message"] = {
                    "title": "Questions on this page",
                    "message": "<ul class='govuk-list govuk-list--bullet'><li>In the intro blurb, is it sufficient to refer to the status 'at risk'? Will people know what it means?</li><li>What verifications and validations are likely to be required, where and by whom?</li><li>Is the list of permitted processing activitites below exhaustive?</li><li>In your sentence: <b>End-use products can only be de-risked if the goods will stay in NI</b>, how does that fit into the process?</li><li>Should we work out that the product is an end use product? If so, is it the case that, if a good as a 103 measure, then it is not end-use, if it has a 105 measure, then it is end use?</li></ul>"
                };
                req.session.data["message"] = null;
                url = "/calculate/processing/" + req.params["goods_nomenclature_item_id"];
            } else {
                req.session.data["final_use_string"] = "Not for sale to, or final use by, end-consumers located in the Northern Ireland";
                url = "/calculate/certificate_of_origin/" + req.params["goods_nomenclature_item_id"];
            }
        } else if (origin_gb == "other") {
            if (final_use == "yes") {
                req.session.data["final_use_string"] = "For sale to, or final use by, end-consumers located in the Northern Ireland";
                req.session.data["message"] = {
                    "title": "System checks",
                    "message": "Rules around end use</p><ul class='govuk-list govuk-list--bullet'><li></li></ul>"
                };
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
    var txt_final_use = "<li>Your import is <b>for sale to, or final use by</b>, end-consumers located in the United Kingdom</li>";
    var txt_no_processing = "<li>You <b>do not intend to further process</b> the goods on arrival in the United Kingdom</li>";
    var txt_non_commercial_processing = "<li>You will be undertaking <b>non-commercial processing</b> on the goods on arrival in Northern Ireland</li>";
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
                req.session.data["message"] = {
                    "title": "There is no import duty to pay",
                    "message": "There is <strong>no import duty to pay</strong> because:</p><ul class='govuk-list govuk-list--bullet'><li>You are transporting goods from England, Scotland or Wales to Northern Ireland.</li><li>You are able to take advantage of the preferential tariffs provided by the UK / EU Trade and Co-operation Agreement (TCA) and have a valid Certificate of Origin.</li></ul><p class='govuk-body'>You may be called upon to provide a copy of your Certificate or Origin to avoid paying duties.</p>"
                };
                url = "/calculate/message/" + req.params["goods_nomenclature_item_id"];
            } else {
                req.session.data["certificate_string"] = "No valid certificate of origin";
                url = "/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"];
            }
        }
    }
    res.redirect(url);

}

global.validate_monetary_value = function (req, res) {
    // Validate the monetary value form
    //console.log("Validator: Validating monetary value");
    e = new Error_handler();
    contains_errors = e.validate_monetary_value(req); // Gets data from monetary value form and validates it
    if (contains_errors) {
        req.session.data["error"] = "monetary_value";
        res.redirect("/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"]);
    } else {
        req.session.data["error"] = "";

        var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
        axios.get(url)
            .then((response) => {
                c = new Commodity();
                c.get_data(response.data);
                c.get_measure_data(req.session.data["origin"]);
                req.session.data["country_name"] = c.country_name;
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
                            req.session.data["message"] = {
                                "title": "System checks",
                                "message": "At this point, the service checks the UK MFN and the EU MFN, as the next steps are dependent on the difference between the two.</p><ul class='govuk-list govuk-list--bullet'><li>If the EU duty is equal to or higher than the UK duty, then the UK duty is payable, and therefore this screen will not need to be shown.</li><li>If the EU duty is more than 3% higher than the UK duty, then the EU duty will be applicable, and again this screen will not be shown.</li><li>If the EU duty is higher than the UK duty, but less than 3% higher than the UK equivalent, then that is the only circumstance when this screen will show in this flow (RoW to NI).</li><li>Really need to be 100% certain on the '3%' rule, as the EU describes this slightly differently.</li></ul>"
                            };
                            //req.session.data["message"] = null;
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
                c.get_measure_data(req.session.data["origin"]);
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
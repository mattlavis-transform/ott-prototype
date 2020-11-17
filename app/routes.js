const express = require('express')
const axios = require('axios')
const router = express.Router()
const api_helper = require('./API_helper');
const { response } = require('express');

const Heading = require('./classes/heading.js');
const Commodity = require('./classes/commodity.js');
const Error_handler = require('./classes/error_handler.js');

require('./classes/global.js');

// Add your routes here - above the module.exports line
var scopeId;

/* ############################################################################ */
/* ###################              BEGIN BROWSE              ################# */
/* ############################################################################ */

// Browse page
router.get(['/browse/:scopeId', '/browse/'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/sections')
        .then((response) => {
            res.render('browse', { 'sections': response.data, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});

// Browse within a section
router.get(['/sections/:sectionId', '/sections/:sectionId/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/sections/' + req.params["sectionId"])
        .then((response) => {
            res.render('section', { 'section': response.data, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});

// Browse within a chapter
router.get(['/chapters/:chapterId', '/chapters/:chapterId/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    s = req.params["chapterId"];
    s = s.padStart(2, "0");
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/chapters/' + s)
        .then((response) => {
            res.render('chapters', { 'chapter': response.data, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});

// Browse within a heading
router.get(['/headings/:headingId', '/headings/:headingId/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/headings/' + req.params["headingId"])
        .then((response) => {
            h = new Heading(response.data);
            res.render('headings', { 'heading': h, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});

// Browse a single commodity
router.get(['/commodities/:goods_nomenclature_item_id/', '/commodities/:goods_nomenclature_item_id/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    req.session.data["error"] = "";
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            //res.render('commodities', { 'commodity': response.data, 'date_string': global.todays_date() });
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            c.get_measure_data("basic");
            res.render('commodities', { 'commodity': c, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});


// Browse a single commodity (version 2: sorted)
router.get(['/commodities2/:goods_nomenclature_item_id/', '/commodities2/:goods_nomenclature_item_id/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    req.session.data["error"] = "";
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            //res.render('commodities', { 'commodity': response.data, 'date_string': global.todays_date() });
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            c.get_measure_data("basic");
            c.sort_measures();
            //country_picker = new CountryPicker()
            res.render('commodities2', {'commodity': c, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});

/* ############################################################################ */
/* ###################                END BROWSE              ################# */
/* ############################################################################ */


/* ############################################################################ */
/* ###################              BEGIN SEARCH              ################# */
/* ############################################################################ */

// Search page
router.get(['/search/:scopeId', '/search/', '/sections/'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/sections')
        .then((response) => {
            res.render('search', { 'sections': response.data, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});




// router.get(['/browse/:scopeId', '/browse/'], function (req, res) {
//     scopeId = global.get_scope(req.params["scopeId"]);
//     root_url = global.get_root_url(req, scopeId);
//     title = global.get_title(scopeId);
//     axios.get('https://www.trade-tariff.service.gov.uk/api/v2/sections')
//         .then((response) => {
//             res.render('browse', { 'sections': response.data, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
//         });
// });



// Search results / data handler
router.post(['/search/data_handler/', '/search/data_handler/:goods_nomenclature_item_id/:scopeId'], function (req, res) {
    //console.log("Search results handler");
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    var search_term = req.session.data["search"];

    if (Number.isSafeInteger(search_term) && (search_term.length == 10)) {
        res.redirect("/commodities/" + req.session.data["search"]);
    } else {
        //res.redirect("/search/");
        res.redirect("/commodities/" + req.session.data["search"]);
    }
});
/* ############################################################################ */
/* ###################               END SEARCH               ################# */
/* ############################################################################ */


/* ############################################################################ */
/* ###################       BEGIN SUBSIDIARY NAVIGATION      ################# */
/* ############################################################################ */

// A-Z index
router.get(['/a-z-index/:letter', '/a-z-index/:letter/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    var url = 'https://www.trade-tariff.service.gov.uk/api/v2/search_references.json?query[letter]=' + req.params["letter"];
    axios.get(url)
        .then((response) => {
            res.render('a-z-index', { 'headings': response.data, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'letter': req.params["letter"], 'date_string': global.todays_date() });
        });
});

// Downloads
router.get(['/downloads/', '/downloads/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('downloads', {'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});
/* ############################################################################ */
/* ###################        END SUBSIDIARY NAVIGATION       ################# */
/* ############################################################################ */

/* ############################################################################ */
/* ###################         BEGIN TOOLS SECTION           ################# */
/* ############################################################################ */

// Tools
router.get(['/tools/', '/tools/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools', {'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Quotas
router.get(['/quotas/', '/quotas/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('quotas', {'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Certificates
router.get(['/certificates/', '/certificates/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('certificates', {'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Additional codes
router.get(['/additional_codes/', '/additional_codes/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('additional_codes', {'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Footnotes
router.get(['/footnotes/', '/footnotes/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('footnotes', {'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Chemicals
router.get(['/chemicals/', '/chemicals/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('chemicals', {'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Exchange rates
router.get(['/exchange_rates/', '/exchange_rates/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('exchange_rates', {'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

/* ############################################################################ */
/* ###################           END TOOLS SECTION           ################# */
/* ############################################################################ */



/* ############################################################################ */
/* ###################           BEGIN CALCULATOR             ################# */
/* ############################################################################ */

// Calculator - Data handler
router.get('/calculate/data_handler/:goods_nomenclature_item_id', function (req, res) {
    var err, referer, c;
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Data handler");
    referer = req.headers.referer;

    if (referer.indexOf("date") !== -1) {
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
    } else if (referer.indexOf("destination") !== -1) {
        // Validate the destination form
        //console.log("Checking destination");
        e = new Error_handler();
        contains_errors = e.validate_destination(req); // Gets data from destination form and validates it
        if (contains_errors) {
            req.session.data["error"] = "destination";
            res.redirect("/calculate/destination/" + req.params["goods_nomenclature_item_id"]);
        } else {
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
    } else if (referer.indexOf("origin") !== -1) {
        // Validate the origin form
        //console.log("Checking origin");
        e = new Error_handler();
        contains_errors = e.validate_origin(req); // Gets data from origin form and validates it
        if (contains_errors) {
            req.session.data["error"] = "origin";
            res.redirect("/calculate/origin/" + req.params["goods_nomenclature_item_id"]);
        } else {
            req.session.data["error"] = "";
            res.redirect("/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"]);
        }
    } else if (referer.indexOf("monetary_value") !== -1) {
        // Validate the monetary value form
        //console.log("Checking monetary value");
        e = new Error_handler();
        contains_errors = e.validate_monetary_value(req); // Gets data from monetary svalue form and validates it
        if (contains_errors) {
            req.session.data["error"] = "monetary_value";
            res.redirect("/calculate/monetary_value/" + req.params["goods_nomenclature_item_id"]);
        } else {
            req.session.data["error"] = "";

            axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
                .then((response) => {
                    c = new Commodity();
                    c.get_data(response.data);
                    c.get_measure_data(req.session.data["origin"]);
                    req.session.data["country_name"] = c.country_name;
                    if ((c.units.length > 0) || (c.has_meursing)) {
                        res.redirect("/calculate/unit_value/" + req.params["goods_nomenclature_item_id"]);
                    } else if (c.remedies.length > 0) {
                        res.redirect("/calculate/company/" + req.params["goods_nomenclature_item_id"]);
                    } else {
                        res.redirect("/calculate/confirm/" + req.params["goods_nomenclature_item_id"]);
                    }

                });
        }
    } else if (referer.indexOf("unit_value") !== -1) {
        // Validate the unit value form
        //console.log("Checking unit value");
        e = new Error_handler();
        contains_errors = e.validate_unit_value(req); // Gets data from unit value form and validates it
        if (contains_errors) {
            req.session.data["error"] = "unit_value";
            res.redirect("/calculate/unit_value/" + req.params["goods_nomenclature_item_id"]);
        } else {
            req.session.data["error"] = "";
            axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
                .then((response) => {
                    c = new Commodity();
                    c.get_data(response.data);
                    c.get_measure_data(req.session.data["origin"]);
                    req.session.data["country_name"] = c.country_name;
                    if (c.has_meursing) {
                        res.redirect("/calculate/meursing/" + req.params["goods_nomenclature_item_id"]);
                    } else if (c.remedies.length > 0) {
                        res.redirect("/calculate/company/" + req.params["goods_nomenclature_item_id"]);
                    } else {
                        res.redirect("/calculate/confirm/" + req.params["goods_nomenclature_item_id"]);
                    }
                });
        }
    } else if (referer.indexOf("meursing") !== -1) {
        // Validate the unit value form
        //console.log("Checking Meursing code");
        e = new Error_handler();
        contains_errors = e.validate_meursing(req); // Gets data from meursing code form and validates it
        if (contains_errors) {
            req.session.data["error"] = "meursing";
            res.redirect("/calculate/meursing/" + req.params["goods_nomenclature_item_id"]);
        } else {
            req.session.data["error"] = "";
            axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
                .then((response) => {
                    c = new Commodity();
                    c.get_data(response.data);
                    c.get_measure_data(req.session.data["origin"]);
                    req.session.data["country_name"] = c.country_name;
                    if (c.remedies.length > 0) {
                        res.redirect("/calculate/company/" + req.params["goods_nomenclature_item_id"]);
                    } else {
                        res.redirect("/calculate/confirm/" + req.params["goods_nomenclature_item_id"]);
                    }
                });
        }
    }
});

// Calculator - Date
router.get('/calculate/date/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Date");
    var err = req.session.data["error"];
    var import_date_day = req.session.data["import_date-day"];
    var import_date_month = req.session.data["import_date-month"];
    var import_date_year = req.session.data["import_date-year"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            res.render('calculate/01_date', { 'commodity': c, 'error': err, 'import_date_day': import_date_day, 'import_date_month': import_date_month, 'import_date_year': import_date_year });
        });
});

// Calculator - Destination
router.get('/calculate/destination/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Destination");
    var err = req.session.data["error"];
    var destination = req.session.data["destination"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            res.render('calculate/02_destination', { 'commodity': response.data, 'error': err, 'destination': destination });
        });
});

// Calculator - Origin
router.get('/calculate/origin/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Origin");
    var err = req.session.data["error"];
    var origin = req.session.data["origin"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            res.render('calculate/03_origin', { 'commodity': response.data, 'error': err, 'origin': origin });
        });
});

// Calculator - Monetary value
router.get('/calculate/monetary_value/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Monetary value");
    var err = req.session.data["error"];
    var monetary_value = req.session.data["monetary_value"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            res.render('calculate/04_monetary_value', { 'commodity': response.data, 'error': err, 'monetary_value': monetary_value });
        });
});

// Calculator - Unit value
router.get('/calculate/unit_value/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Unit value");
    var err = req.session.data["error"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            c.get_measure_data(req.session.data["origin"]);
            res.render('calculate/05_unit_value', { 'commodity': c, 'error': err });
        });
});

// Calculator - Meursing
router.get('/calculate/meursing/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Meursing");
    var err = req.session.data["error"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            res.render('calculate/06_meursing', { 'commodity': response.data, 'error': err });
        });
});

// Calculator - Company
router.get('/calculate/company/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Company");
    var err = req.session.data["error"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "company";
            c.get_data(response.data);
            c.get_measure_data(req.session.data["origin"]);
            res.render('calculate/07_company', { 'commodity': c, 'error': err });
        });
});

// Calculator - Confirm
router.get('/calculate/confirm/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Confirm");
    var err = req.session.data["error"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "confirm";
            c.get_data(response.data);
            c.get_measure_data(req.session.data["origin"]);
            res.render('calculate/08_confirm', { 'commodity': c, 'error': err });
        });
});

// Calculator - Results
router.get('/calculate/results/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    var err = req.session.data["error"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "results";
            c.get_data(response.data);
            c.get_exchange_rate();
            c.get_measure_data(req.session.data["origin"]);
            res.render('calculate/09_results', { 'commodity': c, 'error': err });
        });
});

/* ############################################################################ */
/* ###################             END CALCULATOR             ################# */
/* ############################################################################ */

module.exports = router

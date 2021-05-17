const express = require('express')
const axios = require('axios')
const router = express.Router()
const api_helper = require('./API_helper');
const { response } = require('express');
const Heading = require('./classes/heading.js');
const Commodity = require('./classes/commodity.js');
const Roo = require('./classes/roo.js');
const ImportedContext = require('./classes/imported_context.js');
const CPCController = require('./classes/cpc/cpc-controller.js');
const Error_handler = require('./classes/error_handler.js');
const date = require('date-and-time');


require('./classes/global.js');
require('./classes/news.js');
require('./classes/validator.js');

// Add your routes here - above the module.exports line
var scopeId;
//var browse_breadcrumb = "Browse the Goods Classification";
var browse_breadcrumb = "Search or browse the Tariff";

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
            res.render('browse', { 'sections': response.data, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});
/* ############################################################################ */
/* ###################               FURNITURE                ################# */
/* ############################################################################ */

// Browse page
router.get(['/cookies/:scopeId', '/cookies/'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('cookies', { 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
});

/* ############################################################################ */
/* ###################                TEMPORARY               ################# */
/* ############################################################################ */

// Sections page - this is a temporary combination of the two pages until we can disassociate the two
router.get(['/sections/'], function (req, res) {
    scopeId = "";
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    // console.log("Title = " + title);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/sections')
        .then((response) => {
            res.render('sections', { 'sections': response.data, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});
// Sections page - this is a temporary combination of the two pages until we can disassociate the two
router.get(['/sections/ni'], function (req, res) {
    scopeId = "ni";
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    // console.log(title)
    // console.log("Title = " + title);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/sections')
        .then((response) => {
            res.render('sections', { 'sections': response.data, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});

// Browse within a section
router.get(['/sections/:sectionId', '/sections/:sectionId/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/sections/' + req.params["sectionId"])
        .then((response) => {
            res.render('section', { 'section': response.data, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
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
            res.render('chapters', { 'chapter': response.data, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
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
            res.render('headings', { 'heading': h, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
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
            c.get_measure_data(req, "basic");
            c.sort_measures();
            res.render('commodities', { 'commodity': c, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
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
            c.get_measure_data(req, "basic");
            c.sort_measures();
            //country_picker = new CountryPicker()
            res.render('commodities2', { 'commodity': c, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});

/* ############################################################################ */
/* ###################                END BROWSE              ################# */
/* ############################################################################ */


/* ############################################################################ */
/* ###################              BEGIN SEARCH              ################# */
/* ############################################################################ */

// Search page
router.get(['/search/:scopeId', '/search/', '/search//'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/sections')
        .then((response) => {
            res.render('search', { 'sections': response.data, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});


// Search results page
router.get(['/search_results/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    title = "sdfs";
    res.render('search_results', { 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
});



// Search results / data handler
router.post(['/search/data_handler/', '/search/data_handler/:goods_nomenclature_item_id/:scopeId'], function (req, res) {
    //console.log("Search results handler");
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    var search_term = req.session.data["search"].trim().replace(" ", "");

    //if (Number.isSafeInteger(search_term) && (search_term.length == 10)) {
    if (search_term.length == 10) {
        res.redirect("/commodities/" + search_term);
    } else {
        res.redirect("/search/");
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
    res.render('downloads', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// News
router.get(['/news/', '/news/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    news = global.get_news();
    res.render('news', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'news': news, 'date_string': global.todays_date() });
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
    res.render('tools', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Quotas
router.get(['/quotas/', '/quotas/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('quotas', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Certificates
router.get(['/certificates/', '/certificates/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('certificates', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Additional codes
router.get(['/additional_codes/', '/additional_codes/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('additional_codes', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Footnotes
router.get(['/footnotes/', '/footnotes/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('footnotes', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Chemicals
router.get(['/chemicals/', '/chemicals/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('chemicals', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Exchange rates
router.get(['/exchange_rates/', '/exchange_rates/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('exchange_rates', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

/* ############################################################################ */
/* ###################           END TOOLS SECTION           ################# */
/* ############################################################################ */









/* ############################################################################ */
/* ###################           BEGIN CALCULATOR             ################# */
/* ############################################################################ */

// Calculator - Data handler
router.get(['/calculate/data_handler/:goods_nomenclature_item_id', '/calculate/data_handler/'], function (req, res) {
    var err, referer, c;
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    referer = req.headers.referer;

    if (referer.indexOf("date") !== -1) {
        global.validate_date(req, res);

    } else if (referer.indexOf("destination") !== -1) {
        global.validate_destination(req, res);

    } else if (referer.indexOf("certificate_of_origin") !== -1) {
        global.validate_certificate_of_origin(req, res);

    } else if ((referer.indexOf("origin") !== -1) && (referer.indexOf("certificate") === -1)) {
        global.validate_origin(req, res);

    } else if (referer.indexOf("uk_trader") !== -1) {
        global.validate_uk_trader(req, res);

    } else if (referer.indexOf("processing") !== -1) {
        global.validate_processing(req, res);

    } else if (referer.indexOf("monetary_value") !== -1) {
        global.validate_monetary_value(req, res);

    } else if (referer.indexOf("unit_value") !== -1) {
        var a = 1;
        global.validate_unit_value(req, res);

    } else if (referer.indexOf("final_use") !== -1) {
        var a = 1;
        global.validate_final_use(req, res);

    } else if (referer.indexOf("meursing") !== -1) {
        // Validate the Meursing start page

        var meursing_known = req.session.data["meursing-known"];
        if (meursing_known == "no") {
            res.redirect("/meursing/starch-glucose");
        } else {
            var url = "/calculate/confirm/" + req.params["goods_nomenclature_item_id"];
            res.redirect(url);
        }

        //console.log("Checking Meursing code");
        // e = new Error_handler();
        // contains_errors = e.validate_meursing(req); // Gets data from meursing code form and validates it
        // if (contains_errors) {
        //     req.session.data["error"] = "meursing";
        //     res.redirect("/calculate/meursing/" + req.params["goods_nomenclature_item_id"]);
        // } else {
        //     req.session.data["error"] = "";

        //     var url = global.get_commodity_api(req);
        //     axios.get(url)
        //         .then((response) => {
        //             c = new Commodity();
        //             c.get_data(response.data);
        //             c.get_measure_data(req, req.session.data["origin"]);
        //             req.session.data["country_name"] = c.country_name;
        //             if (c.remedies.length > 0) {
        //                 res.redirect("/calculate/company/" + req.params["goods_nomenclature_item_id"]);
        //             } else {
        //                 res.redirect("/calculate/confirm/" + req.params["goods_nomenclature_item_id"]);
        //             }
        //         });
        // }
    }
    });

// Calculator - Date
router.get('/calculate/date/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);

    global.kill_session_vars(req, [
        'uk_trader_string', 'final_use_string',
        'processing_string', 'certificate_string', 'unit_string'
    ]);
    req.session.data["at_risk"] = false;

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
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            res.render('calculate/02_destination', { 'commodity': c, 'error': err, 'destination': destination });
        });
});

// Calculator - Origin
router.get('/calculate/origin/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    console.log("Origin " + req.params["goods_nomenclature_item_id"]);
    var err = req.session.data["error"];
    var origin = req.session.data["origin"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            res.render('calculate/03_origin', { 'commodity': c, 'error': err, 'origin': origin });
        });
});

// Calculator - UK trader scheme (XI only)
router.get('/calculate/uk_trader/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Origin");
    var err = req.session.data["error"];
    var origin = req.session.data["origin"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            res.render('calculate/03b_uktrader', { 'commodity': c, 'error': err, 'origin': origin });
        });
});

// Calculator - Final use (XI only)
router.get('/calculate/final_use/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Origin");
    var err = req.session.data["error"];
    var origin = req.session.data["origin"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            res.render('calculate/03c_final_use', { 'commodity': c, 'error': err, 'origin': origin });
        });
});

// Calculator - UK trader scheme (XI only)
router.get('/calculate/processing/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Origin");
    var err = req.session.data["error"];
    var origin = req.session.data["origin"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            res.render('calculate/03d_processing', { 'commodity': c, 'error': err, 'origin': origin });
        });
});

// Calculator - certificate of origin (XI only)
router.get('/calculate/certificate_of_origin/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Origin");
    var err = req.session.data["error"];
    var origin = req.session.data["origin"];
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            res.render('calculate/03e_certificate_of_origin', { 'commodity': c, 'error': err, 'origin': origin });
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
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            res.render('calculate/04_monetary_value', { 'commodity': c, 'error': err, 'monetary_value': monetary_value });
        });
});

// Calculator - Unit value
router.get('/calculate/unit_value/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Unit value");
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/05_unit_value', { 'commodity': c, 'error': err });
        });
});

// Calculator - additional code
router.get(['/calculate/additional-code/:goods_nomenclature_item_id', '/calculate/additional-code'], function (req, res) {
    var url = global.get_commodity_api(req);
    // if (req.session.data["origin"] != "") {
    //     url += "?filter[geographical_area_id]=" + req.session.data["origin"];
    // }
    axios.get(url)
        .then((response) => {
            var err = null;
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            var a = 1;
            res.render('calculate/10_additional_code', { 'commodity': c, 'error': err });
        });
    var a = 1;
    //res.render('calculate/10_additional_code');
    // scopeId = global.get_scope(req.params["scopeId"]);
    // root_url = global.get_root_url(req, scopeId);
    // //console.log("Unit value");
    // var err = req.session.data["error"];
    // var url = global.get_commodity_api(req);
    // axios.get(url)
    //     .then((response) => {
    //         c = new Commodity();
    //         c.pass_request(req);
    //         c.get_data(response.data);
    //         c.get_measure_data(req, req.session.data["origin"]);
    //         res.render('calculate/10_additional_code', { 'commodity': c, 'error': err });
    //     });
});




// Calculator - certificate
router.get(['/calculate/certificate/:goods_nomenclature_item_id', '/calculate/certificate'], function (req, res) {
    var url = global.get_commodity_api(req);
    // if (req.session.data["origin"] != "") {
    //     url += "?filter[geographical_area_id]=" + req.session.data["origin"];
    // }
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            c.get_certificates();
            var a = 1;
            res.render('calculate/11_certificate', { 'commodity': c, 'error': null });
        });
    var a = 1;
});


// // Calculator - Meursing - this is the temporary information-only page for Meursing-related content
// router.get('/calculate/meursing/:goods_nomenclature_item_id', function (req, res) {
//     scopeId = global.get_scope(req.params["scopeId"]);
//     root_url = global.get_root_url(req, scopeId);
//     //console.log("Meursing");
//     var err = req.session.data["error"];
//     var url = global.get_commodity_api(req);
//     axios.get(url)
//         .then((response) => {
//             c = new Commodity();
//             c.pass_request(req);
//             c.get_data(response.data);
//             //console.log(c);
//             res.render('calculate/90_meursing', { 'commodity': c, 'error': err });
//         });
// });

// Calculator - Company
router.get('/calculate/company/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Company");
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "company";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/07_company', { 'commodity': c, 'error': err });
        });
});

// Calculator - VAT rate choice
router.get('/calculate/vat/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Company");
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "company";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/08_vat', { 'commodity': c, 'error': err });
        });
});

// Calculator - excise rate choice
router.get('/calculate/excise/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Company");
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "company";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/09_excise', { 'commodity': c, 'error': err });
        });
});

// Calculator - Confirm
router.get('/calculate/confirm/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);

    //console.log("Confirm");
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);

    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "confirm";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/50_confirm', { 'commodity': c, 'error': err });
        });
});

// Calculator - Results
router.get('/calculate/results/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "results";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/99_results', { 'commodity': c, 'error': err });
            //res.render('calculate/99_results_flat', { 'commodity': c, 'error': err });
        });
});

// Calculator - Results explicitly for GB to NI
router.get('/calculate/results_gb_ni/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "results";
            c.unit_values = req.session.data["unit_values"];
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/99_results_gb_ni', { 'commodity': c, 'error': err });
        });
});

// Calculator - Results (flat - dummy HTML)
router.get('/calculate/results_flat/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    scopeId = "";
    root_url = global.get_root_url(req, scopeId);
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "results";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/99_results_flat', { 'commodity': c, 'error': err });
        });
});

// Calculator - Results (all - dummy HTML)
router.get('/calculate/results/:goods_nomenclature_item_id/:file', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    file = req.params["file"];
    scopeId = "";
    root_url = global.get_root_url(req, scopeId);
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "results";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/99_' + file, { 'commodity': c, 'error': err });
        });
});

// Calculator - Results index
router.get('/calculate/results', function (req, res) {
    res.render('calculate/98_results_pages');
});

// Calculator - Confirmatory message panel
router.get('/calculate/message/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    scopeId = "";
    root_url = global.get_root_url(req, scopeId);
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "results";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/90_message', { 'commodity': c, 'error': err });
        });
});



// Calculator - Confirmatory message panel
router.get('/calculate/message2/:scenario', function (req, res) {
    var scenario = req.params["scenario"];
    var content = require('./classes/message_content.json');
    var retrieved_content = content["data"][scenario];

    req.session.data["message"] = retrieved_content;
    res.render('calculate/90_message', { 'message': retrieved_content });
});

// Calculator - Interstitial trade defence
router.get('/calculate/trade_defence/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    scopeId = "";
    root_url = global.get_root_url(req, scopeId);
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "results";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/interstitial_trade_defence', { 'commodity': c, 'error': err });
        });
});


// Calculator - Results (flat - dummy HTML)
router.get('/calculate/ni_to_gb/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    scopeId = "";
    root_url = global.get_root_url(req, scopeId);
    var err = req.session.data["error"];
    var url = global.get_commodity_api(req);
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.phase = "results";
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/final_ni_to_gb', { 'commodity': c, 'error': err });
        });
});


// Calculator - Results (flat - dummy HTML)
router.get('/test_endpoint/:goods_nomenclatures', function (req, res) {
    var url = "https://www.trade-tariff.service.gov.uk/api/v2/goods_nomenclatures/section/1";
    axios.get(url)
        .then((response) => {
            var ret = response.data;
            console.log(ret)
            // res.render('calculate/99_results_flat', { 'commodity': c, 'error': err });
        });
});

/* ############################################################################ */
/* ###################             END CALCULATOR             ################# */
/* ############################################################################ */

// STW integration
router.get('/calculate/landing/:goods_nomenclature_item_id/:destination/:origin/:date', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);

    var imported_context = new ImportedContext();
    imported_context.goods_nomenclature_item_id = req.params["goods_nomenclature_item_id"];
    imported_context.destination = req.params["destination"].toUpperCase();
    imported_context.origin = req.params["origin"].toUpperCase();
    imported_context.date = req.params["date"];
    imported_context.get_origin_description();
    imported_context.get_destination_description();

    req.session.data["goods_nomenclature_item_id"] = req.params["goods_nomenclature_item_id"];
    var a = 1;

    global.kill_session_vars(req, [
        'uk_trader_string', 'final_use_string',
        'processing_string', 'certificate_string', 'unit_string'
    ]);

    //res.render('calculate/00_landing', {  'imported_context': imported_context});

    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            res.render('calculate/00_landing', { 'commodity': c, 'imported_context': imported_context});
        });
});


/* Rules of origin starts here */

// Index
router.get(['/roo', '/roo/xi', '/roo/undefined'], function (req, res) {
    var rules_of_origin_schemes = global.get_rules_of_origin();
    req.session.data["commodity"] = "";
    res.render('roo/index', {'rules_of_origin_schemes': rules_of_origin_schemes});
});

// Country page
router.get(['/roo/country', '/roo/country/:country'], function (req, res) {
    var key = req.params["country"] + "";
    if (key == "") {
        key = req.session.data["roo_country"] + "";
    }

    var roo = new Roo(req, key);
    if (req.session.data["commodity"] == "") {
        res.render('roo/country', { 'country': roo });
    } else {
        var url = 'https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.session.data["commodity"];

        axios.get(url)
            .then((response) => {
                c = new Commodity();
                c.pass_request(req);
                c.get_data(response.data);
                res.render('roo/country', { 'country': roo, 'commodity': c });
            });
    
    }
});

// 01 fully originate
router.get(['/roo/originate/:commodity/:country'], function (req, res) {
    var key = req.params["country"] + "";
    if (key == "") {
        key = req.session.data["roo_country"] + "";
    }

    var roo = new Roo(req, key);
    roo.get_content("01-overview");
    res.render('roo/01_originate', { 'country': roo });
});

// 02 fully obtained
router.get(['/roo/obtained/:commodity/:country'], function (req, res) {
    var key = req.params["country"] + "";
    if (key == "") {
        key = req.session.data["roo_country"] + "";
    }

    var roo = new Roo(req, key);
    roo.get_content("02-wholly-obtained");
    res.render('roo/02_obtained', { 'country': roo });
});

// 03 fully date
router.get(['/roo/date/:commodity/:country'], function (req, res) {
    res.render('roo/03_date', { });
});


// 04 RoO results
router.get(['/roo/results/:commodity/:country'], function (req, res) {
    var key = req.params["country"] + "";
    if (key == "") {
        key = req.session.data["roo_country"] + "";
    }
    var commodity = req.params["commodity"] + "";

    var roo = new Roo(req, key);
    roo.set_commodity(commodity);
    roo.get_rules();
    res.render('roo/04_results', { 'country': roo });
});



// RoO Glossary
router.get(['/roo/glossary'], function (req, res) {
    var key = "";
    var roo = new Roo(req, key);
    roo.get_all_abbreviations();
    res.render('roo/glossary', { 'country': roo });
});

router.get(['/roo/rvc'], function (req, res) {
    var key = "";
    var roo = new Roo(req, key);
    roo.get_all_abbreviations("RVC-detail", "Calculating Regional Value Content (RVC)");
    res.render('roo/glossary2', { 'country': roo });
});

/* Rules of origin ends here */


/* Meursing starts here */

// Meursing start
router.get(['/meursing/start', '/meursing/start/:goods_nomenclature_item_id'], function (req, res) {
    var error = req.query["error"];
    starch_glucose_options = global.get_starch_glucose_options();
    res.render('meursing/start');
});
// Starch and glucose content
router.get(['/meursing/starch-glucose'], function (req, res) {
    var error = req.query["error"];
    starch_glucose_options = global.get_starch_glucose_options();
    res.render('meursing/01_starch_glucose', { "starch_glucose_options": starch_glucose_options, "error": error });
});

// Sucrose, invert sugar or isoglucose
router.get(['/meursing/sucrose-sugar-isoglucose'], function (req, res) {
    var error = req.query["error"];
    var starch_option = req.session.data["starch"];
    sucrose_options = global.get_sucrose_options(starch_option);
    res.render('meursing/02_sucrose', { "sucrose_options": sucrose_options, "error": error });
});

// Milk fat
router.get(['/meursing/milk-fat'], function (req, res) {
    var error = req.query["error"];
    var starch_option = req.session.data["starch"];
    var sucrose_option = req.session.data["sucrose"];
    milk_fat_options = global.get_milk_fat_options(starch_option, sucrose_option);
    console.log(milk_fat_options);
    res.render('meursing/03_milk_fat', { "milk_fat_options": milk_fat_options, "error": error });
});

// Milk protein
router.get(['/meursing/milk-protein'], function (req, res) {
    var error = req.query["error"];
    var starch_option = req.session.data["starch"];
    var sucrose_option = req.session.data["sucrose"];
    var milk_fat_option = req.session.data["milk_fat"];

    milk_protein_options = global.get_milk_protein_options(starch_option, sucrose_option, milk_fat_option);
    console.log(milk_protein_options);
    res.render('meursing/04_milk_protein', { "milk_protein_options": milk_protein_options, "error": error });
});

// Data handler
router.get(['/meursing/data'], function (req, res) {
    var a = 1;
    var page = req.query["page"];
    switch (page) {
        case "starch-glucose":
            var starch_option = req.query["starch"];
            if ((starch_option == "") || (starch_option == null)) {
                res.redirect("/meursing/starch-glucose?error=true");
            }
            else {
                res.redirect("/meursing/sucrose-sugar-isoglucose");
            }
            break;
        case "sucrose":
            var sucrose_option = req.query["sucrose"];
            if ((sucrose_option == "") || (sucrose_option == null)) {
                res.redirect("/meursing/sucrose-sugar-isoglucose?error=true");
            }
            else {
                res.redirect("/meursing/milk-fat");
            }

            break;
        case "milk_fat":
            var milk_fat_option = req.query["milk_fat"];
            if ((milk_fat_option == "") || (milk_fat_option == null)) {
                res.redirect("/meursing/milk-fat?error=true");
            }
            else {
                var no_protein = [
                    '40 - 54.99',
                    '55 - 69.99',
                    '70 - 84.99',
                    '85 or more'
                ]
                if (no_protein.includes(milk_fat_option)) {
                    res.redirect("/meursing/check-answers");
                } else {
                    res.redirect("/meursing/milk-protein");
                }
            }

            break;
        case "milk_protein":
            var milk_protein_option = req.query["milk_protein"];
            if ((milk_protein_option == "") || (milk_protein_option == null)) {
                res.redirect("/meursing/milk-protein?error=true");
            }
            else {
                res.redirect("/meursing/check-answers");
            }

            break;
    }

});

// Check answers
router.get(['/meursing/check-answers'], function (req, res) {
    res.render('meursing/05_check_answers');
});

// Results
router.get(['/meursing/results'], function (req, res) {
    var starch_option = req.session.data["starch"];
    var sucrose_option = req.session.data["sucrose"];
    var milk_fat_option = req.session.data["milk_fat"];
    var milk_protein_option = req.session.data["milk_protein"];

    results = global.get_result(starch_option, sucrose_option, milk_fat_option, milk_protein_option);
    res.render('meursing/06_results', { "results": results });
});

// Restart
router.get(['/restart'], function (req, res) {
    req.session.data["starch"] = null;
    req.session.data["sucrose"] = null;
    req.session.data["milk_fat"] = null;
    req.session.data["milk_protein"] = null;
    res.redirect('/meursing/starch-glucose');
});
/* Meursing ends here */

// Help
router.get(['/help/undefined'], function (req, res) {
    res.redirect('/help');
});

router.get(['/help'], function (req, res) {
    //const now = new Date('2021/05/06 14:14:05');
    const now = new Date();
    var show_webchat = isWorkingHour(now);
    res.render('help/index', { "show_webchat": show_webchat });

    function isWorkingHour(now) {
        return now.getDay() <= 4 && now.getHours() >= 9 && now.getHours() < 17;
    }
});

// CPC starts here

router.get(['/cpc'], function (req, res) {
    res.render('cpc/00-index', { });
});

router.get(['/cpc/request-code'], function (req, res) {
    var cpc_controller = new CPCController();
    cpc_controller.get_request_codes();
    res.render('cpc/01-request-code', { "controller": cpc_controller });
});

router.get(['/cpc/request-code-notes'], function (req, res) {
    var cpc_controller = new CPCController();
    cpc_controller.request_code = req.session.data["request_code"]
    cpc_controller.get_request_code_notes();
    res.render('cpc/02-request-code-notes', { "controller": cpc_controller });
});

router.get(['/cpc/previous-code'], function (req, res) {
    var cpc_controller = new CPCController();
    cpc_controller.request_code = req.session.data["request_code"]
    cpc_controller.get_previous_codes();
    cpc_controller.get_request_code_notes();
    res.render('cpc/03-previous-code', { "controller": cpc_controller });
});

router.get(['/cpc/previous-code-notes'], function (req, res) {
    var cpc_controller = new CPCController();
    cpc_controller.request_code = req.session.data["request_code"]
    cpc_controller.previous_code = req.session.data["previous_code"]
    cpc_controller.get_previous_code_notes();
    res.render('cpc/04-previous-code-notes', { "controller": cpc_controller });
});

router.get(['/cpc/previous-code-apcs'], function (req, res) {
    var cpc_controller = new CPCController();
    cpc_controller.request_code = req.session.data["request_code"]
    cpc_controller.previous_code = req.session.data["previous_code"]
    cpc_controller.get_apcs();
    res.render('cpc/05-previous-code-apcs', { "controller": cpc_controller });
});

router.get(['/cpc/apc-notes'], function (req, res) {
    var cpc_controller = new CPCController();
    cpc_controller.request_code = req.session.data["request_code"]
    cpc_controller.previous_code = req.session.data["previous_code"]
    cpc_controller.apc = req.session.data["apc"]
    cpc_controller.get_additional_code_content();
    res.render('cpc/06-apc-notes', { "controller": cpc_controller });
});
// CPC ends here

module.exports = router

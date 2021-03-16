const express = require('express')
const axios = require('axios')
const router = express.Router()
const api_helper = require('./API_helper');
const { response } = require('express');

const Heading = require('./classes/heading.js');
const Commodity = require('./classes/commodity.js');
const Error_handler = require('./classes/error_handler.js');

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
router.get('/calculate/data_handler/:goods_nomenclature_item_id', function (req, res) {
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
        // Validate the unit value form
        //console.log("Checking Meursing code");
        e = new Error_handler();
        contains_errors = e.validate_meursing(req); // Gets data from meursing code form and validates it
        if (contains_errors) {
            req.session.data["error"] = "meursing";
            res.redirect("/calculate/meursing/" + req.params["goods_nomenclature_item_id"]);
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
    //console.log("Origin");
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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            c.get_measure_data(req, req.session.data["origin"]);
            res.render('calculate/05_unit_value', { 'commodity': c, 'error': err });
        });
});

// Calculator - Meursing - this will be used when Meursing is implemented
// router.get('/calculate/meursing/:goods_nomenclature_item_id', function (req, res) {
//     scopeId = global.get_scope(req.params["scopeId"]);
//     root_url = global.get_root_url(req, scopeId);
//     var err = req.session.data["error"];
//     var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
//     axios.get(url)
//         .then((response) => {
//             c = new Commodity();
//             c.pass_request(req);
//             c.get_data(response.data);
//             res.render('calculate/06_meursing', { 'commodity': c, 'error': err });
//         });
// });

// Calculator - Meursing - this is the temporary information-only page for Meursing-related content
router.get('/calculate/meursing/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Meursing");
    var err = req.session.data["error"];
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            //console.log(c);
            res.render('calculate/90_meursing', { 'commodity': c, 'error': err });
        });
});

// Calculator - Company
router.get('/calculate/company/:goods_nomenclature_item_id', function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    //console.log("Company");
    var err = req.session.data["error"];
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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

    // const dayjs = require('dayjs');
    // date_string = req.session.data["import_date-year"] + "-" + req.session.data["import_date-month"] + "-" + req.session.data["import_date-day"];
    // let date_object = dayjs(date_string);
    // req.session.data["date_string"] = date_object.format("d MMM YYYY");

    //console.log("Confirm");
    var err = req.session.data["error"];
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];

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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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
    var url = global.get_domain(req) + req.params["goods_nomenclature_item_id"];
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

module.exports = router

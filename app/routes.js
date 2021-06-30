const express = require('express')
const axios = require('axios')
const router = express.Router()
const api_helper = require('./API_helper');
const { response } = require('express');
const Heading = require('./classes/heading.js');
const Commodity = require('./classes/commodity.js');
const Roo = require('./classes/roo.js');
const RooMvp = require('./classes/roo_mvp.js');
const ImportedContext = require('./classes/imported_context.js');
const CPCController = require('./classes/cpc/cpc-controller.js');
const Error_handler = require('./classes/error_handler.js');
const date = require('date-and-time');
const GeographicalArea = require('./classes/geographical_area');
const Link = require('./classes/link');
const Search = require('./classes/search');
const { xor } = require('lodash');

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
router.get(['/:scopeId/browse', '/browse/'], function (req, res) {
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
router.get(['/:scopeId/cookies', '/cookies/'], function (req, res) {
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
router.get(['/sections/ni', '/xi/sections', ], function (req, res) {
    scopeId = "xi";
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
router.get(['/:scopeId/sections/:sectionId', '/sections/:sectionId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/sections/' + req.params["sectionId"])
        .then((response) => {
            res.render('section', { 'section': response.data, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});

// Browse within a chapter
router.get(['/chapters/:chapterId', '/:scopeId/chapters/:chapterId'], function (req, res) {
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
router.get(['/headings/:headingId', '/:scopeId/headings/:headingId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/headings/' + req.params["headingId"])
        .then((response) => {
            h = new Heading(response.data);
            res.render('headings', { 'heading': h, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});

// Set the country filter for comm codes
router.get(['/country-filter'], async function (req, res) {
    var goods_nomenclature_item_id = req.query["goods_nomenclature_item_id"];
    var scopeId = req.query["scopeId"];
    var country = req.query["country"];
    var tab = req.session.data["tab"];

    var url = "/commodities/" + goods_nomenclature_item_id + "/" + country;
    if ((scopeId == "ni") || (scopeId == "xi")) {
        url = url.replace("/commodities/", "xi/commodities/");
    }
    if (typeof tab === 'undefined') {
        tab = ""
    } else {
        url += "#" + tab;
    }
    res.redirect(url);
});


// Browse a single commodity
router.get([
    '/commodities/:goods_nomenclature_item_id/',
    '/commodities/:goods_nomenclature_item_id/:country',
    '/:scopeId/commodities/:goods_nomenclature_item_id',
    '/:scopeId/commodities/:goods_nomenclature_item_id/:country',
], async function (req, res) {
    var border_system = "cds";

    // Get a full list of countries to use in the dropdown
    var countries = global.get_countries(req.session.data["country"]);
    var date = global.get_date(req);

    // Get the country (if selected)
    var country = req.params["country"];
    if (typeof country === 'undefined') {
        country = req.session.data["country"];
        if (typeof country === 'undefined') {
            country = "";
        }
        country = "";
    } else {
        req.session.data["country"] = country;
    }
    req.session.data["country"] = country;

    // Get any RoO information that we can
    roo_mvp = new RooMvp(req, country);

    if (req.session.data["border_system"] == "chief") {
        border_system = "chief";
        toggle_message = {
            "declaration_th": "Declaration instructions for CHIEF",
            "toggle_text": "Show CDS instructions instead",
            "border_system": "CHIEF",
            "cds_class": "hidden",
            "chief_class": ""
        }
    } else {
        border_system = "cds";
        toggle_message = {
            "declaration_th": "Declaration instructions for CDS",
            "toggle_text": "Show CHIEF instructions instead",
            "border_system": "CDS",
            "cds_class": "",
            "chief_class": "hidden"
        }
    }

    var c;
    var scopeId = global.get_scope(req.params["scopeId"]);
    var root_url = global.get_root_url(req, scopeId);
    var title = global.get_title(scopeId);
    req.session.data["goods_nomenclature_item_id"] = req.params["goods_nomenclature_item_id"];
    req.session.data["error"] = "";
    var url_original;
    if (country == null) {
        var url = 'https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"];
    } else {
        var url = 'https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"] + "?filter[geographical_area_id]=" + country;
    }
    if ((scopeId == "ni") || (scopeId == "xi")) {
        // Northern Ireland
        url_original = url;
        url = url.replace("/api", "/xi/api");
        const axiosrequest1 = axios.get(url);
        const axiosrequest2 = axios.get(url_original);
        await axios.all([axiosrequest1, axiosrequest2]).then(axios.spread(function (res1, res2) {
            // Get the EU measures
            c = new Commodity();
            c.country = country;
            c.pass_request(req);
            c.get_data(res1.data);
            c.get_measure_data(req, "basic");

            // Append the UK measures
            c_uk = new Commodity();
            c_uk.pass_request(req);
            c_uk.get_data(res2.data);
            c_uk.get_measure_data(req, "basic", override_block = true);

            c_uk.measures.forEach(m => {
                if (m.block == "other_uk") {
                    c.measures.push(m);
                }
            });

            c.categorise_measures(override_block = "smart");
            c.sort_measures();

            res.render('commodities', {
                'roo': roo_mvp,
                'date': date,
                'countries': countries,
                'toggle_message': toggle_message,
                'commodity': c,
                'browse_breadcrumb': browse_breadcrumb,
                'scopeId': scopeId,
                'title': title,
                'root_url': root_url
            });
        }));

    } else {
        // UK
        const axiosrequest1 = axios.get(url);
        await axios.all([axiosrequest1]).then(axios.spread(function (response) {
            c = new Commodity();
            c.country = country;
            c.pass_request(req);
            c.get_data(response.data);
            c.get_measure_data(req, "basic");
            // console.log(c.measures.length);

            c.sort_measures();

            res.render('commodities', {
                'date': date, 
                'countries': countries,
                'roo': roo_mvp,
                'toggle_message': toggle_message,
                'commodity': c,
                'browse_breadcrumb': browse_breadcrumb,
                'scopeId': scopeId,
                'title': title,
                'root_url': root_url
            });
        }));

    }
});

// Reset country
router.get(['/country_reset/:goods_nomenclature_item_id/'], function (req, res) {
    req.session.data["country"] = "";
    res.redirect("/commodities/" + req.params["goods_nomenclature_item_id"]);
});

// Get a geographical area
router.get(['/geographical_area/:id/', '/:scopeId/geographical_area/:id/',], function (req, res) {
    var id = req.params["id"];
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    var referer = req.headers.referer;
    if (referer == null) {
        referer = "/";
    }
    var url = 'https://www.trade-tariff.service.gov.uk/api/v2/geographical_areas/';
    if ((scopeId == "ni") || (scopeId == "xi")) {
        url = url.replace("/api", "/xi/api");
    }
    axios.get(url)
        .then((response) => {
            g = global.get_geography(id, response.data);
            res.render('geographical_area', { 'referer': referer, 'geographical_area': g, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});


// Browse a single commodity (version 2: sorted)
router.get(['/commodities2/:goods_nomenclature_item_id/', '/:scopeId/commodities2/:goods_nomenclature_item_id'], function (req, res) {
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
router.get(['/:scopeId/search_results'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    title = "sdfs";
    res.render('search_results', { 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
});



// Search results / data handler
router.post(['/search/data_handler/', '/:scopeId/search/data_handler/:goods_nomenclature_item_id'], function (req, res) {
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
router.get(['/a-z-index/:letter', '/:scopeId/a-z-index/:letter'], function (req, res) {
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
router.get(['/downloads/', '/:scopeId/downloads'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('downloads', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// News
router.get(['/news/', '/:scopeId/news'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    news = global.get_news();
    res.render('news', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'news': news, 'date_string': global.todays_date() });
});


// Preferences
router.get([
    '/preferences/',
    ':scopeId/preferences/',
    '/preferences/:confirm',
    ':scopeId/preferences/:confirm'
], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    confirm = req.params["confirm"];
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('preferences', { 'show_confirmation': confirm, 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Preferences handler
router.get(['/preferences-handler/', '/:scopeId/preferences-handler'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    var referer = req.headers.referer;
    if (referer == null) {
        referer = "/";
    }
    // if (req.session.data["border_system"] !== "undefined") {
    //     req.cookies["border_system"] = req.session.data["border_system"];
    // }
    // res.redirect("/preferences/confirm");
    res.redirect(referer);
});

/* ############################################################################ */
/* ###################        END SUBSIDIARY NAVIGATION       ################# */
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
            res.render('calculate/00_landing', { 'commodity': c, 'imported_context': imported_context });
        });
});


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


// Search
router.get(['/search_handler'], function (req, res) {
    var url = "";
    var search_term = req.query["search_term"];
    res.redirect("/results/" + search_term);
});

// Search results
router.get([
    '/xresults',
    '/results/:search_term',
], async function (req, res) {
    scopeId = ""; //global.get_scope(req.params["scopeId"]);
    root_url = "/"; // global.get_root_url(req, scopeId);
    title = "Title"; // global.get_title(scopeId);
    var search_term = req.params["search_term"];

    // Make first request
    var axios_response;
    var call_type = "search";
    var url = "https://www.trade-tariff.service.gov.uk/search.json?q=" + search_term + "&input-autocomplete=" + search_term;
    //https://www.trade-tariff.service.gov.uk/search?q=leggings&input-autocomplete=leggings&date=19%2F05%2F2021
    [axios_response] = await Promise.all([
        axios.get(url)
    ]);

    // Then if necessary the second, which is just a heading
    var results = axios_response.data.results;
    if (results.length == 1) {
        if (results[0].type == "heading") {
            call_type = "heading";
            var key = results[0].goods_nomenclature_item_id.substring(0, 4);
            // url = "https://www.trade-tariff.service.gov.uk/api/v2/headings/" + key;
            // [axios_response] = await Promise.all([
            //     axios.get(url)
            // ]);
            var url = "/headings/" + key;
            res.redirect(url);
            return;
        } else if (results[0].type == "chapter") {
            call_type = "chapter";
            var url = "/chapters/" + results[0].goods_nomenclature_item_id.substring(0, 2) + "/" + term;
            res.redirect(url);
            return;
        }
    }

    var search = new Search(axios_response.data, call_type);
    var context = {}
    context.call_type = call_type;
    context.links = search.links;
    context.search = search;
    context.heading_count = search.heading_count;
    context.commodity_count = search.commodity_count;
    res.render('search-results', { 'context': context, 'term': search_term, 'scopeId': scopeId, 'title': title });


});

// Change the date
router.get(['/change-date'], function (req, res) {
    var date = global.get_date(req, save = true);
    var a = 1;
    ///commodities/0208907000?day=16&month=6&year=2021
    let goods_nomenclature_item_id = req.query["goods_nomenclature_item_id"];
    var url = "/commodities/${goods_nomenclature_item_id}?day=${day}&month=${month}&year=${year}";
    url = url.replace("${goods_nomenclature_item_id}", goods_nomenclature_item_id);
    url = url.replace("${day}", date.day);
    url = url.replace("${month}", date.month);
    url = url.replace("${year}", date.year);
    res.redirect(url);
});


module.exports = router

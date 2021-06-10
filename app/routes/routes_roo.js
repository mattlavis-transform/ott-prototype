const express = require('express')
const axios = require('axios')
const router = express.Router()
const api_helper = require('../API_helper');
const { response } = require('express');
const Heading = require('../classes/heading.js');
const Commodity = require('../classes/commodity.js');
const Roo = require('../classes/roo.js');
const ImportedContext = require('../classes/imported_context.js');
const CPCController = require('../classes/cpc/cpc-controller.js');
const Error_handler = require('../classes/error_handler.js');
const date = require('date-and-time');
const GeographicalArea = require('../classes/geographical_area');
const Link = require('../classes/link');
const { xor } = require('lodash');

require('../classes/global.js');
require('../classes/news.js');
require('../classes/validator.js');

// Add your routes here - above the module.exports line
var scopeId;
var browse_breadcrumb = "Search or browse the Tariff";




/* Rules of origin starts here */

// Index
router.get(['/roo', '/roo/xi', '/roo/undefined'], function (req, res) {
    var rules_of_origin_schemes = global.get_rules_of_origin();
    req.session.data["commodity"] = "";
    res.render('roo/index', { 'rules_of_origin_schemes': rules_of_origin_schemes });
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
    res.render('roo/03_date', {});
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



router.get(['/roo/change_country/:commodity'], function (req, res) {
    req.session.data["country"] = "";
    var commodity = req.params["commodity"];
    res.redirect('/commodities/' + commodity + "#rules_of_origin");
});

router.get([
    '/roo/select_country/:commodity',
    '/roo/select_country/',
], function (req, res) {
    var commodity = req.session.data["commodity"];
    res.redirect('/commodities/' + commodity + "/" + req.session.data["roo_country"] + "#rules_of_origin");
});
/* Rules of origin ends here */


module.exports = router

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



/* ############################################################################ */
/* ###################         BEGIN TOOLS SECTION           ################# */
/* ############################################################################ */


// Tools
router.get(['/tools/', '/:scopeId/tools'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/tools', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Quotas search and search results
router.get(['/tools/quota_search/',], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);

    var order_number = req.query["order_number"];
    var geographical_area_id = req.query["country"];
    var date_day = req.query["date-day"];
    var date_month = req.query["date-month"];
    var date_year = req.query["date-year"];

    var url = "https://www.trade-tariff.service.gov.uk/api/v2/quotas/search?order_number={{ordernumber}}&geographical_area_id={{geographical_area_id}}&as_of={{as_of}}";
    url = url.replace("{{geographical_area_id}}", geographical_area_id);
    url = url.replace("{{ordernumber}}", order_number);
    url = url.replace("{{as_of}}", "2021-05-01");
    url = "https://www.trade-tariff.service.gov.uk/api/v2/quotas/search?geographical_area_id=MA&include=quota_balance_events,measures,measures.geographical_area_id";
    console.log(url);

    axios.get(url)
        .then((response) => {
            // console.log(response.data);
            res.render('tools/quotas', { 'results': response.data, 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
        });
});

// Licenced quotas
router.get(['/licenced_quotas/', '/:scopeId/licenced_quotas'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    var licenced_quotas = require('../data/licenced_quotas.json')
    res.render('tools/licenced_quotas', { 'licenced_quotas': licenced_quotas, 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// FCFS quota browse
router.get(['/tools/quota_detail/:quota_order_number_id'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    var licenced_quotas = require('../data/licenced_quotas.json')
    res.render('tools/quota_detail', { 'licenced_quotas': licenced_quotas, 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Certificates
router.get(['/certificates/', '/:scopeId/certificates'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/certificates', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Additional codes
router.get(['/additional_codes/', '/:scopeId/additional_codes'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/additional_codes', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Footnotes
router.get(['/footnotes/', '/:scopeId/footnotes'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/footnotes', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Chemicals
router.get(['/chemicals/', '/:scopeId/chemicals'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/chemicals', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Exchange rates
router.get(['/exchange_rates/', '/:scopeId/exchange_rates'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/exchange_rates', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

/* ############################################################################ */
/* ###################           END TOOLS SECTION           ################# */
/* ############################################################################ */


module.exports = router

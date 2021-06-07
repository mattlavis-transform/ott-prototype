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
router.get(['/tools/', '/tools/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/tools', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Quotas old
router.get(['/quotas/', '/quotas/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/quotas', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Quotas new
router.get(['/quotas_new/', '/quotas_new/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/quotas_new', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Licenced quotas
router.get(['/licenced_quotas/', '/licenced_quotas/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    var licenced_quotas = require('../data/licenced_quotas.json')
    res.render('tools/licenced_quotas', { 'licenced_quotas': licenced_quotas, 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Certificates
router.get(['/certificates/', '/certificates/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/certificates', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Additional codes
router.get(['/additional_codes/', '/additional_codes/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/additional_codes', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Footnotes
router.get(['/footnotes/', '/footnotes/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/footnotes', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Chemicals
router.get(['/chemicals/', '/chemicals/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/chemicals', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

// Exchange rates
router.get(['/exchange_rates/', '/exchange_rates/:scopeId'], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    res.render('tools/exchange_rates', { 'scopeId': scopeId, 'root_url': root_url, 'title': title, 'date_string': global.todays_date() });
});

/* ############################################################################ */
/* ###################           END TOOLS SECTION           ################# */
/* ############################################################################ */


module.exports = router

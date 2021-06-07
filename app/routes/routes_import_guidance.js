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

// /import-guidance/date/0208907000
router.get(['/import-guidance/date/:goods_nomenclature_item_id',], function (req, res) {
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    title = global.get_title(scopeId);
    var url = 'https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"];
    axios.get(url)
        .then((response) => {
            c = new Commodity();
            c.pass_request(req);
            c.get_data(response.data);
            // c.get_measure_data(req, "basic");
            res.render('import-guidance/date', {  'commodity': c, 'browse_breadcrumb': browse_breadcrumb, 'scopeId': scopeId, 'title': title, 'root_url': root_url, 'date_string': global.todays_date() });
        });
});



// import-guidance - Origin
router.get('/import-guidance/origin/:goods_nomenclature_item_id', function (req, res) {
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
            res.render('import-guidance/origin', { 'commodity': c, 'error': err, 'origin': origin });
        });
});

// import-guidance - Results
router.get('/import-guidance/results/:goods_nomenclature_item_id', function (req, res) {
    var c, border_system;
    scopeId = global.get_scope(req.params["scopeId"]);
    root_url = global.get_root_url(req, scopeId);
    console.log("Origin " + req.params["goods_nomenclature_item_id"]);
    var err = req.session.data["error"];
    var origin = req.session.data["origin"];
    if (typeof req.session.data["border_system"] === "undefined") {
        req.session.data["border_system"] = "cds";
    }
    var border_system = req.session.data["border_system"].toUpperCase();;
    axios.get('https://www.trade-tariff.service.gov.uk/api/v2/commodities/' + req.params["goods_nomenclature_item_id"])
        .then((response) => {
            c = new Commodity();
            c.border_system = border_system;
            c.pass_request(req);
            c.get_data(response.data);
            // req.session.data["origin"] = "AU";
            c.get_measure_data(req, req.session.data["country"], false, "conditions");
            res.render('import-guidance/results', { 'commodity': c, 'origin': origin });
        });
});

// import-guidance - Data handler
router.get(['/import-guidance/data_handler/:goods_nomenclature_item_id', '/import-guidance/data_handler/'], function (req, res) {
    var err, referer, c;
    var scopeId = global.get_scope(req.params["scopeId"]);
    var goods_nomenclature_item_id = req.params["goods_nomenclature_item_id"];
    var country = req.session.data["country"];
    var root_url = global.get_root_url(req, scopeId);
    var referer = req.headers.referer;

    // if (referer.indexOf("date") !== -1) {
    //     global.validate_date_import_guidance(req, res);

    // } else if (referer.indexOf("origin") !== -1) {
    //     global.validate_origin_import_guidance(req, res);

    // }
    var url = "/import-guidance/results/" + goods_nomenclature_item_id; //  + "/" + country; // + "#import";
    // if (scopeId == "ni") {
    //     url = url.replace("/commodities/", "ni/commodities/");
    // }
    res.redirect(url);

});



module.exports = router

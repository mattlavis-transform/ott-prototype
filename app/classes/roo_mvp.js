var MarkdownIt = require('markdown-it');
const Commodity = require('./commodity.js');
const axios = require('axios');
const GlossaryTerm = require('./glossary_term.js');
const path = require('path')

class Roo {
    constructor(req, country) {
        this.country = country;
        this.intro_text = "";
        this.get_roo_config(req);
        if (this.valid_rules) {
            this.get_product_specific_rules(req);
        }
    }

    get_roo_config(req) {
        this.valid_rules = true;
        this.scheme_code = "";
        var rules_of_origin_schemes = this.get_rules_of_origin();
        var jp = require('jsonpath');
        var query_string = "$[?(@.countries.indexOf('" + this.country + "') != -1)]"
        var result = jp.query(rules_of_origin_schemes, query_string);

        if (result.length > 0) {
            this.scheme_code = result[0].code;
            this.links = result[0].links;
            var fs = require('fs');
            
            // Get the intro notes copied from DIT
            var data_filename = path.join(__dirname, "../data/roo/intro_notes/" + result[0].intro_file);
            this.intro_text = fs.readFileSync(data_filename, 'utf8');
            if (result[0].intro_file.indexOf(".md") != -1) {
                var md = new MarkdownIt();
                this.intro_text = md.render(this.intro_text);
                this.intro_text = this.govify(this.intro_text);
            }

            // Get the intro notes to the FTA, taken from gov.uk
            var data_filename = path.join(__dirname, "../data/roo/intro/" + result[0].data_file);
            this.fta_intro = fs.readFileSync(data_filename, 'utf8');
            var md = new MarkdownIt();
            this.fta_intro = md.render(this.fta_intro);
            this.fta_intro = this.govify(this.fta_intro);
            var a = 1;
        } else {
            this.valid_rules = false;
        }
    }

    govify(s) {
        s = s.replace(/<h1/g, "<h1 class='govuk-heading-l'");
        s = s.replace(/<h2/g, "<h2 class='govuk-heading-m'");
        s = s.replace(/<h3/g, "<h3 class='govuk-heading-s'");
        s = s.replace(/<ul/g, "<ul class='govuk-list govuk-list--bullet'");
        s = s.replace(/<ol/g, "<ol class='govuk-list govuk-list--number'");
        return (s);
    }

    get_rules_of_origin(get_descriptions = true) {
        var data = require('../data/roo/roo_schemes.json');
        var geo_data = require('../assets/data/geographical_areas.json');
        var schemes = data.schemes;
        if (get_descriptions) {
            schemes.forEach(scheme => {
                scheme.country_descriptions = get_geographies(scheme.countries, geo_data);
            });
        }
        return (schemes);

        function get_geographies(countries, geo_data) {
            var conjunction;
            var jp = require('jsonpath');
            const _ = require('lodash');
            var ret = "";

            if (countries.length == 2) {
                conjunction = " and ";
            } else if (countries.length == 1) {
                conjunction = "";
            } else {
                conjunction = ", ";
            }

            countries.sort();
            countries.forEach((country, index, array) => {
                var query_string = '$.data[?(@.id == "' + country + '")]'
                var result = jp.query(geo_data, query_string);
                if (result.length > 0) {
                    var description = result[0].attributes.description;
                    ret += description;
                    if (index !== (array.length - 1)) {
                        ret += conjunction;
                    }
                }
            });
            ret = _.trim(ret, ", ");
            return (ret);
        }
    }

    get_product_specific_rules(req) {
        this.product_specific_rules = "";
        var fs = require('fs');
        var commodity = req.params["goods_nomenclature_item_id"];
        var folder = 'app/data/roo_psr/';
        var folder = path.join(__dirname, "../data/roo_psr/");

        var data_filename_6_digit = folder + this.scheme_code + "_" + commodity.substr(0, 6) + ".html";
        var data_filename_4_digit = folder + this.scheme_code + "_" + commodity.substr(0, 4) + "00.html";

        try {
            if (fs.existsSync(data_filename_6_digit)) {
                var data = fs.readFileSync(data_filename_6_digit, 'utf8');
                this.product_specific_rules = data;
            }
        } catch (err) {
            try {
                if (fs.existsSync(data_filename_4_digit)) {
                    var data = fs.readFileSync(data_filename_4_digit, 'utf8');
                    this.product_specific_rules = data;
                }
            }
            catch (err) {
                console.error(err);
                this.product_specific_rules = "No data available";
            }
        }
    }
}
module.exports = Roo
var MarkdownIt = require('markdown-it');
const Commodity = require('./commodity.js');
const axios = require('axios');
const GlossaryTerm = require('./glossary_term.js');
const path = require('path')

class Roo {
    constructor(req, country) {
        this.country = country;
        if (this.country != "") {
            this.intro_text = "";
            this.get_roo_config(req);
            if (this.valid_rules) {
                // this.get_product_specific_rules_gb(req);
                this.get_product_specific_rules_xi(req);
            }
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

        s = s.replace(/<h3 class='govuk-heading-s'>([^<]*)<\/h3>/gm, "<h3 class='govuk-heading-s' id='$1'>$1</h3>");

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

    get_templates() {
        var fs = require('fs');
        var folder = path.join(__dirname, "../views/roo/templates/");
        this.template_table = fs.readFileSync(folder + "table.html", 'utf8');
        this.template_table_row = fs.readFileSync(folder + "table_row.html", 'utf8');
        var a = 1;
    }

    get_product_specific_rules_xi(req) {
        var jp = require('jsonpath');
        const fs = require('fs')
        const path = require('path');

        const directoryPath = path.join(__dirname, '../data/roo/product-specific/');

        var result;

        this.get_templates();

        var filename = directoryPath + this.scheme_code + '_roo.json';
        var a = 1;
        try {
            if (fs.existsSync(filename)) {
                var data = require(filename);
                var sub_heading = req.params["goods_nomenclature_item_id"].substr(0, 6);
                var query_string = '$.rules[?(@.sub_heading == "' + sub_heading + '")]'
                var results = jp.query(data, query_string);
                this.rows = "";
                if (results.length > 0) {
                    results.forEach(result => {
                        var row = this.template_table_row;
                        row = row.replace("{{ heading }}", result["heading"]);
                        row = row.replace("{{ description }}", result["description"]);
                        var rule_text = this.cleanse(result["rule"]);
                        if (result["alternateRule"] != null) {
                            rule_text += " or " + result["alternateRule"];
                        }
                        var MarkdownIt = require('markdown-it');
                        var md = new MarkdownIt();
                        rule_text = md.render(rule_text);
                        row = row.replace("{{ rule }}", rule_text);
                        this.rows += row;
                    });
                }

                this.rows = this.rows.replace("<ul", "<ul class='govuk-list govuk-list--bullet'")

                this.product_specific_rules = this.template_table;
                this.product_specific_rules = this.product_specific_rules.replace("{{ rows }}", this.rows);
            } else {
                this.product_specific_rules = "";
            }
        } catch (err) {
            console.error(err)
            this.product_specific_rules = "";
        }
    }

    cleanse(s) {
        s = s.replace(/\\n /g, "\n");
        s = s.replace(/\[ul\]/g, "");
        s = s.replace(/\[bl\]/g, "");
        s = s.replace(/\[\\bl\]/g, "");
        s = s.replace(/\[\\ul\]/g, "");
        s = s.replace(/\[footnote="[^"]*"\]/g, "");
        // s = s.replace(/ – –/g, "<br> – –")
        // s = s.replace(/\*/g, "<br> *")
        // s = s.replace(/\+/g, "<br> - - ")
        return (s);
    }

    get_product_specific_rules_gb(req) {
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
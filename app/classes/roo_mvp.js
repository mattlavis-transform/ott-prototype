var MarkdownIt = require('markdown-it');
const Commodity = require('./commodity.js');
const axios = require('axios');
const GlossaryTerm = require('./glossary_term.js');
const path = require('path')

class RooMvp {
    constructor(req, country, scopeId) {
        this.scopeId = scopeId == "xi" ? 'xi' : 'uk';
        this.origin_text = this.scopeId == "xi" ? 'Northern Ireland, the EU' : 'the UK';
        this.country = country;
        if (this.country != "") {
            this.intro_text = "";
            this.get_roo_config(req);
            if (this.valid_rules) {
                // this.get_product_specific_rules_gb(req);
                this.get_product_specific_rules(req);
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
            this.partners = result[0].countries.length > 1 ? ' one of the partner countries' : result[0].country_descriptions;
            this.scheme_code = result[0].code;
            this.links = result[0].links;
            if (typeof result[0].explainers !== "undefined") {
                this.explainers = result[0].explainers;
                this.explainers.forEach(explainer => {
                    console.log("Parsing explainer");
                    if (this.scopeId == "xi") {
                        var template = "/xi/roo/clauses/scheme_code/"
                    } else {
                        var template = "/roo/clauses/scheme_code/"
                    }
                    explainer.url = explainer.url.replace(".md", "");
                    explainer.url = template.replace("scheme_code", this.scheme_code) + explainer.url;
                });

            } else {
                this.explainers = [];
            }
            this.title = result[0].title;
            var fs = require('fs');

            // Get the intro notes to the product specific rules copied from DIT
            var data_filename = path.join(__dirname, "../data/roo/" + this.scopeId + "/intro_notes/" + result[0].intro_file);
            this.intro_text = fs.readFileSync(data_filename, 'utf8');
            if (result[0].intro_file.indexOf(".md") != -1) {
                var md = new MarkdownIt();
                this.intro_text = md.render(this.intro_text);
                this.intro_text = this.govify(this.intro_text);
            }

            // Get the FTA notes, taken from gov.uk
            var data_filename = path.join(__dirname, "../data/roo/" + this.scopeId + "/fta_descriptions/" + result[0].data_file);
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
        s = s.replace(/<h4/g, "<h4 class='govuk-heading-s'");
        s = s.replace(/<ul/g, "<ul class='govuk-list govuk-list--bullet'");
        s = s.replace(/<ol/g, "<ol class='govuk-list govuk-list--number'");

        s = s.replace(/<h3 class='govuk-heading-s'>([^<]*)<\/h3>/gm, "<h3 class='govuk-heading-s' id='$1'>$1</h3>");

        return (s);
    }

    get_rules_of_origin() {
        // Gets a full list of the schemes and the countries that belong to each of those schemes
        var data = require('../data/roo/' + this.scopeId + '/roo_schemes.json');
        this.generic_links = data.links;
        var geo_data = require('../assets/data/geographical_areas.json');
        var schemes = data.schemes;
        schemes.forEach(scheme => {
            scheme.country_descriptions = get_geographies(scheme.countries, geo_data);
        });
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

    get_product_specific_rules(req) {
        var jp = require('jsonpath');
        const fs = require('fs')
        const path = require('path');
        this.get_templates();

        const directoryPath = path.join(__dirname, '../data/roo/' + this.scopeId + '/product_specific/');
        var filename = directoryPath + this.scheme_code + '_roo.json';
        try {
            if (fs.existsSync(filename)) {
                var data = require(filename);
                var sub_heading = req.params["goods_nomenclature_item_id"].substr(0, 6);
                var query_string = '$.rules[?(@.sub_heading == "' + sub_heading + '")]'
                // var query_string = '$.rules[?(@.sub_heading != "999999")]'; // for testing an entire country's rules
                var results = jp.query(data, query_string);
                this.rows = "";
                var last_row = "";
                if (results.length > 0) {
                    results.forEach(result => {
                        var row = this.template_table_row;
                        var MarkdownIt = require('markdown-it')
                        var md = new MarkdownIt();

                        // Set the heading column
                        var heading = result["heading"];
                        row = row.replace("{{ heading }}", heading);

                        // Set the description column
                        var description = md.render(result["description"]);
                        description = description.replace("{{RELAX}}", "<span class='roo_quota_explainer'>Some quantities of this product may qualify as originating under alternative more relaxed product-specific rules of origin<!-- mentioned below//-->.</span>");
                        row = row.replace("{{ description }}", description);

                        // Set the rule text
                        var rule_text = this.cleanse(result["rule"]);
                        if (result["alternateRule"] != null) {
                            rule_text += " or " + result["alternateRule"];
                        }
                        var md = new MarkdownIt();
                        rule_text = md.render(rule_text);
                        rule_text = rule_text.replace("{{CTH}}", "<span class='roo_explainer'><b>CTH rule - change in tariff heading</b><br>A product complies with the CTH rule when all non-originating materials used in its production are classified in a different HS heading than the product.<br>Read more about the <a href='/help/#CTH'>CTH rule</a>.</span>");

                        rule_text = rule_text.replace("{{CTSH}}", "<span class='roo_explainer'><b>CTSH rule - change in tariff subheading</b><br>A product complies with the CTSH rule when all of the non-originating materials used in its production are classified in a different HS subheading than the product.</span>");

                        rule_text = rule_text.replace("{{WO}}", "<span class='roo_explainer'><b>Wholly obtained</b><br>The 'wholly obtained' rule applies mainly to basic agricultural products, fishery products, minerals, or waste and scrap.<br><br>Wholly obtained products are goods obtained entirely in the territory of one country without the addition of any non-originating materials.</span>");

                        rule_text = rule_text.replace("ex-works price", "<a href='/help/#EXW'>ex-works price</a>");
                        rule_text = rule_text.replace("(EXW)", "(<a href='/help/#EXW'>ex-works price</a>)");
                        rule_text = rule_text.replace("(RVC)", "(<a href='/help/#RVC'>RVC</a>)");
                        rule_text = rule_text.replace("(FOB)", "(<a href='/help/#FOB'>FOB</a>)");

                        rule_text = rule_text.replace("MaxNOM", "<a href='/help/#MaxNOM'>MaxNOM</a> (Maximum value of non-originating materials)");

                        rule_text = rule_text.replace(" ;", ";");
                        rule_text = rule_text.replace("; ", ";<br>");




                        row = row.replace("{{ rule }}", rule_text);
                        if (last_row != row) {
                            this.rows += row;
                        }
                        last_row = row
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

    get_all_abbreviations(file = "", title = "") {
        this.glossary_terms = [];
        if (file == "") {
            var terms = ["CC", "CTC", "CTH", "CTSH", "RVC", "MaxNOM", "EXW", "FOB", "sub-heading", "heading", "Accumulation"];
            this.title = "";
        } else {
            var terms = [file];
            this.title = title;
        }
        terms.forEach(term => {
            var path = "app/data/roo/definitions/" + term + ".md";
            var fs = require('fs');
            var data = fs.readFileSync(path, 'utf8');
            var md = new MarkdownIt();
            var description = md.render(data);
            description = this.govify(description);

            var glossary_term = new GlossaryTerm();
            glossary_term.term = term;
            glossary_term.description = description;
            this.glossary_terms.push(glossary_term);
        });
    }

    get_abbreviations() {
        this.abbreviations = "";
        var terms = ["CTC", "CC", "CTH", "MaxNOM", "EXW", "FOB", "RVC", "sub-heading", "heading"];
        terms.forEach(term => {
            if (this.rule_of_origin.indexOf(term) !== -1) {
                var path = "app/data/roo/definitions/" + term + ".md";
                var fs = require('fs');
                var data = fs.readFileSync(path, 'utf8');
                var md = new MarkdownIt();
                var abbreviation = md.render(data);
                abbreviation = this.govify(abbreviation);
                this.abbreviations += abbreviation;
            }
        });
    }

    cleanse(s) {
        s = s.replace(/\\n/g, "\n");
        s = s.replace(/\n/g, "\n\n");
        s = s.replace(/\n\n\n/g, "\n\n");
        s = s.replace(/\[ul\]/g, "");
        s = s.replace(/\[bl\]/g, "");
        s = s.replace(/\[\\bl\]/g, "");
        s = s.replace(/\[\\ul\]/g, "");
        s = s.replace(/\[footnote="[^"]*"\]/g, "");
        s = s.replace(/\(([a-z])\)/g, "\n\n($1)");
        s = s.replace(/\(a\)/g, "\n\n(a)");

        // s = s.replace(/ – –/g, "<br> – –")
        // s = s.replace(/\*/g, "<br> *")
        // s = s.replace(/\+/g, "<br> - - ")
        return (s);
    }

    get_product_specific_rules_gb(req) {
        // Not used - will be combined back into the XI version
        // Will need some massaging of data though
        this.product_specific_rules = "";
        var fs = require('fs');
        var commodity = req.params["goods_nomenclature_item_id"];
        var folder = 'app/data/roo_psr/';
        var folder = path.join(__dirname, "../data/roo_psr/gb/");

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
module.exports = RooMvp
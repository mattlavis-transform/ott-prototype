const Unit = require('./unit');
var MarkdownIt = require('markdown-it');
var _ = require('lodash');


class MeasureCondition {
    constructor(req, item) {
        this.id = item["id"];
        this.action = item["attributes"]["action"];
        this.condition = item["attributes"]["condition"];
        this.condition_code = item["attributes"]["condition_code"];
        this.condition_duty_amount = item["attributes"]["condition_duty_amount"];
        this.condition_measurement_unit_code = item["attributes"]["condition_measurement_unit_code"];
        this.condition_measurement_unit_qualifier_code = item["attributes"]["condition_measurement_unit_qualifier_code"];
        this.condition_monetary_unit_code = item["attributes"]["condition_monetary_unit_code"];
        this.document_code = item["attributes"]["document_code"] + "";
        this.duty_expression = item["attributes"]["duty_expression"];
        this.requirement = item["attributes"]["requirement"];
        this.instance_count = 1;
        this.condition_class = "";
        this.condition_class_index = null;

        this.article_5a = {};
        this.article_5a.details_cds = "";
        this.article_5a.details_chief = "";
        this.article_5a.description = "";

        this.trim_requirement();
        this.check_positivity();
        this.check_condition_class();
        this.get_article_5a();
    }

    check_condition_class() {
        if (this.positive) {
            if (this.document_code == "") {
                this.condition_class = "threshold";
                this.intro_label = "Threshold condition";
                this.condition_class_label = "Exemption";
                this.condition_class_index = 3;
                this.document_code = "n/a"
    
                const regex = /<span>(.*)<\/span> <abbr title='(.*)'>/gm;
                var m = regex.exec(this.requirement);
                if (m.length > 2) {
                    if (m[2] == "Litre") {
                        this.requirement = "The volume of the imported goods does not exceed " + Math.round(m[1]) + " litres"
                    }
                    else if (m[2] == "Kilogram") {
                        this.requirement = "The weight of the imported goods does not exceed " + Math.round(m[1]) + " kilogrammes"
                    }
                }
    
            } else if (this.document_code.substring(0, 1) == "Y") {
                this.condition_class = "exception";
                this.intro_label = "Conditional exemption";
                this.condition_class_index = 2;
                this.condition_class_label = "Exemption";
            } else if (this.document_code == "C084") {
                this.intro_label = "Conditional exemption";
                this.condition_class = "exception";
                this.condition_class_label = "Exemption";
                this.condition_class_index = 2;
            } else {
                this.intro_label = "Documentation requirement";
                this.condition_class = "certificate";
                this.condition_class_label = "Rule";
                this.condition_class_index = 1;
            }
        } else {
            this.intro_label = "";
            this.condition_class = "negative";
            this.condition_class_label = "";
            this.condition_class_index = 99;
        }

    }

    append_condition(mc) {
        var conjunction_string = " & ";
        if (this.condition_class == "certificate") {
            if (mc.condition_class == "certificate") {
                this.requirement = "Provide both of these documents:\n\n" + this.requirement;
                this.requirement += " **and** " + _.lowerFirst(mc.requirement);
                this.document_code += conjunction_string + mc.document_code;
            } else if (mc.condition_class == "exception") {
                this.requirement += " <br><br><i>and</i><br><br> " + _.lowerFirst(mc.requirement);
                this.document_code += conjunction_string + mc.document_code;
            } else if (mc.condition_class == "threshold") {
                this.requirement += " <br><br><i>and</i><br><br> " + mc.requirement;
            }
        }
        else if (this.condition_class == "exception") {
            if (mc.condition_class == "exception") {
                this.requirement += " <br><br><i>and</i><br><br> " + mc.requirement;
                this.document_code += conjunction_string + mc.document_code;
            } else if (mc.condition_class == "threshold") {
                if (this.requirement.toLowerCase().includes("your shipment")) {
                    mc.requirement = mc.requirement.replace(/your shipment/gsmi, "");
                }
                this.requirement += " <br><br><i>and</i><br><br> " + _.lowerFirst(mc.requirement);
                var a = 1;
            }
        }
    }

    trim_requirement() {
        if (this.requirement != null) {
            var regex = /.*: (.*)/gm;
            var repl = "$1";
            this.requirement = this.requirement.replace(regex, repl);
        } else {
            this.requirement = null;
        }
    }

    check_positivity() {
        var negative_actions = [
            "The entry into free circulation is not allowed",
            "Export is not allowed",
            "Import is not allowed",
            "Measure not applicable",
            "Declared subheading not allowed",
            "Import/export not allowed after control",
            "Declaration to be corrected  - box 33, 37, 38, 41 or 46 incorrect"
        ]
        if (negative_actions.includes(this.action)) {
            this.positive = false;
        } else {
            this.positive = true;
        }
    }

    get_article_5a() {
        var jp = require('jsonpath');
        if ((this.document_code != "") && (this.document_code != "unspecified")) {
            var data = require('../data/appendix-5a/5a-all.json');
            var query_string = '$[?(@.document_code == "' + this.document_code + '")]';
            var result = jp.query(data, query_string);
            if (result.length > 0) {
                var details_cds = result[0].details_cds;
                var details_chief = result[0].details_chief;
                var description = result[0].description;

                var md = new MarkdownIt();
                this.article_5a.details_cds = md.render(details_cds);
                this.article_5a.details_chief = md.render(details_chief);
                this.article_5a.description = md.render(description);
                this.article_5a.status_codes = result[0].status_codes;

                if (this.article_5a.status_codes.length > 0) {
                    this.get_status_code_descriptions();
                } else {
                    this.status_code_descriptions = [];
                }

                this.article_5a.details_cds = this.article_5a.details_cds.replace(/<ul>/g, "<ul class='govuk-list govuk-list--bullet'>")
                this.article_5a.details_chief = this.article_5a.details_chief.replace(/<ul>/g, "<ul class='govuk-list govuk-list--bullet'>")

                this.article_5a.details_cds = this.article_5a.details_cds.replace(/&lt;/g, "<")
                this.article_5a.details_chief = this.article_5a.details_chief.replace(/&lt;/g, "<")

                this.article_5a.details_cds = this.article_5a.details_cds.replace(/&gt;/g, ">")
                this.article_5a.details_chief = this.article_5a.details_chief.replace(/&gt;/g, ">")

            }
        }
    }

    get_status_code_descriptions() {
        var status_codes = require('../data/appendix-5a/5b.json');
        this.status_code_descriptions = [];
        this.article_5a.status_codes.forEach(sc => {
            var item = {}
            item["status_code"] = sc;
            item["description"] = status_codes[sc].description;
            this.status_code_descriptions.push(item);
            var a = 1;
        });
    }
}
module.exports = MeasureCondition
const Unit = require('./unit');
var MarkdownIt = require('markdown-it');


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

        this.article_5a = {};
        this.article_5a.details = "";
        this.article_5a.description = "";

        this.trim_requirement();
        this.check_positivity();
        this.get_article_5a();
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
                var details = result[0].details;
                var description = result[0].description;

                var md = new MarkdownIt();
                this.article_5a.details = md.render(details);
                this.article_5a.description = md.render(description);
                if (this.document_code == "9120") {
                    var a = 1;
                }
            }
        }
    }
}
module.exports = MeasureCondition
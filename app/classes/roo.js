var MarkdownIt = require('markdown-it');
const Commodity = require('./commodity.js');
const axios = require('axios');

class Roo {
    constructor(req, key) {

        this.key = key;
        this.content = "";
        this.commodity = null;

        this.get_roo_config();
    }

    get_roo_config() {
        var data = require('../data/roo_schemes.json');
        var jp = require('jsonpath');
        var query_string = "$.schemes[?(@.countries.indexOf('" + this.key + "') != -1)]";
        var result = jp.query(data, query_string);
        if (result.length > 0) {
            var my_node = result[0];
            this.code = my_node["code"];
            this.links = my_node["links"];
            this.title = my_node["title"];
            this.data_file = my_node["data_file"];
            if (this.data_file != "") {
                var data_filename = 'app/data/roo/' + this.data_file;

                var fs = require('fs');
                var data = fs.readFileSync(data_filename, 'utf8');
                var md = new MarkdownIt();
                this.content = md.render(data);
                this.govify();
            }
        }
    }

    govify() {
        this.content = this.content.replace(/<h1/g, "<h1 class='govuk-heading-l'")
        this.content = this.content.replace(/<h2/g, "<h2 class='govuk-heading-m'")
        this.content = this.content.replace(/<h3/g, "<h3 class='govuk-heading-s'")
        this.content = this.content.replace(/<ul/g, "<ul class='govuk-list govuk-list--bullet'")
    }

}
module.exports = Roo
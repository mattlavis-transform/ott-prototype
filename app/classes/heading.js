const Commodity = require('./commodity.js')
const Measure = require('./measure.js')
const Duty_expression = require('./duty_expression.js')
const Footnote = require('./footnote.js')

class Heading {
    constructor(json) {
        var t, c, m, de, f, measure_class, indent_class;

        this.json = json;
        this.commodities = [];
        this.measures = [];
        this.duty_expressions = [];
        this.footnotes = [];
        this.data = this.json["data"];
        this.included = this.json["included"];

        // Get the basic data from the API, prior to organising into an atomic object for the nunjucks
        this.included.forEach(obj => {
            t = obj["type"];
            switch (t) {
                case "commodity":
                    var sid = obj["id"];
                    var goods_nomenclature_item_id = obj["attributes"]["goods_nomenclature_item_id"];
                    var productline_suffix = obj["attributes"]["producline_suffix"];
                    var description = obj["attributes"]["formatted_description"];
                    var number_indents = obj["attributes"]["number_indents"];
                    if (number_indents > 1) {
                        indent_class = " indent";
                    } else {
                        indent_class = "";
                    }
                    var leaf = obj["attributes"]["leaf"];
                    var parent_sid = obj["attributes"]["parent_sid"];

                    c = new Commodity(sid, goods_nomenclature_item_id, productline_suffix, description, number_indents, leaf, parent_sid, indent_class);
                    var overview_measures = obj["relationships"]["overview_measures"]["data"];
                    overview_measures.forEach(item => {
                        m = new Measure(item["id"], null, null, null);
                        c.measures.push(m);
                    });
                    this.commodities.push(c);
                    break;

                case "measure":
                    var measure_type_id = obj["relationships"]["measure_type"]["data"]["id"];
                    var vat = obj["attributes"]["vat"];
                    measure_class = this.get_measure_class(measure_type_id);
                    m = new Measure(obj["id"], measure_type_id, vat, measure_class);
                    this.measures.push(m);
                    break;

                case "duty_expression":
                    var measure_id = obj["id"].replace("-duty_expression", "");
                    var base = obj["attributes"]["base"];
                    var formatted_base = obj["attributes"]["formatted_base"];
                    de = new Duty_expression(measure_id, base, formatted_base);
                    this.duty_expressions.push(de);
                    break

                case "footnote":
                    var code = obj["attributes"]["code"];
                    var description = obj["attributes"]["formatted_description"];
                    f = new Footnote(code, description);
                    this.footnotes.push(f);
                    break
            }
        });

        // Assign the duty expressions to the measures
        this.measures.forEach(m => {
            this.duty_expressions.forEach(de => {
                if (de.measure_id == m.id) {
                    m.duty_expression = de.formatted_base;
                }
            });
        });

        // Assign the measures to the commodity codes
        this.commodities.forEach(c => {
            c.measures.forEach(m => {
                this.measures.forEach(m2 => {
                    if (m2.id == m.id) {
                        switch (m2.measure_class) {
                            case "mfn":
                                c.mfn = m2.duty_expression;
                                break;
                            case "supplementary_unit":
                                c.supplementary_unit = m2.duty_expression;
                                break;
                            case "vat":
                                c.vat = m2.duty_expression;
                                break;
                        }
                    }
                });
            });
        });

        return (this);
    }

    get_measure_class(measure_type_id) {
        var measure_class;
        var mfn_types = ["103", "105"];
        var supplementary_unit_types = ["109", "110"];
        if (mfn_types.indexOf(measure_type_id) > -1) {
            measure_class = "mfn"
        }
        else if (supplementary_unit_types.indexOf(measure_type_id) > -1) {
            measure_class = "supplementary_unit"
        }
        else {
            measure_class = "vat"
        }
        return (measure_class);
    }
}

module.exports = Heading;


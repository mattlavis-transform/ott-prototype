const Measure = require("./measure");
const MeasureComponent = require("./measure_component");
const MeasureType = require("./measure_type");
const GeographicalArea = require("./geographical_area");
const AdditionalCode = require("./additional_code");
const Calculation = require("./calculation");

class Commodity {
    constructor(sid = null, goods_nomenclature_item_id = null, productline_suffix = null, description = null, number_indents = null, leaf = null, parent_sid = null, indent_class = null) {
        this.sid = sid;
        this.goods_nomenclature_item_id = goods_nomenclature_item_id;
        this.productline_suffix = productline_suffix;
        this.description = description;
        this.number_indents = number_indents;
        this.indent_class = "";
        this.leaf = leaf;
        this.parent_sid = parent_sid;
        this.indent_class = indent_class;
        this.supplementary_unit = null;
        this.measure_type_series_id = null;
        this.measures = [];
        this.meursing = false;
        this.country_name = "";
        this.phase = "";
        this.units = [];

        this.quotas = [];
        this.mfns = [];
        this.vats = [];
        this.excises = [];
        this.preferences = [];
        this.remedies = [];

        this.mfn_array = ["103", "105"];
        this.preference_array = ["142", "145"];
        this.remedy_array = ["551", "552", "553", "554"];
        this.quota_array = ["143", "146", "122", "123"];
        this.supplementary_unit_array = ["109", "110"];

        if (this.goods_nomenclature_item_id != null) {
            this.formatted_commodity_code = this.goods_nomenclature_item_id
            this.format_commodity_code();
        }
    }

    get_data(json, country = null, date = null) {
        this.data = json["data"];
        this.included = json["included"];
        this.sid = this.data["id"];
        this.goods_nomenclature_item_id = this.data["attributes"]["goods_nomenclature_item_id"];
        this.description = this.data["attributes"]["formatted_description"];
        this.number_indents = this.data["attributes"]["number_indents"];
        this.basic_duty_rate_string = this.data["attributes"]["basic_duty_rate"];
        if (this.basic_duty_rate_string == null) {
            this.basic_duty_rate_string = "variable";
        }
        this.format_basic_duty_rate();

        this.formatted_commodity_code = this.goods_nomenclature_item_id;
        this.format_commodity_code();
    }

    get_measure_data(origin) {
        var m, mc, mt, g, ac, id, item2;

        /* START GOOD EXAMPLES

        7202118000 = Ferro-alloy (basic ad valorem)
        0201100021 = Bison - has units
        0406103010 = Mozzarella - has units
        8518400010 = Amplifiers - has a supplementary unit
        8708701080 = Tyres - has anti-dumping (China)
        1905319100 = Sandwich biscuits - has Meursing - Meursings are also weight-dependents
        0702000007 = Cherry tomatoes - has Entry Price System
        2710124900 = Light oil - Has excise in litres unit
        
        END GOOD EXAMPLES */


        this.origin = origin;
        this.origin_obj = new GeographicalArea();
        this.country_name = this.origin_obj.get_description(origin);

        this.measures = [];
        this.measure_components = [];
        this.measure_types = [];
        this.geographical_areas = [];
        this.additional_codes = [];

        // Get all the measures + measure components
        this.included.forEach(item => {
            if (item["type"] == "measure") {
                id = item["id"];
                m = new Measure(id);
                m.origin = item["attributes"]["origin"];
                m.effective_start_date = item["attributes"]["effective_start_date"];
                m.effective_end_date = item["attributes"]["effective_end_date"];
                m.import = item["attributes"]["import"];
                m.excise = item["attributes"]["excise"];
                m.vat = item["attributes"]["vat"];
                m.measure_type_id = item["relationships"]["measure_type"]["data"]["id"];
                m.geographical_area_id = item["relationships"]["geographical_area"]["data"]["id"];
                if (item.hasOwnProperty("relationships")) {
                    item2 = item["relationships"];
                    if (item2.hasOwnProperty("additional_code")) {
                        m.additional_code_id = item["relationships"]["additional_code"]["data"]["id"];
                    }
                }


                if (m.import == true) {
                    this.measures.push(m);
                }

            } else if (item["type"] == "measure_component") {
                mc = new MeasureComponent(item);
                this.measure_components.push(mc);

            } else if (item["type"] == "measure_type") {
                mt = new MeasureType(item);
                this.measure_types.push(mt);

            } else if (item["type"] == "geographical_area") {
                g = new GeographicalArea(item);
                this.geographical_areas.push(g);

            } else if (item["type"] == "additional_code") {
                ac = new AdditionalCode(item);
                this.additional_codes.push(ac);
            }
        });

        this.assign_geographical_areas();
        this.assign_additional_codes();
        this.remove_irrelevant_measures();
        this.assign_measure_components();
        this.get_units();
        this.categorise_measures();

        console.log("Units: " + this.units);
        console.log("VATs: " + this.vats);
        console.log("Excises: " + this.excises);
        console.log("MFNs: " + this.mfns);
        console.log("Preferences: " + this.preferences);
        console.log("Quotas: " + this.quotas);
        console.log("Remedies: " + this.remedies);

        var valid_phases = ["results"];
        if (valid_phases.includes(this.phase)) {
            this.calculate_vat();
            this.calculate_excise();
            this.calculate_mfn();
        }
    }

    calculate_vat() {
        this.vats.forEach(calc => {
            calc.calculate();
        });
    }

    calculate_excise() {
        this.excises.forEach(calc => {
            calc.calculate();
        });
    }

    calculate_mfn() {
        this.mfns.forEach(calc => {
            calc.calculate();
        });
    }

    // Assign the geographical area to the measure
    assign_geographical_areas() {
        this.measures.forEach(m => {
            this.geographical_areas.forEach(g => {
                if (m.geographical_area_id == g.id) {
                    m.geographical_area = g;
                }
            });
        });

    }

    // Assign the additional code to the measure
    assign_additional_codes() {
        this.measures.forEach(m => {
            this.additional_codes.forEach(ac => {
                if (m.additional_code_id == ac.id) {
                    m.additional_code = ac;
                }
            });
        });

    }

    // Assign the measure components to the measures - also check for Meursing
    assign_measure_components() {
        this.measure_components.forEach(mc => {
            this.measures.forEach(m => {
                if (mc.measure_id == m.id) {
                    if (mc.meursing) {
                        m.meursing = true;
                        this.meursing = true;
                    }
                    m.measure_components.push(mc);
                    console.log("Pushed compnent");
                }
            });
        });
        this.measures.forEach(m => {
            m.combine_duties();
        });
    }

    // Remove any measures that are not financial or are not relevant to my country
    remove_irrelevant_measures() {
        var i;
        this.measures.forEach(m => {
            this.measure_types.forEach(mt => {
                if (mt.id == m.measure_type_id) {
                    m.financial = mt.financial;
                    m.measure_type_series_id = mt.measure_type_series_id;
                }
            });
            if ((m.geographical_area_id == this.origin) || (m.geographical_area.members.includes(this.origin))) {
                m.relevant = true;
            }
        });

        for (i = this.measures.length - 1; i >= 0; --i) {
            if ((this.measures[i].financial == false) || (this.measures[i].relevant == false)) {
                this.measures.splice(i, 1);
            }
        }
    }

    // Work out the units
    get_units() {
        this.measures.forEach(m => {
            if (!this.supplementary_unit_array.includes(m.measure_type_id)) {
                m.measure_components.forEach(mc => {
                    if (mc.measurement_unit_code != null) {
                        //console.log (m.id + " : " + m.measure_type_id + " : " + mc.measurement_unit_code)
                        this.units.push(mc.measurement_unit_code);
                    }
                });
            }
        });
        this.units = this.set(this.units);

        if (this.meursing) {
            this.units = ["KGM"];
            this.measurement_unit = "kilograms";
        } else {
            this.measurement_unit = "";
            if (this.units.length == 1) {
                var measurement_units = require('./measurement_units.json');
                measurement_units.forEach(item => {
                    if (item["measurement_unit_code"] == this.units[0]) {
                        this.measurement_unit = item["description"];
                        if (item.hasOwnProperty("warning")) {
                            this.warning = item["warning"] + " [" + this.measurement_unit + "]";
                        } else {
                            this.warning = "";
                        }
                    }
                });
            }
        }
    }

    pass_request(req) {
        this.req_data = req.session.data;
        this.currency = this.get_req_data("currency")
        this.monetary_value = this.get_req_data("monetary_value")
        this.unit_value = this.get_req_data("unit_value")
        this.meursing_code = this.get_req_data("meursing_code")
        this.company = this.get_req_data("company")
    }

    get_req_data(prop) {
        if (this.req_data.hasOwnProperty(prop)) {
            return this.req_data[prop];
        } else {
            return null;
        }
    }

    // Categorise the measures
    categorise_measures() {
        this.measures.forEach(m => {
            if (this.mfn_array.includes(m.measure_type_id)) {
                this.mfns.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.meursing_code, this.company));

            } else if (this.preference_array.includes(m.measure_type_id)) {
                this.preferences.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.meursing_code, this.company));

            } else if (this.remedy_array.includes(m.measure_type_id)) {
                this.remedies.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.meursing_code, this.company));

            } else if (this.quota_array.includes(m.measure_type_id)) {
                this.quotas.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.meursing_code, this.company));

            } else if (m.measure_type_series_id == "P") {
                this.vats.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.meursing_code, this.company));

            } else if (m.measure_type_series_id == "Q") {
                this.excises.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.meursing_code, this.company));

            }
        });
    }

    format_basic_duty_rate() {
        var s;
        s = this.basic_duty_rate_string;
        s = s.replace("</span>", "");
        s = s.replace(/\<span[^\>]+\>/g, "");
        this.basic_duty_rate = s;
    }

    format_commodity_code() {
        if (this.leaf != true) {
            if (this.formatted_commodity_code.substr(6, 4) == "0000") {
                this.formatted_commodity_code = this.formatted_commodity_code.substr(0, 6);
            }
            else if (this.formatted_commodity_code.substr(8, 2) == "00") {
                this.formatted_commodity_code = this.formatted_commodity_code.substr(0, 8);
            }
        }
    }


    set(arr) {
        return arr.reduce(function (a, val) {
            if (a.indexOf(val) === -1) {
                a.push(val);
            }
            return a;
        }, []);
    }
}
module.exports = Commodity
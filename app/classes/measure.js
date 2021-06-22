const GeographicalArea = require('./geographical_area');

class Measure {
    constructor(id = null, measure_type_id = null, vat = null, measure_class = null) {
        this.id = id;
        this.measure_type_id = measure_type_id;
        this.measure_type_description = null;
        this.measure_class = measure_class;
        this.duty_expression = null;
        this.financial = null;
        this.relevant = false;
        this.measure_components = [];

        // Conditions
        this.measure_condition_ids = [];
        this.measure_conditions = [];
        this.has_conditions = false;
        this.popup_message = "";

        // Footnotes
        this.has_footnotes = false;
        this.footnotes = [];

        // Geography
        this.geographical_area = null;
        this.geographical_area_id = null;
        this.geographical_area_description = null;
        this.additional_code_id = null;
        this.additional_code = null;
        this.additional_code_code = null;
        this.combined_duty = "";
        this.combined_duty_after_meursing = "";
        this.order_number = null;
        this.order_number_id = null;
        this.import = null;
        this.legal_base = "";
        this.legal_acts = [];
        this.legal_act_ids = [];
        this.excluded_country_string = "";
        this.excluded_countries = [];
        this.excluded_country_ids = [];
        this.has_meursing = false;
        this.display_block = "";
        this.duty_bearing = null;
    }

    get_excluded_country_string() {
        var listify = require('listify');
        this.excluded_country_descriptions = [];
        this.excluded_countries.forEach(ex => {
            this.excluded_country_descriptions.push(ex.description);
        });
        this.excluded_country_string = listify(this.excluded_country_descriptions);
        this.excluded_country_string = this.excluded_country_string.replace(", and", " and");
    }

    combine_duties() {
        this.has_minimum = false;
        this.has_maximum = false;
        this.combined_duty = "";
        // Count the number of clauses in the duty
        // If there are MAX or MIX types, then there are multiple clauses
        this.multi_clause = false;
        this.measure_components.forEach(mc => {
            if ((mc.has_maximum) || (mc.has_minimum)) {
                this.multi_clause = true;
            }
        });
        if (this.multi_clause) {
            this.combined_duty = "(";
        }
        this.measure_components.forEach(mc => {
            if (mc.has_maximum) {
                this.has_maximum = true;
            }
            if (mc.has_minimum) {
                this.has_minimum = true;
            }
            this.combined_duty += mc.duty_string + " ";
            if (mc.is_meursing) {
                this.has_meursing = true;
            }
        });
        if (this.multi_clause) {
            this.combined_duty += ")";
        }
        if (this.has_maximum) {
            this.combined_duty = "The lower of " + this.combined_duty;
        }
        if (this.has_minimum) {
            this.combined_duty = "The higher of " + this.combined_duty;
        }
        this.combined_duty = this.combined_duty.replace(/ \)/g, ")")
    }

    structure_conditions() {
        var _ = require('lodash');
        this.condition_codes = [];
        this.positive_condition_count = 0;
        // Count the positive conditions and the number of condition codes
        this.measure_conditions.forEach(mc => {
            if (typeof mc.condition_code !== 'undefined') {
                if (mc.positive) {
                    this.positive_condition_count += 1;
                }
                this.condition_codes.push(mc.condition_code);
                var a = 1;
            }
        });

        this.condition_codes = _.uniq(this.condition_codes);
        this.condition_code_count = this.condition_codes.length;

        // intro message on the popup
        if (this.condition_code_count == 1) {
            if (this.positive_condition_count == 1) {
                this.popup_message = "Ensure that you meet the following condition:";
            } else {
                this.popup_message = "Ensure that you meet one of the following conditions:";
            }
            this.exposed_conditions = this.measure_conditions;
        } else if (this.condition_code_count > 1) {
            this.popup_message = "Ensure that you meet one of the following conditions:";
            this.combine_complex_measures();
            //this.exposed_conditions = this.measure_conditions;
        }

        if (this.positive_condition_count > 0) {
            this.exposed_conditions.sort(compare_conditions);
        }

        function compare_conditions(a, b) {
            if (a.condition_class_index > b.condition_class_index) {
                return 1;
            }
            if (a.condition_class_index < b.condition_class_index) {
                return -1;
            }
            return 0;
        }
    }

    combine_pairs() {
        var single_pushed = false;
        this.temp_conditions = this.exposed_conditions;
        this.exposed_conditions = [];
        this.temp_conditions.forEach(measure_condition => {
            if (measure_condition.instance_count == 2) {
                this.exposed_conditions.push(measure_condition);
            } else {
                if (!single_pushed) {
                    this.exposed_conditions.push(measure_condition);
                    single_pushed = true;
                } else {

                    var ln = this.exposed_conditions.length;
                    var i = 0;
                    for (i = 0; i < ln; i++) {
                        var mc = this.exposed_conditions[i];
                        if (this.exposed_conditions[i].instance_count == 1) {
                            mc.append_condition(measure_condition);
                            break;
                        }
                    }
                    // var mc = this.exposed_conditions[ln - 1];
                    // mc.append_condition(measure_condition);
                }
            }
        });
    }

    sort_measure_conditions_exposed() {
        this.exposed_conditions.sort(compare_condition_classes);
        this.exposed_conditions.sort(compare_condition_counts);

        function compare_condition_counts(a, b) {
            if (a.count < b.count) {
                return 1;
            }
            if (a.count > b.count) {
                return -1;
            }
            return 0;
        }

        function compare_condition_classes(a, b) {
            if (a.condition_class < b.condition_class) {
                return -1;
            }
            if (a.condition_class > b.condition_class) {
                return 1;
            }
            return 0;
        }
    }

    combine_complex_measures() {
        this.exposed_conditions = [];
        this.measure_conditions.forEach(mc => {
            if (mc.positive) {
                var found = false;
                for (var i = 0; i < this.exposed_conditions.length; i++) {
                    var e = this.exposed_conditions[i];
                    if (e.document_code == mc.document_code) {
                        e.instance_count += 1;
                        found = true;
                        break;
                    }
                }
                if (found == false) {
                    this.exposed_conditions.push(mc);
                }
            }
        });

        this.sort_measure_conditions_exposed();
        this.combine_pairs();

    }

}
module.exports = Measure
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

        // Footnotes
        this.has_footnotes = false;
        
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



}
module.exports = Measure
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
        this.geographical_area = null;
        this.geographical_area_id = null;
        this.geographical_area_description = null;
        this.additional_code_id = null;
        this.additional_code = null;
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
        this.combined_duty = "";
        this.measure_components.forEach(mc => {
            this.combined_duty += mc.duty_string + " ";
            if (mc.is_meursing) {
                this.has_meursing = true;
            }
        });
    }



}
module.exports = Measure
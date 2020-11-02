class Measure {
    constructor(id = null, measure_type_id = null, vat = null, measure_class = null) {
        this.id = id;
        this.measure_type_id = measure_type_id;
        this.measure_class = measure_class;
        this.duty_expression = null;
        this.financial = null;
        this.relevant = false;
        this.measure_components = [];
        this.geographical_area = null;
        this.additional_code_id = null;
        this.additional_code = null;
        this.combined_duty = "";
    }

    combine_duties() {
        this.combined_duty = "";
        this.measure_components.forEach(mc => {
            this.combined_duty += mc.duty_string + " ";
        });
    }
}
module.exports = Measure
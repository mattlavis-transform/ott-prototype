const Unit = require('./unit');


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
        this.document_code = item["attributes"]["document_code"];
        this.duty_expression = item["attributes"]["duty_expression"];
        this.requirement = item["attributes"]["requirement"];
        var a = 1;
    }
}
module.exports = MeasureCondition
class Measure {
    constructor(id, measure_type_id, vat, measure_class) {
        this.id = id;
        this.measure_type_id = measure_type_id;
        this.measure_class = measure_class;
        this.duty_expression = null;
    }
}
module.exports = Measure
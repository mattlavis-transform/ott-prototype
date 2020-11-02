class MeasureType {
    constructor(item) {
        this.id = item["id"];
        this.description = item["attributes"]["description"];
        this.measure_type_series_id = item["attributes"]["measure_type_series_id"];
        this.get_type();
    }

    get_type() {
        var financial_measure_type_series = ["C", "D", "F", "J", "M", "O", "P", "Q"];
        this.financial = financial_measure_type_series.includes(this.measure_type_series_id);
    }
}
module.exports = MeasureType
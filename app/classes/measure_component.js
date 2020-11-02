class MeasureComponent {
    constructor(item) {
        this.id = item["id"];
        this.duty_amount = item["attributes"]["duty_amount"];
        this.monetary_unit_code = item["attributes"]["monetary_unit_code"];
        this.monetary_unit_abbreviation = item["attributes"]["monetary_unit_abbreviation"];
        this.measurement_unit_code = item["attributes"]["measurement_unit_code"];
        this.duty_expression_description = item["attributes"]["duty_expression_description"];
        this.duty_expression_abbreviation = item["attributes"]["duty_expression_abbreviation"];
        this.meursing_duty_expressions = ["12", "14", "21", "25", "27", "29"];
        this.measurement_unit_qualifier_code = null;

        this.parse_id();
        this.check_specific();
        this.get_duty_string();
    }

    check_specific() {
        if ((this.measurement_unit_code != null) || (this.meursing)) {
            this.specific = true;
        } else {
            this.specific = false;
        }
    }

    parse_id() {
        // var parts = this.id.split('-');
        // this.measure_id = parts[0];
        // this.duty_expression_id = parts[1];

        this.measure_id = this.id.substring(0, this.id.length - 3);
        this.duty_expression_id = this.id.substring(this.id.length - 2, this.id.length);

        if (this.meursing_duty_expressions.includes(this.duty_expression_id)) {
            this.meursing = true;
        } else {
            this.meursing = false;
        }
    }

    get_measurement_unit() {
        return this.measurement_unit_code
    }

    get_qualifier() {
        return this.measurement_unit_qualifier_code
    }

    get_duty_string(decimal_places = 3)
    {
        if (this.monetary_unit_code == "") {
            decimal_places = 2;
        } else {
            decimal_places = 2;
        }

        this.duty_string = "";
        var duty_amount = parseFloat(this.duty_amount)
        var duty_amount = duty_amount.toFixed(decimal_places);

        switch (this.duty_expression_id) {
            case "01":
                if (this.monetary_unit_code == null) {
                    this.duty_string += duty_amount + "%";
                } else {
                    this.duty_string += duty_amount + " " + this.monetary_unit_code;
                    if (this.measurement_unit_code != null) {
                        this.duty_string += " / " + this.get_measurement_unit();
                        if (this.measurement_unit_qualifier_code != null) {
                            this.duty_string += " / " + this.get_qualifier();
                        }
                    }
                }
                break;
            case "04": // All three of these together
            case "19":
            case "20":
                // Do stuff
                if (this.monetary_unit_code == null) {
                    this.duty_string += " + " + duty_amount + "%";
                } else {
                    this.duty_string += " + " + duty_amount + " " + this.monetary_unit_code;
                    if (this.measurement_unit_code != null) {
                        this.duty_string += " / " + this.get_measurement_unit();
                        if (this.measurement_unit_qualifier_code != null) {
                            this.duty_string += " / " + this.get_qualifier();
                        }
                    }
                }
                break;
            case "12":
                this.duty_string += " + AC";
                break;
            case "15":
                if (this.monetary_unit_code == null) {
                    this.duty_string += "MIN " + duty_amount + "%";
                } else {
                    this.duty_string += "MIN " + duty_amount + " " + this.monetary_unit_code;
                    if (this.measurement_unit_code != null) {
                        this.duty_string += " / " + this.get_measurement_unit();
                        if (this.measurement_unit_qualifier_code != null) {
                            this.duty_string += " / " + this.get_qualifier();
                        }
                    }
                }
                break;

            case "17":
            case "35":
                if (this.monetary_unit_code == null) {
                    this.duty_string += "MAX " + duty_amount + "%";
                } else {
                    this.duty_string += "MAX " + duty_amount  + " " + this.monetary_unit_code;
                    if (this.measurement_unit_code != null) {
                        this.duty_string += " / " + this.get_measurement_unit();
                        if (this.measurement_unit_qualifier_code != null) {
                            this.duty_string += " / " + this.get_qualifier();
                        }
                    }
                }
                break;
            case "21":
                this.duty_string += " + SD";
                break;
            case "27":
                this.duty_string += " + FD";
                break;
            case "25":
                this.duty_string += " + SD (reduced)";
                break;
            case "29":
                this.duty_string += " + FD (reduced)";
                break;
            case "14":
                this.duty_string += " + AC (reduced)";
                break;
        }
    }

}
module.exports = MeasureComponent
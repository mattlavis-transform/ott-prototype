const Unit = require('./unit');


class MeasureComponent {
    constructor(item) {
        this.id = item["id"];
        this.duty_amount = item["attributes"]["duty_amount"];
        this.monetary_unit_code = item["attributes"]["monetary_unit_code"];
        this.monetary_unit_abbreviation = null;
        this.measurement_unit_code = item["attributes"]["measurement_unit_code"];
        this.measurement_unit_qualifier_code = null;
        this.unit = null;

        if (item["id"] == "20000889-01") {
            this.measurement_unit_qualifier_code = "P";
        }
        if (this.measurement_unit_code != null) {
            this.measurement_unit_combined = this.measurement_unit_code;
            if (this.measurement_unit_qualifier_code != null) {
                this.measurement_unit_combined += " " + this.measurement_unit_qualifier_code;
            }
            // this.unit = new Unit(this.measurement_unit_combined);
            this.unit = new Unit(this.measurement_unit_code, this.measurement_unit_qualifier_code);
        }

        this.duty_expression_description = item["attributes"]["duty_expression_description"];
        this.duty_expression_abbreviation = item["attributes"]["duty_expression_abbreviation"];
        this.meursing_duty_expressions = ["12", "14", "21", "25", "27", "29"];
        this.is_meursing = false;

        this.parse_id();
        this.check_specific();
        this.get_short_monetary_unit_code();
        this.get_duty_string();
    }

    get_short_monetary_unit_code() {
        var currencies = [
            { "long": "GBP", "short": "£" },
            { "long": "EUR", "short": "€" }
        ]
        //console.log(currencies);
        currencies.forEach(currency => {
            if (this.monetary_unit_code == currency["long"]) {
                this.monetary_unit_abbreviation = currency["short"];
                //console.log("Found " + this.monetary_unit_abbreviation + " for " + this.monetary_unit_code + " for " + this.id);
            }
        });
    }

    check_specific() {
        if ((this.measurement_unit_code != null) || (this.is_meursing)) {
            this.specific = true;
        } else {
            this.specific = false;
        }
    }

    parse_id() {
        this.measure_id = this.id.substring(0, this.id.length - 3);
        this.duty_expression_id = this.id.substring(this.id.length - 2, this.id.length);
        //console.log(this.measure_id + ' : ' + this.duty_expression_id);
        if (this.meursing_duty_expressions.includes(this.duty_expression_id)) {
            this.is_meursing = true;
        } else {
            this.is_meursing = false;
        }
    }

    get_measurement_unit() {
        var measurement_units = require('./measurement_units.json');
        var s;
        s = this.measurement_unit_code;
        measurement_units.forEach(item => {
            if (item.measurement_unit_code == this.measurement_unit_code) {
                s = item.abbreviation;
            }
        });
        return (s);
    }

    get_qualifier() {
        return this.measurement_unit_qualifier_code
    }

    get_duty_string(decimal_places = 3) {
        //var MAX_STRING = " MAX ";
        var MAX_STRING = " up to a maximum of ";
        var MIN_STRING = " down to a maximum of ";

        if (this.monetary_unit_code == null) {
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
                    this.duty_string += " " + this.monetary_unit_abbreviation + duty_amount + " ";
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
                    this.duty_string += " + " + this.monetary_unit_abbreviation + duty_amount + " ";
                    if (this.measurement_unit_code != null) {
                        this.duty_string += " / " + this.get_measurement_unit();
                        if (this.measurement_unit_qualifier_code != null) {
                            this.duty_string += " / " + this.get_qualifier();
                        }
                    }
                }
                break;
            case "12":
                this.duty_string += " + <abbr title='Agricultural component'>AC</abbr>";
                break;
            case "15":
                if (this.monetary_unit_code == null) {
                    this.duty_string += MIN_STRING + duty_amount + "%";
                } else {
                    this.duty_string += MIN_STRING + this.monetary_unit_abbreviation + duty_amount + " ";
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
                    this.duty_string += MAX_STRING + duty_amount + "%";
                } else {
                    this.duty_string += MAX_STRING + this.monetary_unit_abbreviation + duty_amount + " ";
                    if (this.measurement_unit_code != null) {
                        this.duty_string += " / " + this.get_measurement_unit();
                        if (this.measurement_unit_qualifier_code != null) {
                            this.duty_string += " / " + this.get_qualifier();
                        }
                    }
                }
                break;
            case "21":
                this.duty_string += " + <abbr title='Sugar duty'>SD</abbr>";
                break;
            case "27":
                this.duty_string += " + <abbr title='Flour duty'>FD</abbr>";
                break;
            case "25":
                this.duty_string += " + <abbr title='Sugar duty'>SD</abbr> (reduced)";
                break;
            case "29":
                this.duty_string += " + <abbr title='Flour duty'>FD</abbr> (reduced)";
                break;
            case "14":
                this.duty_string += " + <abbr title='Agricultural component'>AC</abbr> (reduced)";
                break;
        }
    }

}
module.exports = MeasureComponent
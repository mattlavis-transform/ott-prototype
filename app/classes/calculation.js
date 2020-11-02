class Calculation {
    constructor(m, currency, monetary_value, unit_value, meursing_code, company) {
        this.measure = m;
        this.currency = currency;
        this.monetary_value = monetary_value;
        this.unit_value = unit_value;
        this.meursing_code = meursing_code;
        this.company = company;

        this.calculation_string = "";
        this.result = 0.00;
        this.result_string = "";
    }

    calculate() {
        console.log("Calculating");
        this.measure.measure_components.forEach(mc => {
            console.log(this.monetary_value);
            console.log(this.unit_value);
            if (mc.specific == false) {
                this.result += mc.duty_amount * this.monetary_value / 100;
            } else {
                this.result += mc.duty_amount * this.unit_value;
            }
        });
        this.calculation_string = this.measure.combined_duty;
        console.log("Result is " + this.result);
    }
}
module.exports = Calculation
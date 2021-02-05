const { chunk } = require("underscore");

require("./global");

class Calculation {
    constructor(m, currency, monetary_value, unit_value, multiplier, meursing_code, company, meursing_blob) {
        this.measure = m;
        this.currency = currency;
        this.monetary_value = monetary_value;
        this.unit_value = unit_value;
        this.multiplier = multiplier;
        this.meursing_code = meursing_code;
        this.company = company;
        this.meursing_blob = meursing_blob;

        this.has_specifics = false;
        this.unit = null;
        this.has_meursing = false;

        this.calculation_string = "";
        this.calculation_string_after_meursing = "";
        this.result = 0.00;
        this.result_string = "";
    }

    calculate() {
        // Check for maximums + minimums
        var clause_count = 1;
        var clause_starts = [0]
        this.conjunction = "";
        this.chunks = [];
        var chunk;
        var i = 0;
        this.measure.measure_components.forEach(mc => {
            if (i == 0) {
                chunk = new Chunk(this.monetary_value, this.unit_value, this.multiplier);
            }
            if ((mc.duty_expression_description == "Maximum") || (mc.duty_expression_description == "Minimum")) {
                //console.log("Found a new chunk");
                this.chunks.push(chunk);
                chunk = new Chunk(this.monetary_value, this.unit_value, this.multiplier);
                chunk.measure_components.push(mc);
                clause_count += 1;
                clause_starts.push(i);
                this.conjunction = mc.duty_expression_description;
            } else {
                chunk.measure_components.push(mc);
            }
            i += 1;
        });
        this.chunks.push(chunk);
        //console.log("Clause count = " + clause_count);
       // console.log("Chunk length = " + this.chunks.length);
        //console.log("clause_starts = " + clause_starts);

        var i = 0;
        this.chunks.forEach(chunk => {
            //("\nChunk " + i + "\n=========");
            chunk.measure_components.forEach(mc => {
                // console.log(mc.duty_amount);
            });
            i++;
        });

        var total, result;
        if (this.conjunction == "Minimum") {
            total = 0;
            this.chunks.forEach(chunk => {
                result = chunk.calculate();
                if (result > total) {
                    total = result;
                }
            });
        } else {
            total = 999999999999999;
            this.chunks.forEach(chunk => {
                result = chunk.calculate();
                //console.log("Result is " + result);
                if (result < total) {
                    total = result;
                }
            });
        }
        this.result = total;


        //console.log("Calculating");
        var phrase_result;
        this.measure.measure_components.forEach(mc => {
            if (mc.specific == false) {
                phrase_result = mc.duty_amount * this.monetary_value / 100;
                //console.log(mc.duty_amount + " : " + this.monetary_value + " : " + phrase_result + " : " + mc.duty_expression_description);
                this.result += phrase_result;
            } else {
                this.has_specifics = true;
                this.unit = mc.measurement_unit_code;
                phrase_result = mc.duty_amount * this.unit_value * this.multiplier;
                this.result += phrase_result;
                //console.log(mc.duty_amount + " : " + this.unit_value + " : " + this.multiplier + " : " + phrase_result + " : " + mc.duty_expression_description);
            }
        });
        this.calculation_string = this.measure.combined_duty;
        if (this.has_specifics) {
            this.calculation_string += "(<em>on " + decimals(this.unit_value, 2) + " " + this.unit + "</em>)";
        }
        //this.calculation_string += this.meursing_code;
        //this.calculation_string = "Calc string";
    }

    decimals = function (str, cnt) {
        var i = parseFloat(str)
        var n = i.toFixed(cnt).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        return n;
    }
}

class Chunk {
    constructor(monetary_value, unit_value, multiplier) {
        this.measure_components = [];
        this.value = "";
        this.monetary_value = monetary_value;
        this.unit_value = unit_value;
        this.multiplier = multiplier;
        this.result = 0;
    }

    calculate() {
        //("Calculating");
        var phrase_result;
        this.measure_components.forEach(mc => {
            if (mc.specific == false) {
                phrase_result = mc.duty_amount * this.monetary_value / 100;
                //console.log(mc.duty_amount + " : " + this.monetary_value + " : " + phrase_result + " : " + mc.duty_expression_description);
                this.result += phrase_result;
            } else {
                this.has_specifics = true;
                this.unit = mc.measurement_unit_code;
                phrase_result = mc.duty_amount * this.unit_value * this.multiplier;
                this.result += phrase_result;
                //console.log(mc.duty_amount + " : " + this.unit_value + " : " + this.multiplier + " : " + phrase_result + " : " + mc.duty_expression_description);
            }
        });
        return (this.result);
        // this.calculation_string = this.measure.combined_duty;
        // if (this.has_specifics) {
        //     this.calculation_string += "(<em>on " + decimals(this.unit_value, 2) + " " + this.unit + "</em>)";
        // }        
    }
}
module.exports = Calculation
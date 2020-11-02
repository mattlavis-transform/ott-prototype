class Error_handler {
    validate_date(req) {
        console.log("Validating date");
        var err = false;
        var import_date_day = req.session.data["import_date-day"];
        var import_date_month = req.session.data["import_date-month"];
        var import_date_year = req.session.data["import_date-year"];

        if (import_date_day > 31 || import_date_day < 1) {
            err = true;
            return err;
        }
        if (import_date_month > 12 || import_date_month < 1) {
            err = true;
            return err;
        }
        if (import_date_year < 2021) {
            err = true;
            return err;
        }
        return (err);
    }

    validate_destination(req) {
        console.log("Validating destination");
        var err = false;
        var destination = req.session.data["destination"] + "";

        if ((destination == "") || (destination == "undefined")) {
            err = true;
            return err;
        }
        return (err);
    }

    validate_origin(req) {
        console.log("Validating origin");
        var err = false;
        var origin = req.session.data["origin"] + "";

        if ((origin == "") || (origin == "undefined")) {
            err = true;
            return err;
        }
        return (err);
    }

    validate_monetary_value(req) {
        console.log("Validating monetary value");
        var err = false;
        var monetary_value = req.session.data["monetary_value"] + "";
        var currency = req.session.data["currency"] + "";

        if (monetary_value == "") {
            err = true;
            return err;
        }
        if ((currency == "") || (currency == "undefined")) {
            err = true;
            return err;
        }
        return (err);
    }

    validate_unit_value(req) {
        console.log("Validating unit value");
        var err = false;
        var unit_value = req.session.data["unit_value"] + "";

        if (unit_value == "") {
            err = true;
            return err;
        }
        return (err);
    }

    validate_meursing(req) {
        console.log("Validating Meursing additional code");
        var err = false;
        var meursing_code = req.session.data["meursing_code"] + "";

        if (meursing_code.length != 3) {
            err = true;
            return err;
        } else {
            req.session.data["meursing_code"] = "7" + req.session.data["meursing_code"];
        }
        return (err);
    }
}

    
module.exports = Error_handler
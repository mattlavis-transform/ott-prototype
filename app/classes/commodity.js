const axios = require('axios')

const Measure = require("./measure");
const MeasureComponent = require("./measure_component");
const MeasureType = require("./measure_type");
const GeographicalArea = require("./geographical_area");
const AdditionalCode = require("./additional_code");
const Calculation = require("./calculation");
const OrderNumber = require("./order_number");
const Definition = require("./definition");
const LegalAct = require("./legal_act");
const DutyExpression = require("./duty_expression");

class Commodity {
    constructor(sid = null, goods_nomenclature_item_id = null, productline_suffix = null, description = null, number_indents = null, leaf = null, parent_sid = null, indent_class = null) {
        this.sid = sid;
        this.goods_nomenclature_item_id = goods_nomenclature_item_id;
        this.productline_suffix = productline_suffix;
        this.description = description;
        this.number_indents = number_indents;
        this.indent_class = "";
        this.leaf = leaf;
        this.parent_sid = parent_sid;
        this.indent_class = indent_class;
        this.supplementary_unit = null;
        this.measure_type_series_id = null;
        this.measures = [];
        this.has_meursing = false;
        this.country_name = "";
        this.phase = "";
        this.units = [];
        this.multiplier = 1;
        this.duty_expressions = [];

        this.quotas = [];
        this.mfns = [];
        this.vats = [];
        this.excises = [];
        this.preferences = [];
        this.remedies = [];
        this.suspensions = [];

        this.mfn_array = ["103", "105"];
        this.agri_array = ["488", "489", "490"];
        this.preference_array = ["142", "145", "106", "109"];
        this.remedy_array = ["551", "552", "553", "554", "555", "561", "562", "563", "564", "565", "566", "570", "695", "696"];
        this.suspension_array = ["112", "115", "117", "119"];
        this.quota_array = ["143", "146", "122", "123"];
        this.supplementary_unit_array = ["109", "110"];
        this.meursing_blob = null;

        if (this.goods_nomenclature_item_id != null) {
            this.formatted_commodity_code = this.goods_nomenclature_item_id
            this.format_commodity_code();
        }
    }

    get_data(json, country = null, date = null) {
        this.data = json["data"];
        this.included = json["included"];
        this.sid = this.data["id"];
        this.goods_nomenclature_item_id = this.data["attributes"]["goods_nomenclature_item_id"];
        this.description = this.data["attributes"]["formatted_description"];
        this.number_indents = this.data["attributes"]["number_indents"];
        this.basic_duty_rate_string = this.data["attributes"]["basic_duty_rate"];
        if (this.basic_duty_rate_string == null) {
            this.basic_duty_rate_string = "variable";
        }
        this.format_basic_duty_rate();

        this.formatted_commodity_code = this.goods_nomenclature_item_id;
        this.format_commodity_code();
    }

    get_measure_data(origin) {
        var m, mc, mt, g, ac, la, id, item2;

        /* START GOOD EXAMPLES

        7202118000 = Ferro-alloy (basic ad valorem)
        0201100021 = Bison - has units
        0406103010 = Mozzarella - has units
        8518400010 = Amplifiers - has a supplementary unit
        8708701080 = Tyres - has anti-dumping (China)
        1905319100 = Sandwich biscuits - has Meursing - Meursings are also weight-dependents
        0702000007 = Cherry tomatoes - has Entry Price System
        2710124900 = Light oil - Has excise in litres unit
        8406810000 = Turbines - Has suspensions
        2402100000 = Cheroots - VAT, excise and import duty
        1704903000 = White chocolate - ceiling, also has multiple VAT rates
        1704907100 = Boiled sweets (check Iceland) - the most complex measures
        2206001000 = Piquette (type of wine) - has a minimum; also the MFN contains 2 units as well as 3 types of excise
        
        END GOOD EXAMPLES */


        this.origin = origin;
        this.origin_obj = new GeographicalArea();
        this.country_name = this.origin_obj.get_country_description(origin);

        this.measures = [];
        this.measure_components = [];
        this.measure_types = [];
        this.geographical_areas = [];
        this.additional_codes = [];
        this.order_numbers = [];
        this.definitions = [];
        this.legal_acts = [];

        // Get all the measures + measure components
        this.included.forEach(item => {
            if (item["type"] == "measure") {
                id = item["id"];
                m = new Measure(id);
                m.origin = item["attributes"]["origin"];
                m.effective_start_date = item["attributes"]["effective_start_date"];
                m.effective_end_date = item["attributes"]["effective_end_date"];
                m.import = item["attributes"]["import"];
                m.excise = item["attributes"]["excise"];
                m.vat = item["attributes"]["vat"];
                m.measure_type_id = item["relationships"]["measure_type"]["data"]["id"];
                m.geographical_area_id = item["relationships"]["geographical_area"]["data"]["id"];

                // Get additional code
                if (item.hasOwnProperty("relationships")) {
                    item2 = item["relationships"];
                    if (item2.hasOwnProperty("additional_code")) {
                        m.additional_code_id = item["relationships"]["additional_code"]["data"]["id"];
                    }
                }

                // Get legal base / legal acts
                var legal_acts = item["relationships"]["legal_acts"]["data"];
                legal_acts.forEach(legal_act => {
                    m.legal_act_ids.push(legal_act["id"]);
                });

                // Get excluded_countries
                var excluded_countries = item["relationships"]["excluded_countries"]["data"];
                excluded_countries.forEach(excluded_country => {
                    m.excluded_country_ids.push(excluded_country["id"]);
                });

                // Get quota order number
                try {
                    m.order_number_id = item["relationships"]["order_number"]["data"]["id"];
                } catch (error) {
                    // Do nothing
                }

                if (m.import == true) {
                    this.measures.push(m);
                }

            } else if (item["type"] == "measure_component") {
                mc = new MeasureComponent(item);
                this.measure_components.push(mc);

            } else if (item["type"] == "measure_type") {
                mt = new MeasureType(item);
                this.measure_types.push(mt);

            } else if (item["type"] == "geographical_area") {
                g = new GeographicalArea(item);
                this.geographical_areas.push(g);

            } else if (item["type"] == "additional_code") {
                ac = new AdditionalCode(item);
                this.additional_codes.push(ac);

            } else if (item["type"] == "order_number") {
                ac = new OrderNumber(item);
                this.order_numbers.push(ac);

            } else if (item["type"] == "definition") {
                ac = new Definition(item);
                this.definitions.push(ac);

            } else if (item["type"] == "legal_act") {
                la = new LegalAct(item);
                this.legal_acts.push(la);

            } else if (item["type"] == "duty_expression") {
                var measure_id = item["id"].replace("-duty_expression", "");
                var base = item["attributes"]["base"];
                var formatted_base = item["attributes"]["formatted_base"];
                var obj = new DutyExpression(measure_id, base, formatted_base);
                this.duty_expressions.push(obj);
            }
        });

        this.assign_duty_expressions();
        this.assign_geographical_areas();
        this.assign_additional_codes();

        if (origin != "basic") {
            this.remove_irrelevant_measures();
        }
        this.assign_measure_components();
        this.get_units();
        this.get_measure_type_descriptions();
        this.get_measure_country_descriptions();
        this.categorise_measures();
        this.assign_definitions_to_order_numbers();
        this.assign_legal_acts_to_measures();
        this.assign_geographical_area_descriptions_to_exclusions();
        this.strip_exclusions_from_geographical_area()


        // console.log("Units: " + this.units);
        // console.log("VATs: " + this.vats);
        // console.log("Excises: " + this.excises);
        // console.log("MFNs: " + this.mfns);
        // console.log("Preferences: " + this.preferences);
        // console.log("Quotas: " + this.quotas);
        // console.log("Remedies: " + this.remedies);

        // this.quotas.forEach(quota => {
        //     console.log("Quota order number : " + quota.order_number);
        // });

        var valid_phases = ["results"];
        if (valid_phases.includes(this.phase)) {
            this.calculate_vat();
            this.calculate_excise();
            this.calculate_mfn();
            this.calculate_quotas();
            this.calculate_preferences();
        }
    }

    strip_exclusions_from_geographical_area() {
        this.measures.forEach(measure => {
            if (measure.geographical_area.geographical_area_code == 1) {
                var exclusions = measure.excluded_country_ids;
                var looper = 0;
                measure.geographical_area.members.forEach(ga => {
                    if (exclusions.includes(ga.id)) {
                        measure.geographical_area.members.splice(looper,  1);
                    }
                    looper += 1;
                });
            }
        });
    }

    get_measure_country_descriptions() {
        this.measures.forEach(measure => {
            this.geographical_areas.forEach(geographical_area => {
                if (geographical_area.id == measure.geographical_area_id) {
                    measure.geographical_area_description = geographical_area.description;
                    measure.geographical_area_code = geographical_area.geographical_area_code;
                    if (measure.geographical_area_description == "ERGA OMNES") {
                        measure.geographical_area_description = "All countries";
                    }
                }
            });
        });
    }

    get_measure_type_descriptions() {
        this.measures.forEach(measure => {
            this.measure_types.forEach(measure_type => {
                if (measure_type.id == measure.measure_type_id) {
                    measure.measure_type_description = measure_type.description;
                    measure.measure_type_series_id = measure_type.measure_type_series_id;
                }
            });
        });
    }

    assign_definitions_to_order_numbers() {
        this.definitions.forEach(definition => {
            this.order_numbers.forEach(order_number => {
                if (order_number.definition_id == definition.id) {
                    order_number.definition = definition;
                }
            });
        });
        this.measures.forEach(measure => {
            this.order_numbers.forEach(order_number => {
                if (order_number.id == measure.order_number_id) {
                    measure.order_number = order_number;
                }
            });
        });
    }

    assign_geographical_area_descriptions_to_exclusions() {
        this.geographical_areas.forEach(ga => {
            this.measures.forEach(measure => {
                measure.excluded_country_ids.forEach(excluded_country => {
                    if (excluded_country == ga.id) {
                        measure.excluded_countries.push(ga);
                    }
                });
            });
        });

        this.measures.forEach(measure => {
            measure.get_excluded_country_string();
        });
    }

    assign_legal_acts_to_measures() {
        this.legal_acts.forEach(legal_act => {
            this.measures.forEach(measure => {
                measure.legal_act_ids.forEach(legal_act_id => {
                    if (legal_act_id == legal_act.id) {
                        measure.legal_acts.push(legal_act);
                    }
                });
            });
        });
        this.measures.forEach(measure => {
            if (measure.legal_acts.length > 0) {
                measure.legal_base = measure.legal_acts[0].friendly;
            }
        });
    }

    calculate_vat() {
        this.vats.forEach(calc => {
            calc.calculate();
        });
    }

    calculate_excise() {
        this.excises.forEach(calc => {
            calc.calculate();
        });
    }

    calculate_mfn() {
        this.mfns.forEach(calc => {
            calc.calculate();
        });
    }

    calculate_quotas() {
        this.quotas.forEach(calc => {
            calc.calculate();
        });
    }

    calculate_preferences() {
        this.preferences.forEach(calc => {
            calc.calculate();
        });
    }

    // Assign the geographical area to the measure
    assign_geographical_areas() {
        this.measures.forEach(m => {
            this.geographical_areas.forEach(g => {
                if (m.geographical_area_id == g.id) {
                    m.geographical_area = g;
                }
            });
        });

    }

    // Assign duty expressions
    assign_duty_expressions() {
        this.measures.forEach(m => {
            this.duty_expressions.forEach(de => {
                if (m.id == de.measure_id) {
                    m.duty_expression = de;
                }
            });
        });

    }

    // Assign the additional code to the measure
    assign_additional_codes() {
        this.measures.forEach(m => {
            this.additional_codes.forEach(ac => {
                if (m.additional_code_id == ac.id) {
                    m.additional_code = ac;
                }
            });
        });

    }

    // Assign the measure components to the measures - also check for Meursing
    assign_measure_components() {
        this.measure_components.forEach(mc => {
            this.measures.forEach(m => {
                if (mc.measure_id == m.id) {
                    if (mc.is_meursing) {
                        m.has_meursing = true;
                        this.has_meursing = true;
                    }
                    m.measure_components.push(mc);
                }
            });
        });
        this.measures.forEach(m => {
            m.combine_duties();
        });
    }

    // Remove any measures that are not financial or are not relevant to my country
    remove_irrelevant_measures() {
        var i;
        this.measures.forEach(m => {
            this.measure_types.forEach(mt => {
                if (mt.id == m.measure_type_id) {
                    m.financial = mt.financial;
                    m.measure_type_series_id = mt.measure_type_series_id;
                }
            });
            if ((m.geographical_area_id == this.origin) || (m.geographical_area.members.includes(this.origin))) {
                m.relevant = true;
            }
        });

        for (i = this.measures.length - 1; i >= 0; --i) {
            if ((this.measures[i].financial == false) || (this.measures[i].relevant == false)) {
                this.measures.splice(i, 1);
            }
        }
    }

    // Work out the units
    get_units() {
        // Check all of the measures associated with this commodity / country context
        // and assign them to the "units" array
        this.measures.forEach(m => {
            if (!this.supplementary_unit_array.includes(m.measure_type_id)) {
                m.measure_components.forEach(mc => {
                    if (mc.measurement_unit_code != null) {
                        this.units.push(mc.measurement_unit_code);
                    }
                });
            }
        });
        // Compress the units using set functionality (Python)
        this.units = this.set(this.units);
        this.multiplier = 1;

        // If the goods use Meursing, then the unit must be kilogrammes, as that is how the Meursing
        // duties are assigned
        if (this.has_meursing) {
            this.units = ["KGM"];
            this.measurement_unit = "kilograms";
        } else {
            // Otherwise, look up the unit in the measurement units file
            // Bring back the unit to use (e.g. if it is DTN, use tonnes)
            this.measurement_unit = "";
            if (this.units.length == 1) {
                var measurement_units = require('./measurement_units.json');
                measurement_units.forEach(item => {
                    if (item["measurement_unit_code"] == this.units[0]) {
                        if (item.hasOwnProperty("unit_to_use")) {
                            this.measurement_unit = item["unit_to_use"];
                            this.multiplier = item["multiplier"];
                        } else {
                            this.measurement_unit = item["description"];
                        }
                        if (item.hasOwnProperty("warning")) {
                            this.warning = item["warning"] + " [" + this.measurement_unit + "]";
                        } else {
                            this.warning = "";
                        }
                        this.warning = "";
                    }
                });
            }
        }
        console.log(this.measurement_unit);
    }

    pass_request(req) {
        this.req_data = req.session.data;
        this.currency = this.get_req_data("currency")
        this.monetary_value = this.get_req_data("monetary_value")
        this.unit_value = this.get_req_data("unit_value")
        this.meursing_code = this.get_req_data("meursing_code")
        this.company = this.get_req_data("company")
    }

    get_req_data(prop) {
        if (this.req_data.hasOwnProperty(prop)) {
            return this.req_data[prop];
        } else {
            return null;
        }
    }

    xxx_get_meursing_blob() {
        //var url = "http://127.0.0.1:5000/meursing/" + this.meursing_code + "/JP";
        // var url = "http://127.0.0.1:5000/meursing/859/JP";
        // var response = await axios.get(url);
        // console.log(response.data);
        // this.meursing_blob = response.data;
        // axios.get(url)
        //     .then((response) => {
        //         this.meursing_blob = response.data;
        //         console.log("Getting response.data");
        //         console.log(response.data);
        //     });
    }

    get_meursing_blob = async () => {
        try {
            var url = "http://127.0.0.1:5000/meursing/859/JP";
            var response = await axios.get(url);
            this.meursing_blob = response.data;
            //console.log(response.data);
        } catch (err) {
            // Handle Error Here
            console.error(err);
        }
    };

    sort_measures() {
        console.log("Sorting measures");
        this.measures.sort(compare_blocks);
        this.measures.sort(compare_measure_types);
        this.measures.sort(compare_geo);
        this.measures.forEach(m => {
            if (m.order_number_id == "098633") {
                console.log("xx" + m.order_number_id);
                console.log(m);
            }

        });

        function compare_geo(a, b) {
            if (a.geographical_area.geographical_area_code < b.geographical_area.geographical_area_code) {
                return 1;
            }
            if (a.geographical_area.geographical_area_code > b.geographical_area.geographical_area_code) {
                return -1;
            }
            return 0;
        }

        function compare_measure_types(a, b) {
            if (a.measure_type_id < b.measure_type_id) {
                return -1;
            }
            if (a.measure_type_id > b.measure_type_id) {
                return 1;
            }
            return 0;
        }

        function compare_blocks(a, b) {
            if (a.sort_block.sort < b.sort_block.sort) {
                return -1;
            }
            if (a.sort_block.sort > b.sort_block.sort) {
                return 1;
            }
            return 0;
        }
    }


    // Categorise the measures
    categorise_measures() {
        console.log("Categorising measures");

        var display_block_options = {
            "vat_excise": {
                "block": "VAT and excise",
                "explainers": {
                    "title": "More information about VAT and excise",
                    "items": [
                        {
                            "measure_type": "VAT",
                            "description": "VAT is a national tax charged in addition to any other duties that apply. <a href='https://www.gov.uk/guidance/rates-of-vat-on-different-goods-and-services'>Please see guidance for when zero rate VAT applies</a>."
                        },
                        {
                            "measure_type": "Excise",
                            "description": "Lorem ipsum"
                        }
                    ]
                }
            },
            "tariffs_charges": {
                "block": "Tariffs and charges",
                "explainers": {
                    "title": "What are the main types of tariffs and charges",
                    "items": [
                        {
                            "measure_type": "Third country duty",
                            "description": "Lorem ipsum"
                        },
                        {
                            "measure_type": "Tariff preferences",
                            "description": "Lorem ipsum"
                        },
                        {
                            "measure_type": "Suspensions and reliefs",
                            "description": "Lorem ipsum"
                        },
                        {
                            "measure_type": "Customs Union duties",
                            "description": "Lorem ipsum"
                        }
                    ]
                },
                "link_text": "Click to <a href='/calculate/date/" + this.goods_nomenclature_item_id + "'>calculate import duties and taxes for importing commodity " + global.format_commodity_code(this.goods_nomenclature_item_id) + "</a>."
            },
            "quotas": {
                "block": "Quotas",
                "explainers": {
                    "title": "More information about quotas",
                    "items": [
                        {
                            "measure_type": "Quotas",
                            "description": "Lorem ipsum"
                        }
                    ]
                }
            },
            "other": {
                "block": "Import controls",
                "explainers": {
                    "title": "More information about import controls",
                    "items": [
                        {
                            "measure_type": "Import controls",
                            "description": "Import controls can be either prohibitions, where goods cannot be imported under any circumstances, or restrictions, where goods can be imported only under certain circumstances. Check the conditions related to this type of measure. "
                        }
                    ]
                }
            },
            "remedies": {
                "block": "Trade Remedies and safeguards",
                "explainers": {
                    "title": "More information about Trade Remedies and safeguards",
                    "items": [
                        {
                            "measure_type": "Anti-dumping",
                            "description": "Lorem ipsum"
                        },
                        {
                            "measure_type": "Anti-subsidy",
                            "description": "Lorem ipsum"
                        },
                        {
                            "measure_type": "Safeguards",
                            "description": "Lorem ipsum"
                        }
                    ]
                }
            }
        }

        var display_sort_options = {
            "vat": {
                "sort": "00_vat",
                "block": "vat_excise"
            },
            "excise": {
                "sort": "01_excise",
                "block": "vat_excise"
            },
            "mfns": {
                "sort": "02_mfns",
                "block": "tariffs_charges"
            },
            "agri": {
                "sort": "03_agri",
                "block": "tariffs_charges"
            },
            "preferences": {
                "sort": "03_preferences",
                "block": "tariffs_charges"
            },
            "suspensions": {
                "sort": "04_suspensions",
                "block": "tariffs_charges"
            },
            "quotas": {
                "sort": "05_quotas",
                "block": "quotas"
            },
            "other": {
                "sort": "06_other",
                "block": "other"
            },
            "remedies": {
                "sort": "99_remedies",
                "block": "remedies"
            }
        }

        this.display_blocks = [];
        var block = "";
        this.measures.forEach(m => {
            if (this.mfn_array.includes(m.measure_type_id)) {
                block = "mfns"
                m.sort_block = display_sort_options[block]
                m.display_block = display_block_options[m.sort_block.block]

                if (!this.display_blocks.includes(m.display_block)) {
                    this.display_blocks.push(m.display_block);
                }
                this.mfns.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.multiplier, this.meursing_code, this.company, this.meursing_blob));

            } else if (this.agri_array.includes(m.measure_type_id)) {
                block = "agri"
                m.sort_block = display_sort_options[block]
                m.display_block = display_block_options[m.sort_block.block]

                if (!this.display_blocks.includes(m.display_block)) {
                    this.display_blocks.push(m.display_block);
                }
                //this.mfns.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.multiplier, this.meursing_code, this.company, this.meursing_blob));

            } else if (this.preference_array.includes(m.measure_type_id)) {
                block = "preferences"
                m.sort_block = display_sort_options[block]
                m.display_block = display_block_options[m.sort_block.block]

                if (!this.display_blocks.includes(m.display_block)) {
                    this.display_blocks.push(m.display_block);
                }

                this.preferences.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.multiplier, this.meursing_code, this.company, this.meursing_blob));

            } else if (this.remedy_array.includes(m.measure_type_id)) {
                block = "remedies"
                m.sort_block = display_sort_options[block]
                m.display_block = display_block_options[m.sort_block.block]

                if (!this.display_blocks.includes(m.display_block)) {
                    this.display_blocks.push(m.display_block);
                }

                this.remedies.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.multiplier, this.meursing_code, this.company, this.meursing_blob));

            } else if (this.suspension_array.includes(m.measure_type_id)) {
                block = "suspensions"
                m.sort_block = display_sort_options[block]
                m.display_block = display_block_options[m.sort_block.block]

                if (!this.display_blocks.includes(m.display_block)) {
                    this.display_blocks.push(m.display_block);
                }

                this.suspensions.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.multiplier, this.meursing_code, this.company, this.meursing_blob));

            } else if (this.quota_array.includes(m.measure_type_id)) {
                block = "quotas"
                m.sort_block = display_sort_options[block]
                m.display_block = display_block_options[m.sort_block.block]

                if (!this.display_blocks.includes(m.display_block)) {
                    this.display_blocks.push(m.display_block);
                }

                var obj = new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.multiplier, this.meursing_code, this.company, this.meursing_blob);
                this.quotas.push(obj);

            } else if (m.measure_type_series_id == "P") {
                block = "vat"
                m.sort_block = display_sort_options[block]
                m.display_block = display_block_options[m.sort_block.block]

                if (!this.display_blocks.includes(m.display_block)) {
                    this.display_blocks.push(m.display_block);
                }

                this.vats.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.multiplier, this.meursing_code, this.company, this.meursing_blob));

            } else if (m.measure_type_series_id == "Q") {
                block = "excise"
                m.sort_block = display_sort_options[block]
                m.display_block = display_block_options[m.sort_block.block]

                if (!this.display_blocks.includes(m.display_block)) {
                    this.display_blocks.push(m.display_block);
                }

                this.excises.push(new Calculation(m, this.currency, this.monetary_value, this.unit_value, this.multiplier, this.meursing_code, this.company, this.meursing_blob));

            } else {
                block = "other"
                m.sort_block = display_sort_options[block]
                m.display_block = display_block_options[m.sort_block.block]

                if (!this.display_blocks.includes(m.display_block)) {
                    this.display_blocks.push(m.display_block);
                }

            }
        });
    }

    format_basic_duty_rate() {
        var s;
        s = this.basic_duty_rate_string;
        s = s.replace("</span>", "");
        s = s.replace(/\<span[^\>]+\>/g, "");
        this.basic_duty_rate = s;
    }

    format_commodity_code() {
        if (this.leaf != true) {
            if (this.formatted_commodity_code.substr(6, 4) == "0000") {
                this.formatted_commodity_code = this.formatted_commodity_code.substr(0, 6);
            }
            else if (this.formatted_commodity_code.substr(8, 2) == "00") {
                this.formatted_commodity_code = this.formatted_commodity_code.substr(0, 8);
            }
        }
    }


    set(arr) {
        return arr.reduce(function (a, val) {
            if (a.indexOf(val) === -1) {
                a.push(val);
            }
            return a;
        }, []);
    }

    get_exchange_rate() {
        axios.get('https://api.exchangeratesapi.io/latest')
            .then((response) => {
                //console.log(response.data);
            });
    }

}
module.exports = Commodity
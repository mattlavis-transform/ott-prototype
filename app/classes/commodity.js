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
        this.vat = null;
        this.mfn = null;
        this.supplementary_unit = null;
        this.measures = [];

        if (this.goods_nomenclature_item_id != null) {
            this.formatted_commodity_code = this.goods_nomenclature_item_id
            this.format_commodity_code();
        }
    }

    get_data(json, country = null, date = null) {
        this.data = json["data"];
        this.included = json["included"];
        this.sid = this.data["id"]
        this.goods_nomenclature_item_id = this.data["attributes"]["goods_nomenclature_item_id"]
        this.description = this.data["attributes"]["formatted_description"]
        this.number_indents = this.data["attributes"]["number_indents"]

        this.formatted_commodity_code = this.goods_nomenclature_item_id
        this.format_commodity_code();
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
}
module.exports = Commodity
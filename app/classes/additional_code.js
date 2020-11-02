class AdditionalCode {
    constructor(item) {
        this.id = item["id"];
        this.code = item["attributes"]["code"];
        this.description = item["attributes"]["formatted_description"];
    }

}
module.exports = AdditionalCode
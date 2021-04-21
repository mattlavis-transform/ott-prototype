class ImportedContext {
    constructor() {
        var a = 1;
    }

    get_origin_description() {
        const path = require('path');
        const fs = require('fs');
        var jp = require('jsonpath');

        const filename = path.join(__dirname, '../assets/data/geographical_areas.json');
        //filename = "";
        var data = fs.readFileSync(filename, 'utf8');
        data = JSON.parse(data);
        var query_string = '$.data[?(@.id == "' + this.origin + '")]'
        var result = jp.query(data, query_string);
        //console.log(result);
        this.origin_description = result[0].attributes.description;
    }
}

module.exports = ImportedContext
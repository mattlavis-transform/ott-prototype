class GeographicalArea {
    constructor(item = null) {
        if (item != null) {
            this.id = item["id"];
            this.description = item["attributes"]["description"];
            this.children_geographical_areas = [];
            this.members = [];

            if (item.hasOwnProperty("relationships")) {
                var item2 = item["relationships"];
                if (item2.hasOwnProperty("children_geographical_areas")) {
                    this.children_geographical_areas = item["relationships"]["children_geographical_areas"]["data"];
                    this.has_members = true;
                    this.parse_members();
                }
            }
            this.country_name = this.get_country_description(this.id);
        } else {
            this.id = null;
            this.description = null;
            this.children_geographical_areas = [];
            this.members = [];
            this.country_name = null;
        }
    }

    get_country_description(id) {
        var country_name;
        var countries = require('./countries.json');
        countries.forEach(item => {
           if (item["geographical_area_id"] == id) {
               country_name = item["description"];
           }
        });
        return(country_name);
        
    }

    parse_members() {
        if (this.has_members) {
            this.children_geographical_areas.forEach(cga => {
                this.members.push(cga.id);
            });
        }
        this.children_geographical_areas = null;
    }

}
module.exports = GeographicalArea
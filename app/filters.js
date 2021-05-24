var nomar = require("nomar");
var showdown = require('showdown');
var _ = require('underscore');

module.exports = function (env) {

    /**
     * Instantiate object used to store the methods registered as a
     * 'filter' (of the same name) within nunjucks. You can override
     * gov.uk core filters by creating filter methods of the same name.
     * @type {Object}
     */
    var filters = {}

    /* ------------------------------------------------------------------
      add your methods to the filters obj below this comment block:
      @example:
  
      filters.sayHi = function(name) {
          return 'Hi ' + name + '!'
      }
  
      Which in your templates would be used as:
  
      {{ 'Paul' | sayHi }} => 'Hi Paul'
  
      Notice the first argument of your filters method is whatever
      gets 'piped' via '|' to the filter.
  
      Filters can take additional arguments, for example:
  
      filters.sayHi = function(name,tone) {
        return (tone == 'formal' ? 'Greetings' : 'Hi') + ' ' + name + '!'
      }
  
      Which would be used like this:
  
      {{ 'Joel' | sayHi('formal') }} => 'Greetings Joel!'
      {{ 'Gemma' | sayHi }} => 'Hi Gemma!'
  
      For more on filters and how to write them see the Nunjucks
      documentation.
  
    ------------------------------------------------------------------ */

    filters.lowerFirst = function (str) {
        var _ = require('lodash');
        str = _.lowerFirst(str);
        return (str);
    }

    filters.capitalise = function (str) {
        var _ = require('lodash');
        str = _.capitalize(str);
        return (str);
    }

    filters.title_case = function (str) {
        var _ = require('lodash');
        str = _.capitalize(_.toLower(str));
        str = str.replace("uk", "UK");
        str = str.replace("union", "Union");
        str = str.replace("Vat", "VAT");
        str = str.replace("Hmi", "HMI");
        return (str);
    }

    filters.title_case_vat_excise = function (str) {
        var _ = require('lodash');
        var tmp = _.toLower(str);
        if (tmp.indexOf("excise") > -1) {
            str = _.capitalize(_.toLower(str));
            str = str.replace("uk", "UK");
            str = str.replace("union", "Union");
            str = str.replace("Vat", "VAT");
            str = str.replace("Hmi", "HMI");
        }
        return (str);
    }

    filters.display_currency = function (str) {
        var euros = ["EUR", "EUROS", "EURO"];
        if (euros.includes(str)) {
            return "€";
        } else {
            return "£";
        }
    }

    filters.plural = function (str) {
        var pluralize = require('pluralize');
        var s = pluralize(str);
        return s;
    }

    filters.format_number = function (str, dec_places) {
        var s = format_number(str, dec_places);
        return s;
    }

    filters.format_date = function (str, fmt) {
        var s = format_date(str, fmt);
        return s;
    }

    filters.decimals = function (str, cnt) {
        var i = parseFloat(str)
        var n = i.toFixed(cnt).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        return n;
    }


    filters.substring = function (str, start, lngth) {
        if (typeof str !== 'undefined') {
            return str.substr(start, lngth);
        } else {
            return "";
        }
    }

    filters.format_commodity_code = function (str, separator = " ") {
        if (typeof str !== 'undefined') {
            s = str.substr(0, 4) + separator;
            s += str.substr(4, 2) + separator;
            s += str.substr(6, 2) + separator;
            s += str.substr(8, 2);
            return s;
        } else {
            return "";
        }
    }

    filters.format_order_number = function (str, separator = ".") {
        if (typeof str !== 'undefined') {
            s = str.substr(0, 2) + separator;
            s += str.substr(2, 4);
            return s;
        } else {
            return "";
        }
    }

    filters.roman = function (str) {
        if (typeof str !== 'undefined') {
            return nomar(parseInt(str));
        } else {
            return "";
        }
    }

    filters.showdown = function (str) {
        if (typeof str !== 'undefined') {
            converter = new showdown.Converter();
            converter.setOption("backslashEscapesHTMLTags", true)
            markdown_text = converter.makeHtml(str);
            markdown_text = markdown_text.replace("&lt;", "<");
            markdown_text = markdown_text.replace("&gt;", ">");
            return markdown_text;
        } else {
            return "";
        }
    }

    filters.new_scope = function (s, scope) {
        s = String(s)
        var lastChar = s[s.length - 1];

        if (s != "") {
            if (s.slice(-1) != "/") {
                s += "/";
            }
        }
        if (s.indexOf("{{ scopeId }}") > -1) {
            s = s.replace("{{ scopeId }}", scope);
        } else {
            s = s + scope;
        }
        s = s.replace("//", "/");
        return (s);
    }

    filters.filter_erga_omnes = function (s) {
        if (s == "ERGA OMNES") {
            return ("All countries");
        } else {
            return (s);
        }
    }

    filters.add_comm_code_href = function (s) {
        s = s.replace(/<h1/g, "<h1 class='govuk-heading-l'");
        
        var regex = /([0-9]{10})/g;
        var repl = "<a href='/commodities/$1'>$1</a>";
        s = s.replace(regex, repl);
        return (s);
    }

    filters.url_safe = function (s) {
        s = s.toLowerCase().replace(/ /g, "_");
        return (s);
    }


    /* ------------------------------------------------------------------
      keep the following line to return your filters to the app
    ------------------------------------------------------------------ */
    return filters
}

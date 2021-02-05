var MarkdownIt = require('markdown-it');

class Story {
    constructor(file) {
        const path = require('path');
        var fs = require('fs');
        const directoryPath = path.join(__dirname, 'news');
        const { DateTime } = require("luxon");
        var dt = DateTime.local(2017, 5, 15, 8, 30);
        //console.log(dt);

        this.file = file;
        this.date = file.replace(".md", "");
        this.date_formatted = DateTime.fromISO(this.date).toFormat("d MMM yyyy");
        var filename = path.join(directoryPath, this.file);
        //console.log(filename);

        fs = require('fs')
        // var data = "";
        // fs.readFile(filename, 'utf8', function (err, data) {
        //   if (err) {
        //     return console.log(err);
        //   }
        // });

        var data = fs.readFileSync(filename,'utf8');
        var md = new MarkdownIt();
        this.html = md.render(data);
        this.govify();
    };

    govify() {
      this.html = this.html.replace("<h1", "<h1 class='govuk-heading-s govuk-!-margin-bottom-1'")
    }
}
module.exports = Story

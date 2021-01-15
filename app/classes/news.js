const Story = require('./story');
var MarkdownIt = require('markdown-it');

global.get_news = function (str, cnt) {
    const path = require('path');
    const fs = require('fs');
    const directoryPath = path.join(__dirname, 'news');
    var stories = [];

    stories.push(new Story("2021-01-01.md"));
    stories.push(new Story("2021-01-02.md"));

    return(stories);
}


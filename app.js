const superagent = require('superagent');
const cheerio = require('cheerio');

const webUrl = "http://www.ygdy8.net/html/gndy/dyzz/index.html";

superagent.get(webUrl).end(function (err, res) {
    if(err){
        console.log(err)
    }
    let $ = cheerio.load(res.text, {decodeEntities: false});
    $(".ulink").each((i,ele) => {
        let $ele = $(ele);
        console.log($ele.text())
    });
});

const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const cheerio = require('cheerio');
const fs = require('fs');

const webUrl = "";
const baseUrl = "";
let relatUrl = "";
let title = "";

superagent
    .get(webUrl)
    .charset('gbk')
    .then(res => {
        let $ = cheerio.load(res.text, {decodeEntities: false});
        let list = $(".excerpt h2>a");
        let imgList = new Array();
        list.each((i, ele) => {
            imgList.push(ele.attribs)
        });
        return imgList;
    }).then(list => {
        relatUrl = baseUrl + list[3].href;
        console.log(relatUrl)
        return nextPage(relatUrl);
    }).then(srcs => {
        download(srcs, title);
    })
    .catch(err =>{
        console.log(err);
    });

const download = (urls, title) =>  {
    const folder = `${title}`;
    !fs.existsSync("album") && fs.mkdirSync("album");
    console.log(`正在下载${title}`);
    Promise.all(urls.map(
        url => superagent.get(url)
    )).then(res => {
        !fs.existsSync(`album/${folder}`) && fs.mkdirSync(`album/${folder}`);
        return Promise.all(res.map((img, i) => {
            return new Promise((resolve, reject) => {
                fs.writeFile(`./album/${folder}/${i}.jpg`, img.body, err => {
                    err ? reject(err) : resolve();
                });
            })           
        }))
    }).then(() => {
        console.log(`下载完成${title}`);
    }).catch(err => {

    })
}

let count = 0;
const nextPage = (url) => {
    return superagent.get(url).charset('gbk')
        .then((html) => {
            let $ = cheerio.load(html.text, {decodeEntities: false});
            title = $(".article-title").text();            
            console.log(count++);
            let len = $(".next-page").length;
            if(len < 1) {
                return [];
            }
            let nextUrl = "";
            len == 1 && (nextUrl = (function(){
                let nextUrl = $(".next-page a")[0].attribs.href;
                realUrl = relatUrl.split("/");
                realUrl.length = realUrl.length - 1;
                realUrl = realUrl.join("/");
                return realUrl + "/" + nextUrl;
            })());  
            let imgs = $(".article-content img");
            let srcs = new Array();
            imgs.each((i, img) => {
                srcs.push(img.attribs.src);
            })
            return nextPage(nextUrl).then((res) => {
                return [].concat(srcs, res);
            })
        })
}


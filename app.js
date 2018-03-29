const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const cheerio = require('cheerio');
const fs = require('fs');

const webUrl = "";
const baseUrl = "";
let relatUrl = "";

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
        relatUrl = baseUrl + list[0].href;
        return superagent.get(relatUrl).charset('gbk')
    }).then(html => {
        let $ = cheerio.load(html.text, {decodeEntities: false});
        let imgs = $(".article-content img");
        let title = $(".article-title").text();
        let srcs = new Array();
        imgs.each((i, img) => {
            srcs.push(img.attribs.src)
        })
        return {srcs,title};
    }).then(album => {
        download(album.srcs, album.title);
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

const nextPage = (html) => {
    let $ = cheerio.load(html.text, {decodeEntities: false});
    let len = $(".next-page").length;
    let imgs = $(".article-content img");
    let title = $(".article-title").text();
    let srcs = new Array();
    imgs.each((i, img) => {
        srcs.push(img.attribs.src)
    })
    len ==1 && srcs.concat((function(){
        let nextUrl = $(".next-page a").attribs.href;
        let realUrl = relatUrl.split("/");
        realUrl.length = realUrl.length - 1;

    })()); 
}


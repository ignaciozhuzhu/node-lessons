// 引入依赖
var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');

// 建立 express 实例
var app = express();
app.get('/', function(req, res, next) {
  var arr = [];
  // 用 superagent 去抓取 https://cnodejs.org/ 的内容
  superagent.get('https://cnodejs.org/')
    .end(function(err, sres) {
      // 常规的错误处理
      if (err) {
        return next(err);
      }
      // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
      // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
      // 剩下就都是 jquery 的内容了
      var $ = cheerio.load(sres.text);
      var items = [];
      var count = 0;
      $('#topic_list .topic_title').each(function(idx, element) {
        var $element = $(element);
        var href = $element.attr('href');
        arr.push(href)
        items.push({
          title: $element.attr('title'),
          href: href,
        });

        function setAuthor() {
          superagent.get('https://cnodejs.org' + href)
            .end(function(err, sres) { // 常规的错误处理
              if (err) {
                // return next(err);
              }
              var $ = cheerio.load(sres.text);
              var author = $('.user_name .dark').text();
              if (author == "") setAuthor(); //异步可能会抗不过来,取不到数据,如果碰到这种情况,就再次执行
              else {
                count++;
                for (var i = 0; i < items.length; i++) {
                  if (items[i].href == href)
                    items[i].author = author;
                }
                if (count == items.length) {
                  res.end(JSON.stringify(items, null, 2));
                }
              }
            })
        }
        setAuthor();
      });
    });

});

app.listen(3000, function(req, res) {
  console.log('app is running at port 3000');
});
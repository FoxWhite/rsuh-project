var express   = require('express'),
    request   = require('request'),
    cheerio   = require('cheerio'),
    async     = require('async'),
    urlModule = require('url');

var app       = express();
// app.get('/', function(req, res){
//     //---main
// })

// app.set('view engine', 'jade');
// app.set('port', 3000);

// var server = app.listen(3000, function() {
//     console.log('listening on port 3000');
// })


var startUrl = 'http://belov.zz.mu/'; //'http://isdwiki.rsuh.ru/'; //
var queue = [],
    parsed = [];

function mainLoop(url){

    console.log('======');
    console.log(queue, 'q');
    console.log(parsed, 'p');
    console.log(parsed.length +' pages parsed, ' + queue.length + ' more to go');

    request(url, function(error, response, html){
        console.log('got page '+ url);
        if(!error && response.statusCode == 200){ // main iteration magic here
            var $ = cheerio.load(html),
                title = $("title").text(), 
                hrefs = [],
                hrefsWithCounts = {};

            //scanning for links, adding to local hrefs[]    
            $('a').each(function(i, elem){
                var href = $(this).attr('href') || '';
                var label = $(this).text();

                if (href.length > 0) {
                    if (!isExternal(href) && urlConditions(href))
                        hrefs.push(urlModule.resolve(startUrl,href));
                }
            });

            // managing duplicates. return hrefsWithCounts as json like{'url': duplicatesNum}
            for (var i = 0, len = hrefs.length; i < len; i++){
                var val = hrefs[i];
                (!hrefsWithCounts.hasOwnProperty(val)) ? hrefsWithCounts[val] = 1 : hrefsWithCounts[val] += 1;
            }

            // adding to queue
            for (var i in hrefsWithCounts){
                if ((parsed.indexOf(i) < 0) && (queue.indexOf(i) < 0)) {
                    
                    queue.push(i);
                    // TODO добавить связь в граф
                }
                else {
                    // TODO все равно добавить связь в граф
                }
            }
            console.log('parsed: '+ this.href);
            if (this.href != url) { // happens when linked page is redirected
                console.log('page redirects to ' + this.href);
                if (!isExternal(this.href) && urlConditions(this.href)) {queue.push(this.href); }
                parsed.push(url);
            }
            else{
                parsed.push(url);
            }
            //updating queue
            queue = queue.filter( function( el ) {
                return parsed.indexOf( el ) < 0;
            });
            //processing queue
            if (queue[0]) {
                mainLoop(queue[0]);   
            }     
        }
        else if (response.statusCode != 200) {
            console.log('=========ERROR LOADING PAGE. CODE' + response.statusCode);
            parsed.push(this.href);
            mainLoop(queue[0]);  
        }
        else{
            console.log(error.message);
        }
    })
};
mainLoop(startUrl);

//-------------external link checking
var checkDomain = function(url) {
  if ( url.indexOf('//') === 0 ) { url = location.protocol + url; }
  return url.toLowerCase().replace(/([a-z])?:\/\//,'$1').split('/')[0];
};
var isExternal = function(url) {
  return ( ( url.indexOf(':') > -1 || url.indexOf('//') > -1 ) && checkDomain(startUrl) !== checkDomain(url) );
};
//----------------------------------==
var urlConditions = function(url){
    if (/#/.test(url)){
        return false;
    }
    else{
        return true;
    }
}

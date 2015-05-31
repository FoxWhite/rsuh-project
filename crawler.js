var request   = require('request'),
    cheerio   = require('cheerio'),
    urlModule = require('url');

var db = "";

var startUrl = ""; //'http://belov.zz.mu/'; //'http://isdwiki.rsuh.ru/'; //
var queue = [],
    parsed = [],
    maxPages = 7000;

function mainLoop(url){
    

    console.log('======');
    // console.log(queue, 'q');
    // console.log(parsed, 'p');
    console.log(parsed.length +' pages parsed, ~' + queue.length + ' more to go');

    request(url, function(error, response, html){
        if(!error && response.statusCode === 200 && maxPages > 0){ // main iteration magic here
            console.log('page received: '+ url +' \n('+ response.headers['content-type']+')');
            var $ = cheerio.load(html),
                title = $("title").text(), 
                hrefs = [],
                hrefsWithCounts = {};

            if (this.href != url && this.href != (url + '/')) { // happens when linked page is redirected. Url = link, this.href = actual address
                console.log('page redirects to ' + this.href);
                parsed.push(url);
                if (isExternal(this.href) || !urlConditions(this.href)){
                    queueUpdate();
                    maxPages -= 1;
                    mainLoop(queue[0]); 
                    return;
                }
            }
            
            //scanning for links, adding to local hrefs[]    
            $('a').each(function(i, elem){
                var href = $(this).attr('href') || '';
                var label = $(this).text();

                if (href.length > 0) {
                    if (!isExternal(href) && urlConditions(href))
                        hrefs.push([urlModule.resolve(startUrl,href), label]);
                }
            });

            // managing duplicates. return hrefsWithCounts as json like{'url': duplicatesNum}
            for (var i = 0, len = hrefs.length; i < len; i++){
                var hrf = hrefs[i][0],
                    hrf_label = hrefs[i][1];

                if (!hrefsWithCounts.hasOwnProperty(hrf)) { 
                    hrefsWithCounts[hrf] = {}; 
                    hrefsWithCounts[hrf][hrf_label] = 1 ;
                }
                else if (!hrefsWithCounts[hrf].hasOwnProperty(hrf_label)){ 
                    hrefsWithCounts[hrf][hrf_label] = 1;
                }
                else {
                    hrefsWithCounts[hrf][hrf_label] += 1;
                }
            }
            // adding to queue
            for (var i in hrefsWithCounts){
                if ((parsed.indexOf(i) < 0) && (queue.indexOf(i) < 0)) {
                    queue.push(i);
                    db.addRef(i); //add all current page links to 'refs'
                }
            }


            parsed.push(this.href);            
        
            console.log('just parsed: ', this.href);
            db.addPageInfo(this.href, hrefsWithCounts, title);
            //updating queue
            queueUpdate();
            //processing queue
            if (queue[0]) {
                maxPages -= 1;
                mainLoop(queue[0]);   
            }
            else {
                console.log('finished.');
                // db.connection.end();
                // console.log(db.visData());
                return;
            }     
        }
        else if(error){
            throw error;
        }
        else if (response.statusCode != 200) {
            console.log('=========ERROR LOADING PAGE. CODE' + response.statusCode);
            parsed.push(url);
            queueUpdate();
            maxPages -= 1;
            mainLoop(queue[0]); 
        }

    });

    function queueUpdate(){
        queue = queue.filter( function( el ) {
            return parsed.indexOf( el ) < 0;
        });          
    }
}

//-------------external link checking
var checkDomain = function(url) {
  if ( url.indexOf('//') === 0 ) { url = 'http:' + url; }
  return url.toLowerCase().replace(/([a-z])?:\/\//,'$1').split('/')[0];
};
var isExternal = function(url) {
  return ( ( url.indexOf(':') > -1 || url.indexOf('//') > -1 ) && checkDomain(startUrl) !== checkDomain(url) );
};
//----------------------------------==
var urlConditions = function(url){
    if ((/#/.test(url)) || (/\.(jpg|png|ico|gif|svg|pdf|doc|docx|zip|rar)$/i.test(url))){
        return false;
    }
    return true;
};


module.exports.mainLoop = function(url, dbHandler) {
    startUrl = url;
    db = dbHandler;
    // db.init(); // temp! used with empty db
    db.addRef(startUrl);
    return mainLoop(url);
};

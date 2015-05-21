var express     = require('express'),
    crawler     = require('./crawler');

var app = express();
var startUrl = 'http://belov.zz.mu/'; //'http://isdwiki.rsuh.ru/'; //

app.get('/', function(req, res){
    //---main
    crawler.mainLoop(startUrl);


})

app.set('view engine', 'jade');
app.set('port', 3000);

var server = app.listen(3000, function() {
    console.log('listening on port 3000');
})


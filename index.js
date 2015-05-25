var express     = require('express'),
    crawler     = require('./crawler'),
    dbHandler   = require('./dbHandler');

var app = express();
var startUrl = 'http://belov.zz.mu/'; //'http://isdwiki.rsuh.ru/'; // 'http://rsuh.ru/' ;//
var db = new dbHandler('rsuh-project');

app.get('/', function(req, res){
    //---main
    db.connect();
    crawler.mainLoop(startUrl, db);


});

app.set('view engine', 'jade');
app.set('port', 3000);

var server = app.listen(3000, function() {
    console.log('listening on port 3000');
});


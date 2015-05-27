var express        = require('express'),

    crawler     = require('./crawler'),
    dbHandler   = require('./dbHandler');

var app = express();
var startUrl = 'http://belov.zz.mu/'; //'http://isdwiki.rsuh.ru/'; // 'http://rsuh.ru/' ;//
var db = new dbHandler('rsuh-project');

app.use(express.static('views'));

app.get('/', function(req, res){
    //---main
    res.render('default', {title : 'Belov diploma || prototype'});
    // db.connect();
    // crawler.mainLoop(startUrl, db);


});

app.get('/parsing', function(req, res){
    db.connect();
    // db.on('dbConnected', function(){
    //     res.send('DB Connected...');
    // });
    res.send('Parsing...');
    crawler.mainLoop(startUrl, db);
    
});
app.get('/graph', function(req, res){
    
    db.visData(function(visErr, visResult){
        if (visErr) throw visErr;
        res.send(visResult);

    });
});

app.set('view engine', 'jade');
app.set('port', 3000);

var server = app.listen(3000, function() {
    console.log('listening on port 3000');
});


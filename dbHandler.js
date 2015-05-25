var mysql   = require('mysql'),
    path    = require('path');

var DBHandler = function(db){
    var self = this;
    self.connection = false;
    this.dbToConnect = db;

    this.connect = function(){
        this.connection = mysql.createConnection({
         host     : 'localhost',
         user     : 'root',
         password : 'password',
         database : this.dbToConnect
        });
    
        this.connection.connect(function(err){
         if(!err) {
             console.log("Database is connected ... \n\n");  
         } 
         else {
             console.log("Error connecting database ... \n\n");  
         }
        });    
    };

    this.addRef = function (url, type) {
        var toInsert = {RefURL: url, Parsed: 0, RefError: 0, RefTypeID: type||1};
        this.connection.query('INSERT INTO refs SET ?', toInsert, function(err, result) {
          if (err) throw err;
        });
    };

    this.addPageInfo = function(url, title) {
        //withdrawing refId by page url:
        var refId = self.connection.query('SELECT RefID FROM refs WHERE RefURL = ?', url, function(err, result){
            if (err) throw err;

            refId = result[0].RefID;

            //adding page title to reftitle
            self.connection.query("INSERT INTO reftitle SET ?", {'RefTitleID': refId, 'Title' :title}, function(err, result) {
                if (err) throw err;
            });

        });
    };


module.exports = DBHandler;
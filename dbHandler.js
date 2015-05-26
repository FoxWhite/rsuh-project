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
    this.init = function(){
        this.connection.query('INSERT INTO reftypes SET ?', {RefTypeID : 1, RefType: 'text/html'}, function(err, result) {
          if (err) throw err;
        });      
    };

    this.addRef = function (url, type) {
        var toInsert = {RefURL: url, Parsed: 0, RefError: 0, RefTypeID: type||1};
        this.connection.query('INSERT INTO refs SET ?', toInsert, function(err, result) {
          if (err) throw err;
        });
    };

    this.addPageInfo = function(url, hrefs, title) {
        //withdrawing refId by page url:
        var refId = self.connection.query('SELECT RefID FROM refs WHERE RefURL = ?', url, function(err, result){
            if (err) throw err;

            refId = result[0].RefID;
            //adding page title to reftitle
            self.connection.query("INSERT INTO reftitle SET ? ON DUPLICATE KEY UPDATE ?", [{'RefTitleID': refId, 'Title' :title}, {'Title' :title}], function(err, result) {
                if (err) throw err;
            });
            //adding links
            self.addLinks(refId, hrefs);

        });
    };

    this.addLinks = function(refId, hrefs){
        for(var i in hrefs){
            getIdByUrl(i);
        }

        function getIdByUrl(i){
            self.connection.query('SELECT RefID FROM refs WHERE RefURL = ?', i, function(err, result){
                if (err) throw err;
                refgraphInsert(result[0].RefID, i );
            });   
        }

        function refgraphInsert(idTo, i){
            self.connection.query('INSERT INTO refgraph SET ?', {'RefLinkedByID' : refId, 'RefLinksToID': idTo}, function(err, result) {
                if (err) throw err;

                var refGrId = result.insertId;
                
                for (var j in hrefs[i]){
                     manageLabels(i, j, refGrId);                 
                }
            });      
        }
        
        function manageLabels(i, j, refGrId){
            self.connection.query('INSERT INTO labels SET ?', {'Label' : j}, function(err, result) {
                if (err) throw err;

                var labelId = result.insertId;

                self.connection.query('INSERT INTO refgrlabels SET ?', {'RefGrID' : refGrId, 'LabelID': labelId, 'Count' : hrefs[i][j]}, function(err, result) {
                    if (err) throw err;
                });                         
            });              
        }
    };
    // this.deleteAll = function(){
    //     this.connection.query("DROP DATABASE `rsuh-project`", function(err, result) {
    //             if (err) throw err;
    //             console.log('database dropped');
    //     });
    //     this.connection.query("CREATE DATABASE `rsuh-project`", function(err, result) {
    //             if (err) throw err;
    //             console.log('database re-created');

    //     });
    //     this.connection.query('INSERT INTO reftypes SET ?', {RefTypeID : 1, RefType: 'text/html'}, function(err, result) {
    //       if (err) throw err;
    //     });
    // }

}
module.exports = DBHandler;
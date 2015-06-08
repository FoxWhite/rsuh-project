var mysql    = require('mysql'),
    async    = require('async'),
    path     = require('path'),
    EventEmitter = require("events").EventEmitter,
    util         = require("util");


var DBHandler = function(db){
    EventEmitter.call(this);
    util.inherits(DBHandler, EventEmitter);

    var self = this;
    self.pool = false;
    self.urlToId = {}; // {url : refId} cached
    this.dbToConnect = db;
    
   
    this.connect = function(){
        self.pool = mysql.createPool({
         host     : 'localhost',
         user     : 'root',
         password : 'password',
         database : this.dbToConnect
        });
    
        // this.connection.connect(function(err){
        //  if(!err) {
        //      console.log("Database is connected ... \n\n"); 
        //      // this.emit('dbConnected');
        //  } 
        //  else {
        //      console.log("Error connecting database ... \n\n");
        //      // this.emit('dbConError'); 
        //  }
        // });  
    };
    // this.init = function(){
    //     this.connection.query('INSERT INTO reftypes SET ?', {RefTypeID : 1, RefType: 'text/html'}, function(err, result) {
    //       if (err) throw err;
    //     });      
    // };
    this.handleRefsInfo = function(url, hrefs, title, parsed){
        async.series([
                function addRefs(callback){
                    self.pool.getConnection(function(err, connection) {
                        var valuesToInsert = [];
                        for (var i in hrefs) {
                            if (!(i in self.urlToId)) valuesToInsert.push([i, 1, 0, 1]);
                        }
                        
                        if (valuesToInsert.length > 0) connection.query("INSERT INTO refs (RefURL, Parsed, RefError, RefTypeID) VALUES ?", [valuesToInsert], function(err, result) {
                                if (err) throw err;

                                var refId = result.insertId; // when bulk INSERT INTO, returns the first ID of the row.
                                for(var i = 0, l = valuesToInsert.length; i < l; i++){
                                    self.urlToId[valuesToInsert[i][0]] = refId;
                                    refId +=1;
                                }
                                callback(null, 'refs added');
                            });                        
                       connection.release(); 
                    });     
                },
                function addInfo(callback){
                    self.addPageInfo(url, hrefs, title);
                    callback(null, 'page info added');
                }
            ],
            function(err, results){
                if (err) throw err;
        });
    };

    this.addRef = function (url, type) {
        
        var toInsert = {RefURL: url, Parsed: 1, RefError: 0, RefTypeID: type||1};
        self.pool.getConnection(function(err, connection) {
            connection.query('INSERT INTO refs SET ?', toInsert, function(err, result) {
              if (err) throw err;

              self.urlToId[url] = result.insertId;
               connection.release();
            });
        });
    };

    
    this.addPageInfo = function(url, hrefs, title) {
        var refId = self.urlToId[url];
        //adding page title to reftitle
        self.pool.getConnection(function(err, connection) {
            connection.query("INSERT INTO reftitle SET ? ON DUPLICATE KEY UPDATE ?", [{'RefTitleID': refId, 'Title' :title}, {'Title' :title}], function(err, result) {
                if (err) throw err;
               connection.release();
            });
        });

        self.addLinks(refId, hrefs);

    };

    this.addLinks = function(refId, hrefs){
        for(var url in hrefs){
            if(!(url in self.urlToId)) console.log('!!!!!!!!!!!!');
            refgraphInsert(self.urlToId[url], url); //refId - already in scope
        }

        function refgraphInsert(idTo, i){
            self.pool.getConnection(function(err, connection) {
                connection.query('INSERT INTO refgraph SET ?', {'RefLinkedByID' : refId, 'RefLinksToID': idTo}, function(err, result) {
                    if (err) throw err;

                    var refGrId = result.insertId;
                    
                    for (var j in hrefs[i]){
                         manageLabels(i, j, refGrId, connection);                 
                    }
                    connection.release();
                });
            });      
        }
        
        function manageLabels(i, j, refGrId, connection){
            connection.query('INSERT INTO labels SET ?', {'Label' : j}, function(err, result) {
                if (err) throw err;

                var labelId = result.insertId;

                connection.query('INSERT INTO refgrlabels SET ?', {'RefGrID' : refGrId, 'LabelID': labelId, 'Count' : hrefs[i][j]}, function(err, result) {
                    if (err) throw err;
                });                         
            });              
        }
    };

    this.visData = function(cb){
        var nodes = [],
            edges = [];
        self.pool.getConnection(function(err, connection) {    
            connection.query('SELECT RefID, RefURL FROM refs', function(err, result) {
                    if (err) throw err;

                    for (var i = 0, len = result.length, node = {}; i < len; i++){
                        node = {id: result[i].RefID, label: result[i].RefURL};
                        nodes.push(node);
                    }
                    connection.query('SELECT RefLinkedByID, RefLinksToID FROM refgraph', function(err, result) {
                        if (err) throw err;
                        for (var i = 0, len = result.length, edge = {}; i < len; i++){
                            console
                            edge = {from: result[i].RefLinkedByID, to: result[i].RefLinksToID};
                            edges.push(edge);
                        }
                        cb(err,[nodes, edges]);
                        connection.release();
                    });
            }); 
        });   
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
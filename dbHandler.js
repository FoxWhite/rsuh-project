var mysql   = require('mysql'),
    path    = require('path');

var DBHandler = function(){
    this.connection = false;

    this.connect = function(db){
        this.connection = mysql.createConnection({
         host     : 'localhost',
         user     : 'root',
         password : 'password',
         database : db
        });
    
        this.connection.connect(function(err){
         if(!err) {
             console.log("Database is connected ... \n\n");  
         } 
         else {
             console.log("Error connecting database ... \n\n");  
         }
        });    
    }


    // connection.query('SELECT * FROM refs', function(err, rows, fields){
    //      if (!err) {
    //          console.log(rows, 'rows');
    //          response.render('users', {users : rows});
    //      }
    //      else 
    //          console.log('err:' + err.message);

    //      connection.end();
    //  })
    // });
}

module.exports = DBHandler;
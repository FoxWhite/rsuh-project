var express = require('express'),
	mysql   = require('mysql'),
	path    = require('path');

var app = express();

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'rsuh-project'
});

connection.connect(function(err){
	if(!err) {
	    console.log("Database is connected ... \n\n");  
	} 
	else {
	    console.log("Error connecting database ... \n\n");  
	}
});


app.set('view engine', 'jade');
app.set('port', 3000);


app.get('/', function(request, response){
	connection.query('SELECT * FROM refs', function(err, rows, fields){
		if (!err) {
			console.log(rows, 'rows');
			response.render('users', {users : rows});
		}
		else 
			console.log('err:' + err.message);

		connection.end();
	})
});



app.get('*', function(request, response){
	response.send('Bad route');
});

var server = app.listen(3000, function() {
	console.log('listening on port 3000');
})
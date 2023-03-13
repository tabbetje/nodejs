const express = require("express");
const mysql = require("mysql");

// Create connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodemysql",
  
  });

// Connect to MySQL
db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log("MySql Connected");
 });

 const app = express();

 // Create data object
app.get('/test', function(request, response){
  db.query('select * from employee', function(error, results){
      if ( error ){
          response.status(400).send('Error in database operation');
      } else {
          response.send(results);
      }
  });
});

// App listen to port 3000
app.listen("3000", () => {
    console.log("Server started on port 3000");
});

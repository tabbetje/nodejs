const express = require("express");
const mysql = require("mysql");
const SqlToJson = require("sql-to-json");
const runAsyncGen = require("run-async-gen");
const fs = require("fs");

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

 runAsyncGen(GenerateJsonFile(), function(err) {
  if (err) {
      console.log(err);
      process.exit(1);
  }
  console.log('Done');
});

function* GenerateJsonFile() {
	// const mySqlDbClient = mysql.createConnection({credentials object});
	// mySqlDbClient.connect();

	const struct = {
    "type": "object",
    "preLoadTables": {
        "direct_publishers": "select * from publishers",
        "cost_models": "select * from costModels",
        "cost_models_countries": "select * from cm_countries",
        "cost_model_types": "select * from cm_types",
        "activities": "select * from activities",
        "countries": "select * from countries"
    },
    "memQuery": "select id from direct_publishers",
    "keyField": "id",
    "refField": "id",
    "fields": [{
        "type": "object",
        "memQuery": "select dp.name, ac.name as activity_name from direct_publishers dp inner join activities ac on dp.activity_id = ac.id where dp.id = ?",
        "fields": [{
            "dbName": "name",
            "name": "name",
            "type": "string"
        }, {
            "dbName": "activity_name",
            "name": "activity",
            "type": "string"
        }, {
            "name": "costModels",
            "type": "object",
            "nullable": true,
            "memQuery": "select id, domain from cost_models where publisher_id = ?",
            "keyField": "domain",
            "refField": "id",
            "fields": [{
                "type": "object",
                "memQuery": "select c.country_code from cost_models cm inner join cost_models_countries cmc on cm.id = cmc.cost_model_id inner join countries c on cmc.country_id = c.id where cm.id = ?",
                "keyField": "country_code",
                "fields": [{
                    "type": "object",
                    "memQuery": [
                        "select c.country_code from cost_models cm inner join cost_models_countries cmc on cm.id = cmc.cost_model_id inner join countries c on cmc.country_id = c.id where cm.id = ?",
                        "select 'all' as country_code"
                    ],
                    "fields": [{
                        "dbName": "type_name",
                        "name": "type",
                        "type": "string"
                    }, {
                        "dbName": "value",
                        "name": "value",
                        "type": "number"
                    }]
                }]
            }]
        }]
    }]
};
	const instance = new SqlToJson(db);
	const dataAsJson = yield* instance.executeGen(struct);
	
	fs.writeFileSync('output.json', JSON.stringify(dataAsJson));
	db.end();
}

const app = express();

//  // Create data object
// app.get('/test', function(request, response){
//   db.query('select * from employee', function(error, results){
//       if ( error ){
//           response.status(400).send('Error in database operation');
//       } else {
//           response.send(results);
//       }
//   });
// });

// App listen to port 3000
app.listen("3000", () => {
    console.log("Server started on port 3000");
});

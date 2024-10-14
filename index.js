const csv = require('csv-parser')
const fs = require('fs')
const express = require('express');
//import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
const results = [];

fs.createReadStream('inventory_data_bau.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    const filtered = results.filter(results => results.location_type.includes("City"));

  });
app.get("/", (req, res) => {
    res.send("hello");
})
app.get("/api/location_type/:location_type/geofips/:geofips/?array", (request, response) => {
    //get all the users that have filter (username) as some value ('a')
   // const location_type = request; //no table, no years (years is columns)
    console.log("what");
    const rq = request.params.location_type;
    const rq2 = request.params.geofips;
    const rq3 = request.params.columns;
    var arr = JSON.parse(request.query.array);
    return response.status(200).send(filters(rq, rq2, arr));
});

function filters(location_type, geofips, columns) {
    //filter by location: city
    const filtered = results.filter(results => results.location_type.includes(location_type));
    const s = filtered.filter(filtered => filtered.geofips.includes(geofips));
    console.log(s);
    console.log("here");

    const filteredUsers = s.map(user => {
        let filteredUser = {};
        
        // Loop through the selected parameters and add them to the new object
        columns.forEach(param => {
          if (user.hasOwnProperty(param)) {
            filteredUser[param] = user[param];
          }
        });
    
        return filteredUser;
      });
    
    //filter by geofips
  //  filtered = filtered.result.rows.filter(filtered.geofips.includes(geofips))
    return filteredUsers;
    //filter by years
   // filtered = filtered.result.rows.filter(filtered.year.includes(years))
    
}

app.listen(PORT, () => {
    console.log('Running on port ${PORT}');
});
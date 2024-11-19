const csv = require('csv-parser')
const fs = require('fs')
const express = require('express');
//import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
const stuff = [];
// fs.createReadStream("inventory_data_bau.csv")
//   .pipe(csv())
//   .on('data', (data) => stuff.push(data))
//   .on('end', () => {
//     const filtered = stuff.filter(results => results.location_type.includes('City'));
//    // const s = filtered.filter(filtered => filtered.geofips.includes(rq));
//     console.log(filtered);

//     // const filteredItems = s.map(item => {
//     //   let filteredItem = {};
//     //   columns.forEach(field => {
//     //     // Only add the field if it exists in the original item
//     //     if (item[field]) {
//     //       filteredItem[field] = item[field];
//     //     }
//     //   });
//     //   return filteredItem;
//     // });
//     // filteredUsers = filteredUsers + filteredItems;
// });
console.log("hiihi");

// app.get("/api/:geofips", (req, res) => {
//     res.send(req.params.geofips);
// });


app.get("/test/:geofips", (request, response) => {
  //Basic API call for geofips filter for one csv file
  const rq2 = request.params.geofips;
  const results = [];
  fs.createReadStream("inventory_data_bau.csv")
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(rq2);
    const filtered = results.filter(results => results.geofips == rq2);
    console.log(filtered);

    return response.status(200).json(filtered);
  });

});
app.get("/api/:geofips", async (request, response) => {
    //get all the info from all spreadsheets on this GEOFIPS filter
    const rq2 = request.params.geofips;
    const rq4 = request.query.spreadsheets;

    //error checking for the array parameters + configure into array for usage
    if (!rq4) {
      return response.status(400).json({ error: 'No parameters provided' });
    }

    //let columns = rq3.flatMap(param => param.split(','));
    var spreadsheets = rq4.split(',');

    const filteredGeofips = await filters(rq2, spreadsheets);
    //console.log(filteredGeofips);
    return response.status(200).json(filteredGeofips);
});


async function filters(geofips, spreadsheets) {
  //console.log(spreadsheets);
   const filteredUsers = [];
  // const filtered = [];
   const s = [];
   for (let i = 0; i < spreadsheets.length; i++) {
     const results = await readCSV(spreadsheets[i]);
     const filtered = results.filter(result => result.geofips.includes(geofips));
     filteredUsers.push(...filtered);
   }
   return filteredUsers;
     
 };

app.get("/activity/:geofips", async (request, response) => {
  //get activity database
  const rq2 = request.params.geofips;
  const rq4 = request.query.spreadsheets;

  //error checking for the array parameters + configure into array for usage
  if (!rq4) {
    return response.status(400).json({ error: 'No parameters provided' });
  }

  //let columns = rq3.flatMap(param => param.split(','));
  var spreadsheets = rq4.split(',');

  const filteredGeofips = await activityFilters(rq2, spreadsheets);
  //console.log(filteredGeofips);
  return response.status(200).json(filteredGeofips);
});


async function activityFilters(geofips, spreadsheets) {
  const results1 = [];
  const results2 = [];
  const results3 = [];
  const results4 = [];
   const filteredUsers = [];
   const s = [];
   for (let i = 0; i < spreadsheets.length; i++) { //spreadsheet order, 
     const csv = await readCSV(spreadsheets[i]);
     const filtered = csv.filter(result => result.geofips.includes(geofips));
     filteredUsers.push(...filtered);
     if (spreadsheets[i] == "db.replica") {
      console.log('we made it replica');
      const temp = filtered.map((element)=>({2023:element["2023"]}));
      console.log(temp);
      results1.push(...temp);
     } else if (spreadsheets[i] == "aadt2013_2019") {
      console.log('we made it aadt');
      for (let j = 13; j < 23; j++) {
        const num = 2000 + j;
        const temp = filtered.map((element)=>({[num]:element[num]}));
        results1.push(...temp);
      }
      //add ldv for the models, but hdv data also here for graphs 
     }
   }
  return results1;
     
 };

 //have one function that does all cities + counties + california (loop through all and just use above api call)

function readCSV(file) {
  return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(file + ".csv")
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
  });
}

app.listen(PORT, () => {
    console.log('Running on port ' + PORT);
});
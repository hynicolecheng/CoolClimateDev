import express from 'express'
import cors from 'cors';
const app = express()
const PORT = 8080;

app.use(cors());

import {getFips, getDV} from './db.js'
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


app.get("/fips/:geofips" , async(req,res) => {
    const fips = req.params.geofips
    console.log("Received request for geofips:", fips);
    const fipsSend = await getFips(fips)
    res.send(fipsSend)
})

app.get("/fips/:geo_name/sector" , async(req,res) => {
    const name = req.params.geo_name
    const nameDV = await getDV(name)
    res.send(nameDV)
})

app.listen(
    PORT,
    () => {console.log("alive at http://localhost:8080")}
)


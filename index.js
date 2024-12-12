import express from 'express'
import cors from 'cors';
const app = express()
const PORT = 8080;

app.use(cors());

import {getFips, sectorGHG, populationHist, kwhElec, thermsNatGas, residentialThermsPerP, populationHistVCA, residentialKwhPer} from './db.js'


app.get("/fips/:geoName/population", async (req, res) => {
    const name = req.params.geoName;
    const pop = await populationHist(name);
    res.send(pop);
});

app.get("/fips/:geo_name", async (req, res) => {
    const name = req.params.geo_name;
    const nameSectorStack = await sectorGHG(name);
    res.send(nameSectorStack);
});

app.get("/fips/:geo_name/kwh", async (req, res) => {
    const name = req.params.geo_name;
    const kElec = await kwhElec(name);
    res.send(kElec)
})

app.get("/fips/:geo_name/therms", async (req, res) => {
    const name = req.params.geo_name;
    const therms = await thermsNatGas(name);
    res.send(therms)
})

app.get("/fips/:geo_name/thermsper", async (req, res) =>{
    const name = req.params.geo_name;
    const thermsPer = await residentialThermsPerP(name)
    res.send(thermsPer)
})

app.get("/fips/:geofips", async (req, res) => {
    const fips = req.params.geofips;
    const fipsSend = await getFips(fips);
    res.send(fipsSend);
})

app.get("/fips/:geoName/popvsCA", async(req, res) => {
    const name = req.params.geoName;
    const popVc = await populationHistVCA(name);
    res.send(popVc);
})

app.get("/fips/:geo_name/elecper", async(req,res) => {
    const name = req.params.geo_name;
    const elecper = await residentialKwhPer(name);
    res.send(elecper)
})




app.listen(
    PORT,
    () => {console.log("alive at http://localhost:8080")}
)


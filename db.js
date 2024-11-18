import mysql from 'mysql2'

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'bennett_yarnell',
    password: 'Wallydog9#237',
    database: 'cc_db'
}).promise()

const years = Array.from({ length: 2045 - 1990 + 1 }, (_, i) => 1990 + i);
const yearColumns = years.map(year => `\`${year}\` AS year_${year}`).join(', ');




//prepared statement
export async function getFips(geofips){
    const result = await pool.query(`
        SELECT *
        FROM ghgs_bau
        WHERE geofips = ?
        LIMIT 10 OFFSET 1
    `, [geofips])
    const rows = result[0]
    return rows
}

export async function getDV(geo_name){
    const result = await pool.query(`
        SELECT sector, ${yearColumns}
        FROM ghgs_bau
        WHERE geo_name = ?
    `, [geo_name])
    const rows = result[0]
    return rows
}



//const fips = await getFips(6015)
//console.log(fips)

   
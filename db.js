import mysql from 'mysql2';

// Use environment variables for sensitive credentials
const pool = mysql.createPool({
    host:  '127.0.0.1',
    user:  'bennett_yarnell',
    password:  'Wallydog9#237',
    database:  'cc_db',
}).promise();

const years = Array.from({ length: 2030 - 2005 + 1}, (_, i) => 2005 + i);
const yearColumns = years.map(year => `\`${year}\``).join(', ');

const yearsf = Array.from({ length: 2045 - 1990 + 1}, (_, i) => 1990 + i);
const yearColumnsFull = yearsf.map(year => `\`${year}\``).join(', ');


export async function getFips(geofips) {
    const result = await pool.query(`
        SELECT *
        FROM ghgs_bau
        WHERE geofips = ?
        LIMIT 10 OFFSET 0
    `, [geofips]);
    const rows = result[0];
    return rows;
}


export async function sectorGHG(geo_name) {
    const yearsSQL = years.map(year => `SUM(\`${year}\`) AS year_${year}`).join(', ');

    
    const baseQuery = `
        SELECT 
            sector,
            description,
            ${yearsSQL}
        FROM ghgs_bau
        WHERE geo_name = ?
          AND description NOT LIKE '%Therms Natural Gas%' 
          AND description NOT LIKE '%Kilowatt-Hours Electricity%'
        GROUP BY sector, description
    `;

    
    const naturalGasQuery = `
        SELECT 
            'Natural Gas' AS sector,
            'Aggregated' AS description,
            ${years.map(year => `
                SUM(CASE 
                    WHEN description LIKE '%Therms Natural Gas%' THEN \`${year}\` ELSE 0 
                END) AS year_${year}`).join(', ')}
        FROM ghgs_bau
        WHERE geo_name = ?
    `;

    // Query for Electricity aggregation
    const electricityQuery = `
        SELECT 
            'Electricity' AS sector,
            'Aggregated' AS description,
            ${years.map(year => `
                SUM(CASE 
                    WHEN description LIKE '%Kilowatt-Hours Electricity%' THEN \`${year}\` ELSE 0 
                END) AS year_${year}`).join(', ')}
        FROM ghgs_bau
        WHERE geo_name = ?
    `;

    
    const query = `
        ${baseQuery}
        UNION ALL
        ${naturalGasQuery}
        UNION ALL
        ${electricityQuery}
    `;

    //console.log("Generated SQL Query:", query);

    // Execute the query
    const result = await pool.query(query, [geo_name, geo_name, geo_name]);
    return result[0];
}

export async function populationHist(geoName) {
    const result = await pool.query(`
        SELECT ${yearColumnsFull}
        FROM db_population_clean
        WHERE geoName = ? 
    `, [geoName]);
    const rows = result[0];
    return rows;
}

export async function kwhElec(geo_name){
    const result = await pool.query(`
        SELECT sector, ${yearColumns}
        FROM inventory_data_bau
        WHERE geo_name = ? AND description = 'Kilowatt-Hours Electricity'
    `, [geo_name]);
    const rows = result[0]
    return rows;
}

export async function thermsNatGas(geo_name){
    const result = await pool.query(`
        SELECT sector, ${yearColumns}
        FROM inventory_data_bau
        WHERE geo_name = ? AND description = 'Therms Natural Gas'
    `, [geo_name]);
    const rows = result[0]
    return rows;
}

export async function residentialThermsPerP(geo_name) {
    const result = await pool.query(`
        SELECT 
            ${yearColumnsFull.split(',').map(year => `(inventory_data_bau.${year} / db_population_clean.${year}) AS ${year}`).join(', ')},
            inventory_data_bau.geo_name
        FROM inventory_data_bau
        JOIN db_population_clean ON inventory_data_bau.geo_name = db_population_clean.geoName
        WHERE inventory_data_bau.geo_name = ? AND inventory_data_bau.sector = 'residential' AND inventory_data_bau.description = 'Therms Natural Gas'
    `, [geo_name]);
    return result[0];
}

export async function populationHistVCA(geoName) {
    try {
        const caQ = 
        `
            SELECT ${yearColumnsFull}, geoName
            FROM db_population_clean
            WHERE geoName = 'California'
        `
        const inputQ = 
        `
            SELECT ${yearColumnsFull}, geoName
            FROM db_population_clean
            WHERE geoName = ?
        `
        const query = `${caQ} UNION ALL ${inputQ}`
        const [rows] = await pool.query(query, [geoName]);
        const caData = [];
        const otherData = [];
        
        rows.forEach(row => {
            if(row.geoName === 'California'){
                caData.push(row)
            }
            else if(row.geoName === geoName){
                otherData.push(row)
            }
        })
        return {
            caData,
            otherData
        }

    } catch (error) {
            console.error('Error fetching population data:', error);
            throw error; 
    }
}

export async function residentialKwhPer(geo_name){
    const result = await pool.query(`
        SELECT 
            ${yearColumnsFull.split(',').map(year => `(inventory_data_bau.${year} / db_population_clean.${year}) AS ${year}`).join(', ')},
            inventory_data_bau.geo_name
        FROM inventory_data_bau
        JOIN db_population_clean ON inventory_data_bau.geo_name = db_population_clean.geoName
        WHERE inventory_data_bau.geo_name = ? AND inventory_data_bau.sector = 'residential' AND inventory_data_bau.description = 'Kilowatt-Hours Electricity'
    `, [geo_name]);
    const rows = result[0];
    return rows;
}

export async function householdsVsPopulation(geo_name){
    const query  = `
        SELECT HOUSEHOLDS AS value, 'Households' AS type FROM db_census_ca
        WHERE geo_name = ? OR geo_name = CONCAT(?, ', California')
        UNION ALL
        SELECT POPULATION AS value, 'Population' AS type FROM db_census_ca
        WHERE geo_name = ? OR geo_name = CONCAT(?, ', California')
        UNION ALL 
        SELECT year AS value, 'Year' AS type FROM db_census_ca
        WHERE geo_name = ? OR geo_name = CONCAT(?, ', California')
    `
    const [rows] = await pool.query(query, [geo_name, geo_name,
                                            geo_name, geo_name,
                                            geo_name, geo_name]);
    const popData = [];
    const houseData = [];
    const yearData = [];

    rows.forEach(row => {
        if(row.type === 'Population'){
            popData.push(row.value);
        }
        if(row.type === 'Households'){
            houseData.push(row.value);
        }
        if(row.type === 'Year'){
            yearData.push(row.value)
        }
    })
    return {
        popData,
        houseData,
        yearData,
    };
}














  



//const fips = await getFips(6015)
//console.log(fips)

   
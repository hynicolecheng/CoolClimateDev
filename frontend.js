let chart1, chart2, chart3, chart4, chart5, chart6, chart7;


const fixedColors = [
    'rgb(255, 99, 132)',  // Red
    'rgb(54, 162, 235)',  // Blue
    'rgb(255, 206, 86)',  // Yellow
    'rgb(75, 192, 192)',  // Teal
    'rgb(153, 102, 255)', // Purple
    'rgb(255, 159, 64)'   // Orange
];


async function fetchDataSector(geo_name) {
    const response = await fetch(`http://localhost:8080/fips/${geo_name}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch data for geo_name ${geo_name}`);
    }
    return await response.json();
}


async function fetchDataPop(geoName) {
    const response = await fetch(`http://localhost:8080/fips/${geoName}/population`);
    if (!response.ok) {
        throw new Error(`Failed to fetch population data for geo_name ${geoName}`);
    }
    return await response.json();
}

async function fetchDataKwh(geo_name){
    const response = await fetch(`http://localhost:8080/fips/${geo_name}/kwh`);
    if(!response.ok){
        throw new Error(`Failed to fetch kwh elec data for geo_name ${geo_name}`);
    }
    return await response.json();
}

async function fetchDataTherms(geo_name){
    const response = await fetch(`http://localhost:8080/fips/${geo_name}/therms`);
    if(!response.ok){
        throw new Error(`Failed to fetch therms data for geo_name ${geo_name}`);
    }
    return await response.json();
}

async function fetchDataThermsPer(geo_name){
    const response = await fetch(`http://localhost:8080/fips/${geo_name}/thermsper`);
    if(!response.ok){
        throw new Error(`Failed to fetch therms per person data for geo_name ${geo_name}`);
    }
    return await response.json();
}

async function fetchDataPopVCA(geoName){
    const response = await fetch(`http://localhost:8080/fips/${geoName}/popvsCA`);
    if(!response.ok){
        console.error('Failed response:', response);
        throw new Error(`Failed to fetch pop vs ca for geo_name ${geoName}`);
    }
    const data = await response.json();
    return data;
}

async function createPopVsCAChart(geoName){
    try{
        const {caData, otherData} = await fetchDataPopVCA(geoName);
        console.log('Fetched California Data:', caData);
        console.log('Fetched Other Data:', otherData);
        const years  = Object.keys(caData[0]) 
            .filter(key => key.startsWith("20") || key.startsWith("19"));caData.map(row => row.year);
        
        const caPop = years.map(year => caData[0][year]);
        const otherPop = years.map(year => otherData[0][year]);
        
        const percentageChangeCa = caPop.map((value, index) => {
            return (value / caPop[0]) * 100; '%'
        });
    
        const percentageChangeOther = otherPop.map((value, index) => {
            return (value / otherPop[0]) * 100; 
        });
        const colors = years.map(year => {
            if (parseInt(year) > 2024) {
                return 'rgba(54, 162, 235)'; 
            } else {
                return 'rgba(255, 99, 132)'; 
            }
        });
        const colors2 = years.map(year => {
            if (parseInt(year) > 2024) {
                return 'rgba(25, 180, 235)'; 
            } else {
                return 'rgba(25, 180, 95)'; 
            }
        });

        const data = {
            labels: years,
            datasets: [
                {
                    label: 'California Population',
                    data: percentageChangeCa,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1 
                },
                {
                    label: `${geoName} Population`,
                    data: percentageChangeOther,
                    backgroundColor: colors2,
                    borderColor: colors2,
                    borderWidth: 1

                }
            ]
        };
        const ctx = document.getElementById('myChart7').getContext('2d');
        if(chart7) chart7.destroy();
        chart7 = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }, 
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw.toFixed(2)}%`; 
                            },
                        },
                    },

                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Year',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Population Change'
                        },
                        ticks: {
                            callback: function(value) {
                                return `${value}%`; // Add % to Y-axis labels
                            },
                        },
                    },
                },
            },
        })
    } catch (error){
        console.log("error chart7 :", error.message);

    }
    

}

async function createThermsPerChart(geo_name){
    try{
        const rawData = await fetchDataThermsPer(geo_name);
        const labels = Object.keys(rawData[0]) 
            .filter(key => key.startsWith("20") || key.startsWith("19"));

            const data = labels.map(year => {
                const value = rawData[0][year];
                let processedValue;
                if (value !== null) {
                    processedValue = parseFloat(value);
                } else {
                    processedValue = null;
                }
                return processedValue;
            });

        const ctx = document.getElementById('myChart6').getContext('2d');
        if(chart6) chart6.destroy();
        chart6 = new Chart(ctx, {
            type: 'line', 
            data: {
                labels: labels, 
                datasets: [{
                    label: 'Therms Per Capita', 
                    data: data, 
                    backgroundColor: 'rgba(75, 192, 192)', 
                    borderColor: 'rgba(75, 192, 192, 1)',       
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right', 
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: { beginAtZero: true } 
                }
            }
        });
    } catch (error) {
        console.error("Error creating chart6:", error.message);
    }
}

async function createThermsChart(geo_name){
    try{
        const rawData = await fetchDataTherms(geo_name);
        const labels = Object.keys(rawData[0])
            .filter(key => key.startsWith("20"));
    
    const datasets = rawData.map((sectorData, index) => {
            const sectorName = sectorData.sector;
            const values = labels.map(year => sectorData[year]);

            return {
                label: sectorName,
                data: values,
                backgroundColor: fixedColors[index % fixedColors.length],
                borderColor: fixedColors[index % fixedColors.length],
                borderWidth: 1,
                stack: 'stack3'
            };
        });

        if(chart5) chart5.destroy();
        const ctx = document.getElementById('myChart5').getContext('2d');
        chart5 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options:{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend:{
                        position: 'right'
                    },
                },
                    scales: {
                        x: { stacked: true },
                        y: { stacked: true, beginAtZero: true }
                    }
                }
            });
        }
        catch(error){
            console.error("Error creating Chart5:", error.message);
        }
    }

    

async function createKwhElecChart(geo_name){
    try{
        const rawData = await fetchDataKwh(geo_name);
        const labels = Object.keys(rawData[0])
            .filter(key => key.startsWith("20"));

        const datasets = rawData.map((sectorData, index) => {
            const sectorName = sectorData.sector; 
            const values = labels.map(year => sectorData[year]);
        
            return {
                label: sectorName,
                data: values,
                backgroundColor: fixedColors[index % fixedColors.length],
                borderColor: fixedColors[index % fixedColors.length],
                borderWidth: 1,
                stack: 'stack2'
            };
        });

        if (chart4) chart4.destroy();
        const ctx = document.getElementById('myChart4').getContext('2d');
        chart4 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'right',
                    },
                },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true }
                }
            }
        });
    }
    catch(error){
        console.error("Error creating Chart4:", error.message);
    }
}


async function createChart1(geo_name) {
    try {
        const rawData = await fetchDataSector(geo_name);

        const labels = Object.keys(rawData[0])
            .filter(key => key.startsWith("year_"))
            .map(yearKey => yearKey.replace("year_", ""));

        const datasets = rawData.map((sectorData, index) => {
            const sectorName = sectorData.sector;
            const values = labels.map(year => sectorData[`year_${year}`]);

            return {
                label: sectorName,
                data: values,
                backgroundColor: fixedColors[index % fixedColors.length],
                borderColor: fixedColors[index % fixedColors.length],
                borderWidth: 1,
                stack: 'stack1'
            };
        });

        if (chart1) chart1.destroy(); 
        const ctx = document.getElementById('myChart1').getContext('2d');
        chart1 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {
                        position: 'right',
                    },
                },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true }
                }
            }
        });
    } catch (error) {
        console.error("Error creating Chart1:", error.message);
    }
}
async function createChart1Line(geo_name){
    try{
        const rawData = await fetchDataSector(geo_name);

        const labels2 = Object.keys(rawData[0])
            .filter(key => key.startsWith("year_"))
            .map(yearKey => yearKey.replace("year_", ""));

        const dataSets = rawData.map((sectorData, index) => {
            const sectorName = sectorData.sector;
            const values = labels2.map(year => sectorData[`year_${year}`]);
       
        return {
            label: sectorName,
            data: values,
            backgroundColor: fixedColors[index % fixedColors.length],
            borderColor: fixedColors[index % fixedColors.length],
            borderWidth: 1,

        };
        });
        if(chart3) chart3.destroy();
        const ctx = document.getElementById('myChart3').getContext('2d');
        chart3 = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels2,
                datasets: dataSets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {
                        position: 'right',
                    },   
                },
            }
        });
    }
    catch (error){
        console.error("Error creating chart4: ", error.message)
    }
    
}


async function createPopChart(geoName) {
    try {
        const rawData = await fetchDataPop(geoName);

        const labels = Object.keys(rawData[0]);
        console.log("Labels:", labels);

        const colors = labels.map(year => {
            if (parseInt(year) > 2024) {
                return 'rgba(54, 162, 235)'; 
            } else {
                return 'rgba(255, 99, 132)'; 
            }
        });

        const data = labels.map(year => rawData[0][year]);
        const datasets = [{
            label: "Population",
            data: data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
        }];

        if (chart2) chart2.destroy(); 
        const ctx = document.getElementById('myChart2').getContext('2d');
        chart2 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {
                        position: 'top',
                    },
                },
                scales: {
                    x: { stacked: false },
                    y: { stacked: false, beginAtZero: true }
                }
            }
        });
    } catch (error) {
        console.error("Error creating Population Chart:", error.message);
    }
}

document.getElementById('fetchButton').addEventListener('click', async () => {
    const geoName = document.getElementById('geoNameInput').value.trim();

    if (!geoName) {
        alert("Please enter a valid Geo Name");
        return;
    }

    try {
        
        await createChart1(geoName);
        await createChart1Line(geoName);
        await createPopChart(geoName);
        await createKwhElecChart(geoName);
        await createThermsChart(geoName);
        await createThermsPerChart(geoName);
        await createPopVsCAChart(geoName);

    } catch (error) {
        console.error("Error creating charts:", error.message);
    }
});


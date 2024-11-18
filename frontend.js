
async function fetchData(geo_name) {
    const response = await fetch(`http://localhost:8080/fips/${geo_name}/sector`);
    if (!response.ok) {
        throw new Error(`Failed to fetch data for geo_name ${geo_name}`);
    }
    const data = await response.json();
    return data; 
}

const fixedColors = [
    'rgb(255, 99, 132)',  // Red
    'rgb(54, 162, 235)',  // Blue
    'rgb(255, 206, 86)',  // Yellow
    'rgb(75, 192, 192)',  // Teal
    'rgb(153, 102, 255)', // Purple
    'rgb(255, 159, 64)'   // Orange
];

async function createChart(geo_name) {
    try {
        const rawData = await fetchData(geo_name);

        
        const labels = Object.keys(rawData[0])
            .filter(key => key.startsWith("year_")) 
            .map(yearKey => yearKey.replace("year_", "")); 

        
        const datasets = rawData.map((sectorData, index)  => {
            const sectorName = sectorData.sector; 
            const values = labels.map(year => sectorData[`year_${year}`]); 

            return {
                label: sectorName, 
                data: values, 
                backgroundColor: fixedColors[index % fixedColors.length], 
                borderColor: fixedColors[index % fixedColors.length],
                borderWidth: 1
            };
        });

        // Render the chart
        const ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar', 
            data: {
                labels: labels, 
                datasets: datasets 
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true 
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error creating chart:", error.message);
    }
}

// Utility function to generate random colors


document.getElementById('fetchButton').addEventListener('click', () => {
    const geoName = document.getElementById('geoNameInput').value.trim();
    if (!geoName) {
        alert("Please enter a valid Geo Name");
        return;
    }
    createChart(geoName);
});


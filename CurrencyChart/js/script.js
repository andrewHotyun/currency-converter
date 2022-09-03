const month = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",   
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December",
}
  
async function fetchData() {
    const url = 'currency.json';
    const response = await fetch(url);
    const datapoints = await response.json();
    const dates = [];
    const dollars = [];
    const euro = [];
    for (i = 0; i < datapoints.length; i++) {
        dates[i] = month[datapoints[i].date.substring(3, 5)];
        dollars[i] = datapoints[i].usd;
        euro[i] = datapoints[i].eur;   
    }
    const data = {
        labels: dates,
        datasets: [
            {
                label: "Euro",
                data: euro,
                borderColor: "#FF9800",
                borderWidth: 1
            },
            {
                label: 'Dollars', 
                data: dollars,
                borderColor: '#42A5F5',
                borderWidth: 1
            }
        ]
    };

    // config 
    const config = {
        type: 'line', 
        data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {                                              
                        
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y;
                        }
                                                
                        if (context.dataIndex !== null) {
                            label += `(${datapoints[context.dataIndex].date})`;
                        }
                        return label;
                    }
                }
            }
        }
        }
    };

    // render init block
    const myChart = new Chart(
        document.getElementById('myChart'),
        config,
    );
};
fetchData();
       
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const endpoint = urlParams.get('endpoint');

    async function loadData(endpoint) {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayTable(data);
    }

    function displayTable(data) {
        const tableContainer = document.getElementById('tableContainer');
        if (!data || data.length === 0) {
            tableContainer.innerHTML = 'No data found';
            return;
        }
        
        let table = '<table><tr>';
        
        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            table += `<th>${key}</th>`;
        });
        
        table += '</tr>';
        
        data.forEach(item => {
            table += '<tr>';
            keys.forEach(key => {
                table += `<td>${item[key]}</td>`;
            });
            table += '</tr>';
        });
        
        table += '</table>';
        tableContainer.innerHTML = table;
    }

    if (endpoint) {
        loadData(endpoint).catch(error => {
            console.error('Error loading data:', error);
            document.getElementById('tableContainer').textContent = 'An error occurred';
        });
    } else {
        document.getElementById('tableContainer').textContent = 'No endpoint specified';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Получаем данные из URL параметров
    const urlParams = new URLSearchParams(window.location.search);
    const endpoint = urlParams.get('endpoint');

    // Функция для загрузки данных
    async function loadData(endpoint) {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayTable(data);
    }

    // Функция для отображения данных в таблице
    function displayTable(data) {
        const tableContainer = document.getElementById('tableContainer');
        if (!data || data.length === 0) {
            tableContainer.innerHTML = 'No data found';
            return;
        }
        
        let table = '<table><tr>';
        
        // Динамически добавляем заголовки таблицы
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

    // Загрузка данных с указанного endpoint
    if (endpoint) {
        loadData(endpoint).catch(error => {
            console.error('Error loading data:', error);
            document.getElementById('tableContainer').textContent = 'An error occurred';
        });
    } else {
        document.getElementById('tableContainer').textContent = 'No endpoint specified';
    }
});

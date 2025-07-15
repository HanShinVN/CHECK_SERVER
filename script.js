const backendBaseURL = 'http://100.115.68.21:3000';

const ctx = document.getElementById('tempChart').getContext('2d');
const tempChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'CPU °C',
                data: [],
                borderColor: '#00f5ff',
                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                tension: 0.3
            },
            {
                label: 'GPU °C',
                data: [],
                borderColor: '#ff00c8',
                backgroundColor: 'rgba(255, 0, 200, 0.1)',
                tension: 0.3
            }
        ]
    },
    options: {
        scales: {
            y: { min: 20, max: 80, ticks: { color: '#0ff' } },
            x: { ticks: { color: '#0ff' } }
        },
        plugins: {
            legend: { labels: { color: '#fff' } }
        }
    }
});

function fetchTemp() {
    fetch(`${backendBaseURL}/api/temp`)
        .then(response => response.json())
        .then(data => {
            const raw = data.temperature;

            // Tách từng chỉ số
            const ramMatch = raw.match(/RAM\s+([\d\/]+MB)/);
            document.getElementById('ram').innerText = ramMatch ? ramMatch[1] : '--';

            const swapMatch = raw.match(/SWAP\s+([\d\/]+MB)/);
            document.getElementById('swap').innerText = swapMatch ? swapMatch[1] : '--';

            const cpuLoadMatch = raw.match(/CPU\s+\[(.+?)\]/);
            document.getElementById('cpu').innerText = cpuLoadMatch ? cpuLoadMatch[1] : '--';

            const cpuTempMatch = raw.match(/CPU@([\d.]+)C/);
            const cpuTemp = cpuTempMatch ? parseFloat(cpuTempMatch[1]) : 0;
            document.getElementById('cpuTemp').innerText = cpuTempMatch ? `${cpuTemp}°C` : '--';

            const gpuTempMatch = raw.match(/GPU@([\d.]+)C/);
            const gpuTemp = gpuTempMatch ? parseFloat(gpuTempMatch[1]) : 0;
            document.getElementById('gpuTemp').innerText = gpuTempMatch ? `${gpuTemp}°C` : '--';

            const pmicTempMatch = raw.match(/PMIC@([\d.]+)C/);
            document.getElementById('pmicTemp').innerText = pmicTempMatch ? `${pmicTempMatch[1]}°C` : '--';

            const aoTempMatch = raw.match(/AO@([\d.]+)C/);
            document.getElementById('aoTemp').innerText = aoTempMatch ? `${aoTempMatch[1]}°C` : '--';

            const now = new Date();
            const timeLabel = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

            tempChart.data.labels.push(timeLabel);
            if (tempChart.data.labels.length > 20) tempChart.data.labels.shift();

            tempChart.data.datasets[0].data.push(cpuTemp);
            if (tempChart.data.datasets[0].data.length > 20) tempChart.data.datasets[0].data.shift();

            tempChart.data.datasets[1].data.push(gpuTemp);
            if (tempChart.data.datasets[1].data.length > 20) tempChart.data.datasets[1].data.shift();

            tempChart.update();
        })
        .catch(error => console.error(error));
}

function setVideoStream() {
    document.getElementById('camera-stream').src = `${backendBaseURL}/video_feed`;
}

window.onload = () => {
    fetchTemp();
    setVideoStream();
    setInterval(fetchTemp, 3000);
}

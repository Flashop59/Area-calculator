let map;

function processCSV() {
  const file = document.getElementById("csvFile").files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const data = results.data.map((row) => ({
        lat: parseFloat(row.lat),
        lon: parseFloat(row.lon),
        time: parseInt(row.time),
      }));

      const labels = dbscan(data, 0.05, 3);
      const clusters = {};

      data.forEach((point, i) => {
        const label = labels[i];
        if (label === -1) return; // noise
        if (!clusters[label]) clusters[label] = [];
        clusters[label].push(point);
      });

      if (map) map.remove();
      map = L.map("map").setView([data[0].lat, data[0].lon], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      let outputHtml = `<h3>🧮 Cluster Analysis</h3>`;
      let lastPoint = null;

      for (const label in clusters) {
        const points = clusters[label];
        const hull = convexHull(points);
        const color = `hsl(${label * 50 % 360}, 70%, 60%)`;

        const polygon = L.polygon(hull.map(p => [p.lat, p.lon]), {
          color,
          fillOpacity: 0.3
        }).addTo(map);

        const times = points.map(p => p.time);
        const durationMin = Math.round((Math.max(...times) - Math.min(...times)) / 60000);
        outputHtml += `<p><strong>Cluster ${label}</strong>: ${points.length} points, ⏱️ ${durationMin} min</p>`;

        if (lastPoint) {
          const dist = haversine(lastPoint.lat, lastPoint.lon, points[0].lat, points[0].lon);
          const timeGap = Math.round((points[0].time - lastPoint.time) / 60000);
          outputHtml += `<p>➡️ Travel to Cluster ${label}: ${dist.toFixed(2)} km, ${timeGap} min</p>`;
        }

        lastPoint = points[points.length - 1];
      }

      document.getElementById("output").innerHTML = outputHtml;
    },
  });
}

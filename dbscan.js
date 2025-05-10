function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function dbscan(data, eps = 0.05, minPts = 3) {
  const labels = Array(data.length).fill(undefined);
  let clusterId = 0;

  function regionQuery(i) {
    const neighbors = [];
    for (let j = 0; j < data.length; j++) {
      const d = haversine(data[i].lat, data[i].lon, data[j].lat, data[j].lon);
      if (d <= eps) neighbors.push(j);
    }
    return neighbors;
  }

  function expandCluster(i, neighbors) {
    labels[i] = clusterId;
    for (let j = 0; j < neighbors.length; j++) {
      const idx = neighbors[j];
      if (labels[idx] === undefined) {
        labels[idx] = clusterId;
        const newNeighbors = regionQuery(idx);
        if (newNeighbors.length >= minPts) {
          neighbors = neighbors.concat(newNeighbors);
        }
      }
    }
  }

  for (let i = 0; i < data.length; i++) {
    if (labels[i] !== undefined) continue;
    const neighbors = regionQuery(i);
    if (neighbors.length < minPts) {
      labels[i] = -1;
    } else {
      expandCluster(i, neighbors);
      clusterId++;
    }
  }

  return labels;
}

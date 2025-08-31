// Elements
const cpuLoadEl = document.getElementById("cpuLoad");
const cpuModelEl = document.getElementById("cpuModel");
const memUsedEl = document.getElementById("memUsed");
const memTotalEl = document.getElementById("memTotal");
const osInfoEl = document.getElementById("osInfo");
const coresEl = document.getElementById("cores");
const uptimeEl = document.getElementById("uptime");
const fsBody = document.querySelector("#fsTable tbody");

// helpers
const fmtBytes = b => {
  const u = ["B","KB","MB","GB","TB"];
  let i = 0, v = b;
  while (v >= 1024 && i < u.length-1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${u[i]}`;
};
const fmtUptime = s => {
  const d = Math.floor(s/86400);
  const h = Math.floor((s%86400)/3600);
  const m = Math.floor((s%3600)/60);
  return `${d}d ${h}h ${m}m`;
};

// charts
const cpuChart = new Chart(document.getElementById("cpuChart"), {
  type: "line",
  data: { labels: [], datasets: [{ label:"CPU %", data: [] }] },
  options: { animation:false, scales:{ y:{ beginAtZero:true, max:100 } } }
});
const memChart = new Chart(document.getElementById("memChart"), {
  type: "line",
  data: { labels: [], datasets: [{ label:"Memory Used (GB)", data: [] }] },
  options: { animation:false, scales:{ y:{ beginAtZero:true } } }
});

async function refresh() {
  const res = await fetch("/api/host", { cache: "no-store" });
  const d = await res.json();

  cpuModelEl.textContent = d.cpuModel;
  cpuLoadEl.textContent = d.load.toFixed(1);
  memUsedEl.textContent = fmtBytes(d.mem.used);
  memTotalEl.textContent = fmtBytes(d.mem.total);
  osInfoEl.textContent = d.os;
  coresEl.textContent = d.cores;
  uptimeEl.textContent = fmtUptime(d.uptimeSec);

  fsBody.innerHTML = "";
  d.fs.forEach(v => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${v.fs}</td><td>${fmtBytes(v.used)}</td><td>${fmtBytes(v.size)}</td>`;
    fsBody.appendChild(tr);
  });

  const stamp = new Date().toLocaleTimeString();
  cpuChart.data.labels.push(stamp);
  cpuChart.data.datasets[0].data.push(d.load);
  if (cpuChart.data.labels.length > 30) { cpuChart.data.labels.shift(); cpuChart.data.datasets[0].data.shift(); }
  cpuChart.update();

  const usedGB = d.mem.used / (1024**3);
  memChart.data.labels.push(stamp);
  memChart.data.datasets[0].data.push(usedGB);
  if (memChart.data.labels.length > 30) { memChart.data.labels.shift(); memChart.data.datasets[0].data.shift(); }
  memChart.update();
}
refresh();
setInterval(refresh, 2000);

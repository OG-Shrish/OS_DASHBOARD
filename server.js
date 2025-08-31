import express from "express";
import si from "systeminformation";
import path from "path";
import { fileURLToPath } from "url";
import open from "open";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "public")));

// ... rest of your code ...

app.get("/api/host", async (_req, res) => {
  try {
    const [cpu, load, mem, fsSize, osInfo, time] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.osInfo(),
      si.time(),
    ]);
    const data = {
      cpuModel: cpu.manufacturer + " " + cpu.brand,
      cores: cpu.physicalCores,
      load: load.currentLoad,
      mem: {
        total: mem.total,
        used: mem.active,
        free: mem.available,
      },
      fs: fsSize.map(d => ({ fs: d.fs, used: d.used, size: d.size })),
      os: `${osInfo.distro} ${osInfo.release}`,
      uptimeSec: time.uptime,
    };
    res.setHeader("Cache-Control", "no-store");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);  // open browser automatically
});


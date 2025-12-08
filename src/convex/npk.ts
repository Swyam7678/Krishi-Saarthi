"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

function generateSimulationData(errorMsg?: string) {
  // Randomly select a scenario to test different recommendations
  // 0: Optimal
  // 1-3: Single Deficiency (Low N, P, or K)
  // 4-6: Single Excess (High N, P, or K)
  // 7-9: Mixed Deficiencies
  const scenario = Math.floor(Math.random() * 10);
  
  let n, p, k;
  
  // Base values on scenario
  switch (scenario) {
    case 1: // Low Nitrogen (< 100)
      n = 80 + (Math.random() * 20 - 10);
      p = 192 + (Math.random() * 20 - 10);
      k = 240 + (Math.random() * 20 - 10);
      break;
    case 2: // Low Phosphorus (< 100)
      n = 173 + (Math.random() * 20 - 10);
      p = 80 + (Math.random() * 20 - 10);
      k = 240 + (Math.random() * 20 - 10);
      break;
    case 3: // Low Potassium (< 150)
      n = 173 + (Math.random() * 20 - 10);
      p = 192 + (Math.random() * 20 - 10);
      k = 120 + (Math.random() * 20 - 10);
      break;
    case 4: // High Nitrogen (> 200)
      n = 220 + (Math.random() * 30);
      p = 192 + (Math.random() * 20 - 10);
      k = 240 + (Math.random() * 20 - 10);
      break;
    case 5: // High Phosphorus (> 200)
      n = 173 + (Math.random() * 20 - 10);
      p = 220 + (Math.random() * 30);
      k = 240 + (Math.random() * 20 - 10);
      break;
    case 6: // High Potassium (> 300)
      n = 173 + (Math.random() * 20 - 10);
      p = 192 + (Math.random() * 20 - 10);
      k = 330 + (Math.random() * 40);
      break;
    case 7: // Low N + Low P
      n = 80 + (Math.random() * 20 - 10);
      p = 80 + (Math.random() * 20 - 10);
      k = 240 + (Math.random() * 20 - 10);
      break;
    case 8: // Low N + Low K
      n = 80 + (Math.random() * 20 - 10);
      p = 192 + (Math.random() * 20 - 10);
      k = 120 + (Math.random() * 20 - 10);
      break;
    case 9: // Low P + Low K
      n = 173 + (Math.random() * 20 - 10);
      p = 80 + (Math.random() * 20 - 10);
      k = 120 + (Math.random() * 20 - 10);
      break;
    default: // Optimal
      n = 173 + (Math.random() * 20 - 10);
      p = 192 + (Math.random() * 20 - 10);
      k = 240 + (Math.random() * 20 - 10);
      break;
  }

  const moisture = 45 + (Math.random() * 40 - 20); // Range 25-65

  const getTrend = () => Math.random() > 0.5 ? "up" : "down";

  // Generate realistic history using a random walk backwards from current values
  const history = [];
  let currN = n;
  let currP = p;
  let currK = k;
  let currM = moisture;

  // Add current as the last point
  history.push({
    n: Math.round(n * 10) / 10,
    p: Math.round(p * 10) / 10,
    k: Math.round(k * 10) / 10,
    moisture: Math.round(moisture * 10) / 10,
    time: "Now"
  });

  // Generate 9 previous points
  for (let i = 1; i < 10; i++) {
    // Random small fluctuation
    currN += (Math.random() * 10 - 5);
    currP += (Math.random() * 10 - 5);
    currK += (Math.random() * 10 - 5);
    currM += (Math.random() * 6 - 3);

    history.unshift({
      n: Math.round(Math.max(0, currN) * 10) / 10,
      p: Math.round(Math.max(0, currP) * 10) / 10,
      k: Math.round(Math.max(0, currK) * 10) / 10,
      moisture: Math.round(Math.max(0, Math.min(100, currM)) * 10) / 10,
      time: `T-${i}`
    });
  }

  return {
    n: Math.round(n * 10) / 10,
    p: Math.round(p * 10) / 10,
    k: Math.round(k * 10) / 10,
    moisture: Math.round(moisture * 10) / 10,
    timestamp: Date.now(),
    status: {
      n: n < 100 ? "Low" : n > 200 ? "High" : "Optimal",
      p: p < 100 ? "Low" : p > 200 ? "High" : "Optimal",
      k: k < 150 ? "Low" : k > 300 ? "High" : "Optimal",
      moisture: moisture < 30 ? "Low" : moisture > 70 ? "High" : "Optimal",
    },
    trend: {
      n: getTrend(),
      p: getTrend(),
      k: getTrend(),
    },
    history,
    isFallback: true,
    error: errorMsg
  };
}

export const getLiveNPK = action({
  args: {
    sheetUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Explicit simulation mode
    if (args.sheetUrl === "simulation") {
        return generateSimulationData();
    }

    // Default to the provided sheet if no URL is passed
    let SHEET_CSV_URL = args.sheetUrl || "https://docs.google.com/spreadsheets/d/1zPrbxe8NP2tovaqZLKKj0edoGIZGvjwXyZ_fbmMEefw/export?format=csv";
    
    // Helper to convert standard Google Sheet URL to CSV export URL
    if (args.sheetUrl && args.sheetUrl !== "simulation") {
       const match = args.sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
       if (match && match[1]) {
         SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
       }
    }

    try {
      const response = await fetch(SHEET_CSV_URL);
      if (!response.ok) throw new Error("Failed to fetch sheet");
      const text = await response.text();
      
      // Parse CSV
      const rows = text.split('\n').map(row => row.split(','));
      
      if (rows.length < 2) throw new Error("Sheet is empty");

      // Get headers to find indices (case insensitive)
      const headers = rows[0].map(h => h.trim().toLowerCase());
      const nIndex = headers.findIndex(h => h.includes('nitrogen'));
      const pIndex = headers.findIndex(h => h.includes('phosphorus'));
      const kIndex = headers.findIndex(h => h.includes('potassium'));
      const moistureIndex = headers.findIndex(h => h.includes('moisture') || h.includes('water'));
      const timeIndex = headers.findIndex(h => h.includes('timestamp') || h.includes('date') || h.includes('time'));
      
      if (nIndex === -1 || pIndex === -1 || kIndex === -1) {
        throw new Error("NPK columns not found in sheet");
      }

      // Collect history (last 20 points)
      const history: any[] = [];
      
      // Iterate backwards to find the latest data and history
      for (let i = rows.length - 1; i > 0; i--) {
        const row = rows[i];
        // Ensure row has enough columns and data is not empty
        if (row.length > Math.max(nIndex, pIndex, kIndex) && 
            row[nIndex]?.trim() && 
            row[pIndex]?.trim() && 
            row[kIndex]?.trim()) {
            
            const nVal = parseFloat(row[nIndex]);
            const pVal = parseFloat(row[pIndex]);
            const kVal = parseFloat(row[kIndex]);
            const moistureVal = moistureIndex !== -1 ? parseFloat(row[moistureIndex]) : undefined;
            
            let timeLabel = `Reading ${i}`;
            if (timeIndex !== -1 && row[timeIndex]) {
                // Try to format time if possible, otherwise use raw
                try {
                    const date = new Date(row[timeIndex]);
                    if (!isNaN(date.getTime())) {
                        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } else {
                        timeLabel = row[timeIndex];
                    }
                } catch (e) {
                    timeLabel = row[timeIndex];
                }
            }

            if (!isNaN(nVal) && !isNaN(pVal) && !isNaN(kVal) && nVal >= 0 && pVal >= 0 && kVal >= 0) {
                 history.unshift({
                    n: Math.round(nVal * 10) / 10,
                    p: Math.round(pVal * 10) / 10,
                    k: Math.round(kVal * 10) / 10,
                    moisture: moistureVal !== undefined ? Math.round(moistureVal * 10) / 10 : undefined,
                    time: timeLabel
                 });
            }
            
            if (history.length >= 20) break;
        }
      }

      if (history.length === 0) throw new Error("No valid data found in sheet");

      // Use the latest entry (last in history) as current
      const latest = history[history.length - 1];
      const n = latest.n;
      const p = latest.p;
      const k = latest.k;
      const moisture = latest.moisture;

      // Calculate trend if previous row exists
      let trendN: "up" | "down" = "up";
      let trendP: "up" | "down" = "up";
      let trendK: "up" | "down" = "up";

      if (history.length > 1) {
          const prev = history[history.length - 2];
          trendN = n >= prev.n ? "up" : "down";
          trendP = p >= prev.p ? "up" : "down";
          trendK = k >= prev.k ? "up" : "down";
      }

      return {
        n,
        p,
        k,
        moisture,
        timestamp: Date.now(),
        status: {
          n: n < 100 ? "Low" : n > 200 ? "High" : "Optimal",
          p: p < 100 ? "Low" : p > 200 ? "High" : "Optimal",
          k: k < 150 ? "Low" : k > 300 ? "High" : "Optimal",
          moisture: moisture !== undefined ? (moisture < 30 ? "Low" : moisture > 70 ? "High" : "Optimal") : undefined,
        },
        trend: {
          n: trendN,
          p: trendP,
          k: trendK,
        },
        history, // Return history
        isFallback: false
      };

    } catch (error: any) {
      console.error("Error fetching sheet data, falling back to simulation:", error);
      return generateSimulationData(error.message || "Failed to fetch data");
    }
  },
});